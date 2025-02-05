import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string; lessonId: string; quizId: string } }
) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: params.quizId,
        lessonId: params.lessonId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        maxScore: true,
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Transform the questions to remove correctAnswer and points
    const sanitizedQuestions = (quiz.questions as any).questions.map((q: any) => ({
      id: q.id,
      text: q.question, // Changed from text to question to match your schema
      options: q.options,
      type: q.type
    }));

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      maxScore: quiz.maxScore,
      questions: sanitizedQuestions
    });

  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}