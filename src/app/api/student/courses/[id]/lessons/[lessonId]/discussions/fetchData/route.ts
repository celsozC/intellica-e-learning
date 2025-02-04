import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: params.lessonId,
        courseId: params.courseId,
      },
      include: {
        discussions: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    fullName: true,
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
        },
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("[GET_LESSON_DISCUSSIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
