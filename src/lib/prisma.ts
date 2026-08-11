import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL ?? "";
  return Boolean(url) && !url.includes("[PASSWORD]") && !url.includes("[YOUR-PASSWORD]");
}

function createPrismaClient() {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL no está configurada. Pega la connection string de Supabase (Connect) en el archivo .env.",
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? (isDatabaseConfigured() ? createPrismaClient() : (null as unknown as PrismaClient));

if (process.env.NODE_ENV !== "production" && isDatabaseConfigured()) {
  globalForPrisma.prisma = prisma;
}
