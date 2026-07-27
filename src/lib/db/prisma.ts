/**
 * Prisma client singleton. Safe to import when DATABASE_URL is missing —
 * callers must check `isDatabaseConfigured()` before querying.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function createClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

/**
 * Lazy accessor — throws a clear error if DATABASE_URL is unset.
 * Prefer `isDatabaseConfigured()` + `dbUnavailableResponse()` in routes.
 */
export function getPrisma(): PrismaClient {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is not configured. Studio APIs require Postgres (Neon or docker-compose).",
    );
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

export function dbUnavailableResponse() {
  return Response.json(
    {
      error:
        "Studio database is not configured. Set DATABASE_URL (Neon or local Postgres) and run `npx prisma migrate deploy`.",
      code: "DATABASE_UNAVAILABLE",
    },
    { status: 503 },
  );
}
