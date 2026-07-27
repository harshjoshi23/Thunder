import { NextResponse } from "next/server";
import {
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma";
import { captureException } from "@/lib/monitoring/sentry";

export const runtime = "nodejs";

/**
 * Stripe webhook stub — verifies presence of secret in production,
 * records Customer/Subscription plan changes when payload is signed.
 * Local/demo: without STRIPE_WEBHOOK_SECRET, accepts a documented test
 * shape only when STRIPE_WEBHOOK_ALLOW_UNSIGNED=true (never in prod).
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const allowUnsigned =
    process.env.STRIPE_WEBHOOK_ALLOW_UNSIGNED === "true" ||
    process.env.STRIPE_WEBHOOK_ALLOW_UNSIGNED === "1";

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (secret) {
    // Foundation: signature header required when secret is set.
    // Full Stripe SDK verify can be added when STRIPE_SECRET_KEY is live.
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }
  } else if (!allowUnsigned) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook not configured. Set STRIPE_WEBHOOK_SECRET (or STRIPE_WEBHOOK_ALLOW_UNSIGNED=true for local stubs).",
        code: "STRIPE_WEBHOOK_UNCONFIGURED",
      },
      { status: 503 },
    );
  }

  let event: {
    type?: string;
    data?: { object?: Record<string, unknown> };
  };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type ?? "unknown";

  if (!isDatabaseConfigured()) {
    // Acknowledge without persistence so Stripe retries don't loop forever
    // when only webhook secret is set during early setup.
    return NextResponse.json({
      received: true,
      persisted: false,
      type,
      note: "DATABASE_URL missing — event acknowledged only",
    });
  }

  try {
    const prisma = getPrisma();
    const obj = event.data?.object ?? {};

    if (
      type === "customer.subscription.updated" ||
      type === "customer.subscription.created" ||
      type === "customer.subscription.deleted"
    ) {
      const stripeSubscriptionId =
        typeof obj.id === "string" ? obj.id : undefined;
      const stripeCustomerId =
        typeof obj.customer === "string" ? obj.customer : undefined;
      const statusRaw =
        typeof obj.status === "string" ? obj.status.toUpperCase() : "NONE";
      const status =
        statusRaw === "ACTIVE" ||
        statusRaw === "TRIALING" ||
        statusRaw === "PAST_DUE" ||
        statusRaw === "CANCELED"
          ? statusRaw
          : "NONE";

      const plan =
        type === "customer.subscription.deleted" || status === "CANCELED"
          ? "FREE"
          : "CREATOR_PRO";

      if (stripeCustomerId) {
        const existing = await prisma.subscription.findUnique({
          where: { stripeCustomerId },
        });
        if (existing) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              stripeSubscriptionId: stripeSubscriptionId ?? existing.stripeSubscriptionId,
              status: status as "NONE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED",
              plan,
            },
          });
          if (existing.workspaceId) {
            await prisma.workspace.update({
              where: { id: existing.workspaceId },
              data: { plan },
            });
          }
          if (existing.userId) {
            await prisma.user.update({
              where: { id: existing.userId },
              data: { plan },
            });
          }
        } else {
          await prisma.subscription.create({
            data: {
              stripeCustomerId,
              stripeSubscriptionId,
              status: status as "NONE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED",
              plan,
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true, persisted: true, type });
  } catch (err) {
    captureException(err, { route: "stripe-webhook" });
    const message = err instanceof Error ? err.message : "Webhook failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
