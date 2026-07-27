import {
  normalizePlan,
  runsAllowedForPlan,
  type PlanId,
} from "@/lib/billing/plans";

export type EntitlementInput = {
  plan: string | null | undefined;
  /** Runs already counted in the current billing/calendar month */
  runsUsedThisMonth: number;
};

export type EntitlementResult = {
  ok: boolean;
  plan: PlanId;
  runsUsedThisMonth: number;
  runsAllowed: number;
  remaining: number;
  reason?: string;
};

/**
 * Pure helper — unit-tested without DB.
 * Free: N runs/mo; Creator Pro: higher cap. Does not call Stripe.
 */
export function checkRunEntitlement(
  input: EntitlementInput,
): EntitlementResult {
  const plan = normalizePlan(input.plan);
  const runsAllowed = runsAllowedForPlan(plan);
  const used = Math.max(0, Math.floor(input.runsUsedThisMonth));
  const remaining = Math.max(0, runsAllowed - used);

  if (used >= runsAllowed) {
    return {
      ok: false,
      plan,
      runsUsedThisMonth: used,
      runsAllowed,
      remaining: 0,
      reason:
        plan === "FREE"
          ? `Free plan limit reached (${runsAllowed} runs/month). Upgrade to Creator Pro or wait until next month.`
          : `Creator Pro monthly run limit reached (${runsAllowed}).`,
    };
  }

  return {
    ok: true,
    plan,
    runsUsedThisMonth: used,
    runsAllowed,
    remaining,
  };
}

/** Start of current UTC calendar month (ms). */
export function startOfUtcMonth(nowMs: number = Date.now()): Date {
  const d = new Date(nowMs);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}
