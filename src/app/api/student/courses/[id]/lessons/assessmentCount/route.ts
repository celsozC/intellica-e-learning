import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: params.id
      },
      select: {
        id: true,
        title: true,
        sequenceOrder: true,
        quizzes: {
          select: {
            id: true,
            title: true,
            timeLimit: true,
            maxScore: true
          }
        },
        exams: {
          select: {
            id: true,
            title: true,
            timeLimit: true,
            maxScore: true
          }
        }
      },
      orderBy: {
        sequenceOrder: 'asc'
      }
    });

    const assessmentCounts = lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      sequenceOrder: lesson.sequenceOrder,
      quizCount: lesson.quizzes.length,
      examCount: lesson.exams.length,
      totalAssessments: lesson.quizzes.length + lesson.exams.length,
      quizzes: lesson.quizzes,
      exams: lesson.exams
    }));

    return NextResponse.json(assessmentCounts);

  } catch (error) {
    console.error("Error fetching assessment counts:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch assessment counts",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}