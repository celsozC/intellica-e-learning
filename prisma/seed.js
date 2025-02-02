const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create default roles
  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: "ADMIN",
      },
    }),
    prisma.role.create({
      data: {
        name: "TEACHER",
      },
    }),
    prisma.role.create({
      data: {
        name: "STUDENT",
      },
    }),
  ]);

  console.log({ roles });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
