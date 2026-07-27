/**
 * Billing plans — Free vs Creator Pro (GTM test band $19–$39).
 * Stripe wiring is optional; entitlement works without live keys.
 */

export type PlanId = "FREE" | "CREATOR_PRO";

export const PLAN_LIMITS = {
  FREE: {
    id: "FREE" as const,
    label: "Free",
    /** Analysis runs saved per calendar month (UTC) */
    runsPerMonth: 5,
    priceUsdMonthly: 0,
  },
  CREATOR_PRO: {
    id: "CREATOR_PRO" as const,
    label: "Creator Pro",
    runsPerMonth: 100,
    /** Test-mode price band from GTM — not charged without Stripe keys */
    priceUsdMonthly: 29,
  },
} as const;

export function normalizePlan(plan: string | null | undefined): PlanId {
  if (plan === "CREATOR_PRO") return "CREATOR_PRO";
  return "FREE";
}

export function runsAllowedForPlan(plan: PlanId): number {
  return PLAN_LIMITS[plan].runsPerMonth;
}
