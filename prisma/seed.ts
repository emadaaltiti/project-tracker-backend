import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: passwordHash,
    },
  });

  await prisma.project.createMany({
    data: [
      {
        title: "Initial Project",
        description: "This is a seeded project for demo user.",
        status: "active",
        userId: user.id,
      },
      {
        title: "Completed Sample",
        description: "A completed example project.",
        status: "completed",
        userId: user.id,
      },
    ],
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
