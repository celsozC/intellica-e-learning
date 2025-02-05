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

    // Check if user has already taken this exam
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId: params.examId,
        studentId: user.id,
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        { error: "You have already taken this exam" },
        { status: 403 }
      );
    }

    const exam = await prisma.exam.findUnique({
      where: {
        id: params.examId,
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
        updatedAt: true,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    // Transform the questions to remove correctAnswer and points
    const questionsData = (exam.questions as any).questions || [];
    const sanitizedQuestions = questionsData.map((q: any) => ({
      id: q.id,
      text: q.question,
      type: q.type,
      options: q.options || [],
    }));

    return NextResponse.json({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      timeLimit: exam.timeLimit,
      maxScore: exam.maxScore,
      questions: sanitizedQuestions,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt
    });

  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const { answers } = body;

    // Fetch the exam with all details
    const exam = await prisma.exam.findUnique({
      where: {
        id: params.examId,
        lessonId: params.lessonId,
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
        question: q.question,
        studentAnswer: studentAnswer || null,
        correctAnswer: q.correctAnswer,
        correct: isCorrect,
        points: isCorrect ? q.points : 0,
        maxPoints: q.points
      };
    });

    // Create exam attempt record
    const attempt = await prisma.examAttempt.create({
      data: {
        score: totalPoints,
        studentId: user.id,
        examId: params.examId,
        answers: questionResults,
        completedAt: new Date(),
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      score: totalPoints,
      maxScore: exam.maxScore,
      attemptId: attempt.id,
      correctAnswers,
      totalQuestions: questionsData.length,
      questions: questionResults
    });

  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}