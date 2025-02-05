import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("Received params:", params);

  if (!params?.id) {
    console.error("No course ID provided");
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log("1. Starting GET request for course ID:", params.id);

    const course = await prisma.course.findUnique({
      where: {
        id: params.id
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                email: true,
                fullName: true,
              }
            }
          }
        },
        category: true,
        enrollments: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        lessons: {
          orderBy: {
            sequenceOrder: 'asc',
          },
          include: {
            assignments: true,
            quizzes: true,
            exams: true,
            discussions: {
              include: {
                author: true,
                replies: {
                  include: {
                    author: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log("2. Course query completed");
    console.log("3. Course found:", !!course);

    if (!course) {
      console.log("4. Course not found, returning 404");
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    console.log("5. Calculating statistics");
    const statistics = {
      totalStudents: course.enrollments.length,
      totalLessons: course.lessons.length,
      totalAssignments: course.lessons.reduce(
        (sum, lesson) => sum + lesson.assignments.length, 
        0
      ),
      totalDiscussions: course.lessons.reduce(
        (sum, lesson) => sum + lesson.discussions.length, 
        0
      ),
      totalQuizzes: course.lessons.reduce(
        (sum, lesson) => sum + lesson.quizzes.length, 
        0
      ),
      totalExams: course.lessons.reduce(
        (sum, lesson) => sum + lesson.exams.length, 
        0
      )
    };

    console.log("6. Statistics calculated:", statistics);

    const responseData = {
      ...course,
      statistics
    };

    console.log("7. Sending successful response");
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("ERROR in course fetch:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      params
    });

    return NextResponse.json(
      { 
        error: "Failed to fetch course",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role.name !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Course deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { title, description, categoryId, teacherId, status } =
      await request.json();

    if (!title || !description || !categoryId || !teacherId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        title,
        description,
        categoryId,
        teacherId,
        status,
      },
      include: {
        category: true,
        teacher: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}
