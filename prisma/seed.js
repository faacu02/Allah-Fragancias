import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('secreto123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mirage.com' },
    update: {},
    create: {
      email: 'admin@mirage.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'admin',
    },
  });

  console.log('Seed ejecutado. Admin por defecto:', admin.email, 'con la contraseña: secreto123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
