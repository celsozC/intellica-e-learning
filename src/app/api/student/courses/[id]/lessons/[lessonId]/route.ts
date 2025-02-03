import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    // Fetch the current lesson
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: params.lessonId,
        courseId: params.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        materialUrl: true,
        sequenceOrder: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Fetch next and previous lessons
    const [prevLesson, nextLesson] = await Promise.all([
      prisma.lesson.findFirst({
        where: {
          courseId: params.id,
          sequenceOrder: {
            lt: lesson.sequenceOrder,
          },
        },
        orderBy: {
          sequenceOrder: "desc",
        },
        select: {
          id: true,
        },
      }),
      prisma.lesson.findFirst({
        where: {
          courseId: params.id,
          sequenceOrder: {
            gt: lesson.sequenceOrder,
          },
        },
        orderBy: {
          sequenceOrder: "asc",
        },
        select: {
          id: true,
        },
      }),
    ]);

    return NextResponse.json({
      lesson,
      prevLesson,
      nextLesson,
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}
