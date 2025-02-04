import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is a teacher
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || user.role !== "teacher") {
      return new NextResponse("Unauthorized: Teachers only", { status: 403 });
    }

    // Verify the lesson exists and belongs to the course
    const lesson = await db.lesson.findFirst({
      where: {
        id: params.lessonId,
        courseId: params.courseId,
      },
      include: {
        course: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    // Verify the teacher owns the course
    if (lesson.course.teacher.userId !== userId) {
      return new NextResponse("Unauthorized: Not your course", { status: 403 });
    }

    const { title, content } = await req.json();

    const discussion = await db.discussion.create({
      data: {
        title,
        content,
        lessonId: params.lessonId,
        authorId: userId,
      },
      include: {
        author: true,
        lesson: {
          include: {
            course: {
              include: {
                teacher: true,
                category: true,
              },
            },
          },
        },
        replies: {
          include: {
            author: true,
          },
        },
      },
    });

    return NextResponse.json({ discussion });
  } catch (error) {
    console.error("[DISCUSSIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    // First verify the lesson exists and belongs to the course
    const lesson = await db.lesson.findFirst({
      where: {
        id: params.lessonId,
        courseId: params.courseId,
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    const discussions = await db.discussion.findMany({
      where: {
        lessonId: params.lessonId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
          },
        },
        lesson: {
          include: {
            course: {
              include: {
                teacher: true,
                category: true,
              },
            },
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      discussions,
      lesson,
    });
  } catch (error) {
    console.error("[DISCUSSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
