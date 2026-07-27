import type { Plan, PrismaClient } from "@prisma/client";
import {
  checkRunEntitlement,
  startOfUtcMonth,
} from "@/lib/billing/entitlement";
import { countCommentLines } from "@/lib/studio/csv";

const MAX_RESULT_JSON = 900_000;

export async function countWorkspaceRunsThisMonth(
  prisma: PrismaClient,
  workspaceId: string,
  nowMs: number = Date.now(),
): Promise<number> {
  const since = startOfUtcMonth(nowMs);
  return prisma.analysisRun.count({
    where: {
      project: { workspaceId },
      createdAt: { gte: since },
    },
  });
}

export async function assertCanSaveRun(
  prisma: PrismaClient,
  workspaceId: string,
  plan: Plan,
) {
  const used = await countWorkspaceRunsThisMonth(prisma, workspaceId);
  const entitlement = checkRunEntitlement({
    plan,
    runsUsedThisMonth: used,
  });
  return entitlement;
}

export function truncateResultJson(result: unknown): string {
  const raw = JSON.stringify(result);
  if (raw.length <= MAX_RESULT_JSON) return raw;
  return JSON.stringify({
    truncated: true,
    preview: raw.slice(0, 40_000),
    note: "Result exceeded storage budget; stored preview only.",
  });
}

export async function listProjects(
  prisma: PrismaClient,
  workspaceId: string,
) {
  return prisma.project.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { runs: true, drafts: true } },
      brandKit: { select: { id: true, name: true } },
      audienceTwin: { select: { id: true, name: true, version: true } },
    },
  });
}

export async function createProject(
  prisma: PrismaClient,
  workspaceId: string,
  input: {
    title: string;
    creatorContext?: string;
    brandKitId?: string | null;
    draftBody?: string;
  },
) {
  return prisma.project.create({
    data: {
      workspaceId,
      title: input.title.trim() || "Untitled project",
      creatorContext: input.creatorContext?.trim() ?? "",
      brandKitId: input.brandKitId ?? null,
      drafts: input.draftBody
        ? {
            create: {
              label: "original",
              body: input.draftBody,
              isOptimized: false,
            },
          }
        : undefined,
    },
    include: {
      drafts: true,
      _count: { select: { runs: true } },
    },
  });
}

export async function getProjectForWorkspace(
  prisma: PrismaClient,
  workspaceId: string,
  projectId: string,
) {
  return prisma.project.findFirst({
    where: { id: projectId, workspaceId },
    include: {
      drafts: { orderBy: { createdAt: "desc" } },
      runs: { orderBy: { createdAt: "desc" }, take: 50 },
      brandKit: true,
      audienceTwin: true,
    },
  });
}

export async function saveAnalysisRun(
  prisma: PrismaClient,
  args: {
    workspaceId: string;
    projectId: string;
    plan: Plan;
    mode: string;
    confidence?: string | null;
    result: unknown;
    meta?: unknown;
    draftBody?: string;
    optimizedBody?: string;
  },
) {
  const project = await prisma.project.findFirst({
    where: { id: args.projectId, workspaceId: args.workspaceId },
  });
  if (!project) {
    return { ok: false as const, status: 404 as const, error: "Project not found" };
  }

  const entitlement = await assertCanSaveRun(
    prisma,
    args.workspaceId,
    args.plan,
  );
  if (!entitlement.ok) {
    return {
      ok: false as const,
      status: 402 as const,
      error: entitlement.reason ?? "Plan limit reached",
      entitlement,
    };
  }

  const draft =
    args.draftBody != null
      ? await prisma.draftVersion.create({
          data: {
            projectId: project.id,
            label: "original",
            body: args.draftBody,
            isOptimized: false,
          },
        })
      : null;

  if (args.optimizedBody) {
    await prisma.draftVersion.create({
      data: {
        projectId: project.id,
        label: "optimized",
        body: args.optimizedBody,
        isOptimized: true,
      },
    });
  }

  const run = await prisma.analysisRun.create({
    data: {
      projectId: project.id,
      draftVersionId: draft?.id ?? null,
      mode: args.mode,
      confidence: args.confidence ?? null,
      resultJson: truncateResultJson(args.result),
      metaJson: JSON.stringify(args.meta ?? {}),
    },
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { updatedAt: new Date() },
  });

  return { ok: true as const, run, entitlement };
}

export async function upsertTwinFromRun(
  prisma: PrismaClient,
  args: {
    workspaceId: string;
    projectId?: string;
    analysisRunId?: string;
    name?: string;
    segments: unknown;
    sourceId?: string | null;
  },
) {
  const segmentsJson = JSON.stringify(args.segments);
  const name = args.name?.trim() || "Audience twin";

  if (args.analysisRunId) {
    const existing = await prisma.audienceTwin.findUnique({
      where: { analysisRunId: args.analysisRunId },
    });
    if (existing && existing.workspaceId === args.workspaceId) {
      const updated = await prisma.audienceTwin.update({
        where: { id: existing.id },
        data: {
          name,
          segmentsJson,
          version: existing.version + 1,
          sourceId: args.sourceId ?? existing.sourceId,
        },
      });
      if (args.projectId) {
        await prisma.project.updateMany({
          where: { id: args.projectId, workspaceId: args.workspaceId },
          data: { audienceTwinId: updated.id },
        });
      }
      return updated;
    }
  }

  const twin = await prisma.audienceTwin.create({
    data: {
      workspaceId: args.workspaceId,
      name,
      segmentsJson,
      analysisRunId: args.analysisRunId ?? null,
      sourceId: args.sourceId ?? null,
      version: 1,
    },
  });

  if (args.projectId) {
    await prisma.project.updateMany({
      where: { id: args.projectId, workspaceId: args.workspaceId },
      data: { audienceTwinId: twin.id },
    });
  }

  return twin;
}

export async function importCsvSource(
  prisma: PrismaClient,
  args: {
    workspaceId: string;
    name: string;
    content: string;
    originLabel?: string;
  },
) {
  const commentCount = countCommentLines(args.content);
  return prisma.audienceSource.create({
    data: {
      workspaceId: args.workspaceId,
      name: args.name.trim() || "CSV import",
      kind: "csv",
      content: args.content,
      originLabel: args.originLabel ?? null,
      commentCount,
    },
  });
}
