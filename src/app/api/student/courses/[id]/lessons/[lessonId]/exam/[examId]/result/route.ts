import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string; lessonId: string; examId: string } }
) {
  try {
    const user = await auth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { examId } = params;

    // Fetch the exam attempt with exam details
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        examId: examId,
        studentId: user.id,
      },
      include: {
        exam: {
          select: {
            title: true,
            description: true,
            maxScore: true,
            questions: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "No attempt found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: attempt.id,
      score: attempt.score,
      maxScore: attempt.exam.maxScore,
      examTitle: attempt.exam.title,
      examDescription: attempt.exam.description,
      completedAt: attempt.completedAt,
      answers: attempt.answers,
      questions: attempt.exam.questions,
    });

  } catch (error) {
    console.error("Error fetching exam result:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam result" },
      { status: 500 }
    );
  }
}