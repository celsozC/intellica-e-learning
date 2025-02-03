import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function getCurrentUser() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      include: { role: true },
    });

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function calculateCourseProgress(courseId: string, studentId: string) {
  // Get total lessons count
  const totalLessons = await prisma.lesson.count({
    where: { courseId },
  });

  if (totalLessons === 0) return 0;

  // Get completed lessons count (submitted tasks)
  const completedLessons = await prisma.submission.count({
    where: {
      lesson: { courseId },
      studentId,
      status: "APPROVED", // Only count approved submissions
    },
  });

  // Calculate progress percentage
  return Math.round((completedLessons / totalLessons) * 100);
}

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const courseId = await Promise.resolve(context.params.id);

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        studentId: student.id,
      },
    });

    if (enrollment) {
      // Update progress if enrolled
      const currentProgress = await calculateCourseProgress(
        courseId,
        student.id
      );

      if (currentProgress !== enrollment.progress) {
        await prisma.courseEnrollment.update({
          where: { id: enrollment.id },
          data: {
            progress: currentProgress,
            lastAccessedAt: new Date(),
            // If progress is 100%, set completedAt
            completedAt:
              currentProgress === 100 ? new Date() : enrollment.completedAt,
          },
        });
      }
    }

    const updatedEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        studentId: student.id,
      },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            lessons: {
              select: {
                id: true,
                title: true,
                sequenceOrder: true,
              },
              orderBy: {
                sequenceOrder: "asc",
              },
            },
          },
        },
        student: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      isEnrolled: !!updatedEnrollment,
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check enrollment status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const courseId = await Promise.resolve(context.params.id);

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        studentId: student.id,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Calculate initial progress
    const initialProgress = await calculateCourseProgress(courseId, student.id);

    // Create enrollment with calculated progress
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        studentId: student.id,
        status: "ACTIVE",
        progress: initialProgress,
        lastAccessedAt: new Date(),
        enrollmentDate: new Date(),
        completedAt: null,
      },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            lessons: {
              select: {
                id: true,
                title: true,
                sequenceOrder: true,
              },
              orderBy: {
                sequenceOrder: "asc",
              },
            },
          },
        },
        student: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // Update course student count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        studentCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      enrollment,
      message: "Successfully enrolled in the course",
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to process enrollment" },
      { status: 500 }
    );
  }
}
