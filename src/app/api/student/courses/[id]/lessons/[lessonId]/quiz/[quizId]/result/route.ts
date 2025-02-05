import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string; lessonId: string; quizId: string } }
) {
  try {
    const user = await auth();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the latest quiz attempt for this user
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId: params.quizId,
        studentId: user.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        quiz: {
          select: {
            title: true,
            description: true,
            maxScore: true,
            questions: true,
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: "No attempt found" }, { status: 404 });
    }

    // Format the response
    const result = {
      quizTitle: attempt.quiz.title,
      quizDescription: attempt.quiz.description,
      score: attempt.score,
      maxScore: attempt.quiz.maxScore,
      completedAt: attempt.completedAt,
      timeSpent: attempt.completedAt 
        ? Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000)
        : null,
      answers: attempt.answers,
      questions: (attempt.quiz.questions as any).questions,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching quiz result:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz result" },
      { status: 500 }
    );
  }
}