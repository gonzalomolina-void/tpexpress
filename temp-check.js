import 'dotenv/config';
import prisma from './src/prisma/prismaClient.js';

async function check() {
  try {
    const users = await prisma.user.findMany({
      include: { role: true, profile: true }
    });
    console.log("USERS IN DB:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("ERROR CONNECTING TO DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
