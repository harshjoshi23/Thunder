import { NextResponse } from "next/server";
import {
  dbUnavailableResponse,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma";
import { resolveStudioSession } from "@/lib/studio/session";
import { countWorkspaceRunsThisMonth } from "@/lib/studio/service";
import { checkRunEntitlement } from "@/lib/billing/entitlement";
import { PLAN_LIMITS } from "@/lib/billing/plans";
import { unauthorizedResponse } from "@/lib/security/auth";

export const runtime = "nodejs";

/**
 * Current plan entitlement for the workspace (no Stripe required).
 */
export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const used = await countWorkspaceRunsThisMonth(
    prisma,
    session.session.workspaceId,
  );
  const entitlement = checkRunEntitlement({
    plan: session.session.plan,
    runsUsedThisMonth: used,
  });

  return NextResponse.json({
    entitlement,
    plans: PLAN_LIMITS,
    stripeConfigured: Boolean(
      process.env.STRIPE_SECRET_KEY?.trim() &&
        process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    ),
  });
}
