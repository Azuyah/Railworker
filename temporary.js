const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './.env' }); // or adjust path if needed

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@railworker.com' } });
  console.log('🧾 Found user role:', user.role);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });