import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

export async function connectDatabase() {
  await prisma.$connect();
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export async function getDatabaseHealth() {
  const startedAt = Date.now();
  await prisma.$queryRaw`SELECT 1`;

  return {
    connected: true,
    latencyMs: Date.now() - startedAt
  };
}

