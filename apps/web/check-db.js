const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  const workspaces = await prisma.workspace.findMany();
  console.log('Users:', JSON.stringify(users, null, 2));
  console.log('Workspaces:', JSON.stringify(workspaces, null, 2));
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
