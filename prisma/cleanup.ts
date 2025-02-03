import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Delete all records from related models first
    await prisma.courseEnrollment.deleteMany({});
    await prisma.quizAttempt.deleteMany({});
    await prisma.submission.deleteMany({});

    // Then delete the main records
    await prisma.student.deleteMany({
      where: {
        userId: {
          equals: undefined,
        },
      },
    });

    await prisma.teacher.deleteMany({
      where: {
        userId: {
          equals: undefined,
        },
      },
    });

    await prisma.admin.deleteMany({
      where: {
        userId: {
          equals: undefined,
        },
      },
    });

    console.log("Cleanup completed successfully");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
