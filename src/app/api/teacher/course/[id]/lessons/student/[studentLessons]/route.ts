import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { id: string; studentLessons: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token.value);

    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { role: true },
    });

    if (!user || user.role.name !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: courseId, studentLessons: studentId } = params;

    // Get lessons with submissions for the specific student and course
    const lessonsWithSubmissions = await prisma.lesson.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        assignments: {
          include: {
            submissions: {
              where: {
                studentId: studentId,
              },
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
          },
        },
        quizzes: {
          include: {
            submissions: {
              where: {
                studentId: studentId,
              },
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
          },
        },
        discussions: {
          include: {
            posts: {
              where: {
                studentId: studentId,
              },
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
          },
        },
      },
      orderBy: {
        sequenceOrder: "asc",
      },
    });

    // Format the response
    const formattedLessons = lessonsWithSubmissions.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      sequenceOrder: lesson.sequenceOrder,
      assignments: lesson.assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        submissions: assignment.submissions.map((submission) => ({
          id: submission.id,
          submittedAt: submission.submittedAt,
          status: submission.status,
          grade: submission.grade,
          studentName: submission.student.user.fullName,
        })),
      })),
      quizzes: lesson.quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        submissions: quiz.submissions.map((submission) => ({
          id: submission.id,
          submittedAt: submission.submittedAt,
          score: submission.score,
          studentName: submission.student.user.fullName,
        })),
      })),
      discussions: lesson.discussions.map((discussion) => ({
        id: discussion.id,
        title: discussion.title,
        posts: discussion.posts.map((post) => ({
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          studentName: post.student.user.fullName,
        })),
      })),
    }));

    // Get student details
    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      student: {
        id: student.id,
        fullName: student.user.fullName,
        email: student.user.email,
      },
      lessons: formattedLessons,
    });
  } catch (error) {
    console.error("Error fetching student lessons:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch student lessons",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
