import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: {
        lessonId: params.lessonId,
      },
      include: {
        attempts: true,
        lesson: true,
      }
    });

    const exams = await prisma.exam.findMany({
      where: {
        lessonId: params.lessonId,
      },
      include: {
        attempts: true,
        lesson: true,
      }
    });

    const formattedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      attemptCount: quiz.attempts.length,
      questionCount: (quiz.questions as any).questions.length,
    }));

    const formattedExams = exams.map(exam => ({
      ...exam,
      attemptCount: exam.attempts.length,
      questionCount: (exam.questions as any).questions.length,
    }));

    return NextResponse.json({ 
      quizzes: formattedQuizzes, 
      exams: formattedExams 
    });
  } catch (error) {
    console.error("[QUIZEXAM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}