import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(
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

    const { examId, lessonId } = params;

    // Check if user has already taken this exam
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId: examId,
        studentId: user.id,
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        { error: "You have already taken this exam" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { answers } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: "Invalid answers format" },
        { status: 400 }
      );
    }

    // Fetch the exam with all details
    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
        lessonId: lessonId,
      },
      select: {
        id: true,
        title: true,
        maxScore: true,
        questions: true,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    // Get the questions array from the nested structure
    const questionsData = (exam.questions as any).questions || [];

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    const questionResults = questionsData.map((q: any) => {
      const studentAnswer = answers[q.id];
      const isCorrect = studentAnswer === q.correctAnswer;
      if (isCorrect) {
        correctAnswers++;
        totalPoints += q.points;
      }
      return {
        questionId: q.id,
        studentAnswer: studentAnswer || null,
        correct: isCorrect,
        points: isCorrect ? q.points : 0
      };
    });

    // Create exam attempt record
    const attempt = await prisma.examAttempt.create({
      data: {
        examId: examId,
        studentId: user.id,
        score: totalPoints,
        answers: questionResults,
        completedAt: new Date(),
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score: totalPoints,
      maxScore: exam.maxScore,
      correctAnswers,
      totalQuestions: questionsData.length,
      questions: questionResults,
    });

  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}