const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
  console.log('Users found:', users.length);
  users.forEach(u => console.log(' -', u.email, '|', u.name, '|', u.createdAt.toISOString()));
}
main().catch(e => console.error('Error:', e.message)).finally(() => { prisma.disconnect(); });
