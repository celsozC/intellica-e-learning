import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate the course ID format
    if (!params?.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid course ID format" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const token = await cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find the teacher first
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: payload.id,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Find the course with all related data
    const course = await prisma.course.findFirst({
      where: {
        id: params.id,
        teacherId: teacher.id,
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            user: {
              select: {
                email: true,
              },
            },
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
            sequenceOrder: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Format the response
    const formattedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      teacherId: course.teacherId,
      lessonCount: course.lessons.length,
      studentCount: course.enrollments.length,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      teacher: {
        fullName: course.teacher.fullName,
        email: course.teacher.user.email,
      },
      lessons: course.lessons,
      students: course.enrollments.map((enrollment) => ({
        id: enrollment.student.id,
        fullName: enrollment.student.fullName,
        email: enrollment.student.user.email,
      })),
      // Placeholder empty arrays for features to be implemented
      discussions: [],
      assignments: [],
      exams: [],
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching course:", error.message);
    } else {
      console.error("Unknown error fetching course");
    }
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
