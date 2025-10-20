import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
  const usuarios = await prisma.usuario.findMany();
  console.log(usuarios);
}

testPrisma().catch(console.error);