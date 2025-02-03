import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacher: {
          select: {
            fullName: true,
            specialization: true,
            bio: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include counts
    const transformedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      teacher: course.teacher,
      lessonCount: course._count.lessons,
      studentCount: course._count.enrollments,
      createdAt: course.createdAt,
    }));

    return NextResponse.json({
      courses: transformedCourses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch courses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
