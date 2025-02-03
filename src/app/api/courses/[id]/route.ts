import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
            bio: true,
            gender: true,
          },
        },
        lessons: {
          orderBy: {
            sequenceOrder: "asc",
          },
          select: {
            id: true,
            title: true,
            description: true,
            content: true,
            materialUrl: true,
            sequenceOrder: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Transform the data to match the expected format
    const transformedCourse = {
      ...course,
      lessonCount: course._count.lessons,
      studentCount: course._count.enrollments,
    };

    // Remove the _count field from the response
    const { _count, ...courseWithoutCount } = transformedCourse;

    return NextResponse.json({
      course: courseWithoutCount,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch course",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
