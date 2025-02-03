import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // First get the teacher
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: payload.id,
      },
    });

    if (!teacher) {
      console.log("No teacher found for userId:", payload.id);
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    console.log("Found teacher:", teacher.id);

    // Then get all courses and related data for this teacher
    const teacherCourses = await prisma.course.findMany({
      where: {
        teacherId: teacher.id, // Use teacher.id instead of payload.id
      },
      include: {
        enrollments: {
          include: {
            student: true,
          },
        },
        lessons: true,
        teacher: {
          select: {
            fullName: true,
            id: true,
          },
        },
      },
    });

    console.log(
      `Found ${teacherCourses.length} courses for teacher ${teacher.id}`
    );

    // Calculate statistics
    const stats = {
      totalCourses: teacherCourses.length,
      courseDetails: teacherCourses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        enrolledStudents: course.enrollments.length,
        totalLessons: course.lessons.length,
        status: course.status,
        createdAt: course.createdAt.toISOString(),
      })),
      totalStudents: new Set(
        teacherCourses.flatMap((course) =>
          course.enrollments.map((enrollment) => enrollment.studentId)
        )
      ).size,
      totalLessons: teacherCourses.reduce(
        (acc, course) => acc + course.lessons.length,
        0
      ),
      recentEnrollments: teacherCourses
        .flatMap((course) =>
          course.enrollments.map((enrollment) => ({
            courseTitle: course.title,
            studentName: enrollment.student.fullName,
            enrollmentDate: enrollment.enrollmentDate.toISOString(),
            status: enrollment.status,
          }))
        )
        .sort(
          (a, b) =>
            new Date(b.enrollmentDate).getTime() -
            new Date(a.enrollmentDate).getTime()
        )
        .slice(0, 5),
    };

    console.log("Calculated stats:", {
      coursesCount: stats.totalCourses,
      studentsCount: stats.totalStudents,
      lessonsCount: stats.totalLessons,
      recentEnrollmentsCount: stats.recentEnrollments.length,
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard statistics",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
