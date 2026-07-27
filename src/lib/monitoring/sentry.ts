/**
 * Optional Sentry wiring.
 * Set SENTRY_DSN to enable. Full @sentry/nextjs instrumentation can be added
 * later; this stub captures to console and is safe when DSN is unset.
 */

export function isSentryConfigured(): boolean {
  return Boolean(process.env.SENTRY_DSN?.trim());
}

export function captureException(
  err: unknown,
  context?: Record<string, string | number | boolean | undefined>,
): void {
  if (!isSentryConfigured()) return;

  const message = err instanceof Error ? err.message : String(err);
  console.error("[sentry]", message, context ?? {});
  // Install @sentry/nextjs and call Sentry.captureException when ready for
  // production error monitoring. DSN is already documented in .env.example.
}

export function captureMessage(
  message: string,
  context?: Record<string, string | number | boolean | undefined>,
): void {
  if (!isSentryConfigured()) return;
  console.error("[sentry]", message, context ?? {});
}
