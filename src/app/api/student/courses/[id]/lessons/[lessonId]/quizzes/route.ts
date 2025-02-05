import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const user = await auth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        lessonId: params.lessonId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        maxScore: true,
        questions: true,
        createdAt: true,
        attempts: {
          where: {
            studentId: user.id
          },
          orderBy: {
            completedAt: 'desc'
          },
          take: 1,
          select: {
            id: true,
            score: true,
            completedAt: true,
          }
        },
        _count: {
          select: {
            attempts: {
              where: {
                studentId: user.id
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transform the response to include question count and attempt data
    const formattedQuizzes = quizzes.map(quiz => {
      const questionsData = quiz.questions as any;
      const questionCount = questionsData?.questions?.length || 0;
      const latestAttempt = quiz.attempts[0] || null;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        maxScore: quiz.maxScore,
        questionCount,
        attemptCount: quiz._count.attempts,
        createdAt: quiz.createdAt,
        latestAttempt: latestAttempt ? {
          id: latestAttempt.id,
          score: latestAttempt.score,
          completedAt: latestAttempt.completedAt
        } : undefined
      };
    });

    return NextResponse.json(formattedQuizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}