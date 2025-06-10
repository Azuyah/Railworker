const { PrismaClient } = require('./backend/generated/prisma/client'); // ✅ Local generated client
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { email: 'admin@railworker.com' },
    data: { role: 'HTSM' },
  });

  console.log('✅ Updated user:', updated);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());