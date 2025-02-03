const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanup() {
  try {
    console.log("Starting cleanup...");

    // Delete all records from related models first
    console.log("Cleaning up CourseEnrollments...");
    await prisma.courseEnrollment.deleteMany({});

    console.log("Cleaning up QuizAttempts...");
    await prisma.quizAttempt.deleteMany({});

    console.log("Cleaning up Submissions...");
    await prisma.submission.deleteMany({});

    // Then delete the main records
    console.log("Cleaning up Students...");
    await prisma.student.deleteMany({
      where: {
        userId: {
          equals: undefined,
        },
      },
    });

    console.log("Cleaning up Teachers...");
    await prisma.teacher.deleteMany({
      where: {
        userId: {
          equals: undefined,
        },
      },
    });

    console.log("Cleaning up Admins...");
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
