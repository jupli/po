
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  const products = await prisma.product.findMany()
  console.log('Products count:', products.length)
  console.log('Products:', products.map((p: any) => p.name))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
