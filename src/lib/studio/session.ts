/**
 * Studio session / workspace resolution.
 *
 * - Clerk userId when present
 * - Bearer THUNDER_API_TOKEN → apiSubject "api-token"
 * - Open / missing auth → local "dev" workspace stub (personal product path)
 */

import type { Plan, PrismaClient } from "@prisma/client";
import { requireApiAuth } from "@/lib/security/auth";

export type StudioAuthVia =
  | "clerk"
  | "api_token"
  | "seeded"
  | "open"
  | "dev_stub";

export type StudioSession = {
  userId: string;
  workspaceId: string;
  plan: Plan;
  via: StudioAuthVia;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "workspace";
}

/**
 * Ensure a User + personal Workspace exist for the given identity.
 */
export async function ensurePersonalWorkspace(
  prisma: PrismaClient,
  identity: {
    clerkId?: string;
    apiSubject?: string;
    email?: string;
    displayName?: string;
  },
): Promise<StudioSession> {
  const clerkId = identity.clerkId?.trim() || undefined;
  const apiSubject = identity.apiSubject?.trim() || undefined;

  let user =
    (clerkId
      ? await prisma.user.findUnique({ where: { clerkId } })
      : null) ??
    (apiSubject
      ? await prisma.user.findUnique({ where: { apiSubject } })
      : null);

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkId ?? null,
        apiSubject: apiSubject ?? (clerkId ? null : "dev-local"),
        email: identity.email ?? null,
        displayName: identity.displayName ?? "Creator",
        plan: "FREE",
      },
    });
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  if (membership) {
    return {
      userId: user.id,
      workspaceId: membership.workspaceId,
      plan: membership.workspace.plan,
      via: clerkId ? "clerk" : apiSubject === "api-token" ? "api_token" : "dev_stub",
    };
  }

  const baseSlug = slugify(
    identity.displayName || identity.email || clerkId || apiSubject || "personal",
  );
  let slug = baseSlug;
  let n = 0;
  while (await prisma.workspace.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: identity.displayName
        ? `${identity.displayName}'s workspace`
        : "Personal workspace",
      slug,
      plan: user.plan,
      members: {
        create: { userId: user.id, role: "OWNER" },
      },
    },
  });

  return {
    userId: user.id,
    workspaceId: workspace.id,
    plan: workspace.plan,
    via: clerkId ? "clerk" : apiSubject === "api-token" ? "api_token" : "dev_stub",
  };
}

/**
 * Resolve Studio session from the incoming request.
 * When auth is configured, requires Clerk or API token.
 * When unset, uses a durable local "dev" identity.
 */
export async function resolveStudioSession(
  prisma: PrismaClient,
  request: Request,
): Promise<
  | { ok: true; session: StudioSession }
  | { ok: false; status: 401; error: string }
> {
  const auth = await requireApiAuth(request);

  if (!auth.ok) {
    return { ok: false, status: 401, error: auth.error };
  }

  if (auth.via === "clerk" && auth.userId) {
    const session = await ensurePersonalWorkspace(prisma, {
      clerkId: auth.userId,
      displayName: "Creator",
    });
    return { ok: true, session: { ...session, via: "clerk" } };
  }

  if (auth.via === "api_token") {
    const session = await ensurePersonalWorkspace(prisma, {
      apiSubject: "api-token",
      displayName: "API user",
    });
    return { ok: true, session: { ...session, via: "api_token" } };
  }

  // open / seeded — personal product local stub
  const session = await ensurePersonalWorkspace(prisma, {
    apiSubject: "dev-local",
    displayName: "Local creator",
  });
  return { ok: true, session: { ...session, via: "dev_stub" } };
}
