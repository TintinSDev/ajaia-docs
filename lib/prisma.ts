import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function ensureDatabase() {
  if (process.env.NODE_ENV === "production") {
    const tmpDbPath = "/tmp/dev.db";
    const localDbPath = path.join(process.cwd(), "prisma", "dev.db");

    // Copy the seeded build-time DB to /tmp if it doesn't exist yet
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(localDbPath)) {
        fs.copyFileSync(localDbPath, tmpDbPath);
      } else {
        // Fallback empty file
        fs.writeFileSync(tmpDbPath, "");
      }
    }
    process.env.DATABASE_URL = "file:/tmp/dev.db";
  }
}

ensureDatabase();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
