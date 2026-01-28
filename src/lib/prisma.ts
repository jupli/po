import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "mongodb+srv://jupli503:jupli123@cluster0.toef1.mongodb.net/modulPO?appName=Cluster0"
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
