import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string; lessonId: string; quizId: string } }
) {
  try {
    const user = await auth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { answers } = body;

    // Fetch the quiz with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: params.quizId,
        lessonId: params.lessonId,
      },
      select: {
        id: true,
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

    // Get the questions array from the nested structure
    const questionsData = (quiz.questions as any).questions || [];

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    const questionResults = questionsData.map((q: any) => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) {
        correctAnswers++;
        totalPoints += q.points || 0;
      }
      return {
        questionId: q.id,
        studentAnswer: answers[q.id],
        correct: isCorrect,
        points: isCorrect ? q.points : 0
      };
    });

    // Create quiz attempt record with the authenticated user's ID
    const attempt = await prisma.quizAttempt.create({
      data: {
        score: totalPoints,
        studentId: user.id,
        quizId: params.quizId,
        answers: questionResults,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      score: totalPoints,
      maxScore: quiz.maxScore,
      attemptId: attempt.id,
      correctAnswers,
      totalQuestions: questionsData.length
    });

  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}