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

    const exams = await prisma.exam.findMany({
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
    const formattedExams = exams.map(exam => {
      const questionsData = exam.questions as any;
      const questionCount = questionsData?.questions?.length || 0;
      const latestAttempt = exam.attempts[0] || null;

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        timeLimit: exam.timeLimit,
        maxScore: exam.maxScore,
        questionCount,
        attemptCount: exam._count.attempts,
        createdAt: exam.createdAt,
        latestAttempt: latestAttempt ? {
          id: latestAttempt.id,
          score: latestAttempt.score,
          completedAt: latestAttempt.completedAt
        } : undefined
      };
    });

    return NextResponse.json(formattedExams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}