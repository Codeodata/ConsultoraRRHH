import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function test() {
  const email = "test@test.com";
  const password = "123456";

  // 1. Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email }
  });

  console.log("USER:", user);

  if (!user) {
    console.log("❌ Usuario no encontrado");
    return;
  }

  // 2. Comparar password
  const isValid = await bcrypt.compare(password, user.password);

  console.log("PASSWORD MATCH:", isValid);

  if (!isValid) {
    console.log("❌ Password incorrecta");
  } else {
    console.log("✅ Login OK");
  }
}

test();
