import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string; lessonId: string; quizId: string } }
) {
  try {
    const { id: courseId, lessonId, quizId } = params;
    
    // Log all incoming parameters
    console.log("=== Quiz Fetch Debug Log ===");
    console.log("1. Request URL:", req.url);
    console.log("2. All Params:", params);
    console.log("3. Course ID:", courseId);
    console.log("4. Lesson ID:", lessonId);
    console.log("5. Quiz ID:", quizId);

    if (!quizId || !lessonId) {
      console.log("6. Error: Missing parameters");
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // Log the query we're about to make
    console.log("7. Executing prisma query with:", {
      quizId,
      lessonId,
      query: {
        where: {
          id: quizId,
          lessonId: lessonId
        }
      }
    });

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        lessonId: lessonId
      }
    });

    // Log the query result
    console.log("8. Query result:", quiz ? "Quiz found" : "Quiz not found");
    if (quiz) {
      console.log("9. Quiz details:", {
        id: quiz.id,
        title: quiz.title,
        lessonId: quiz.lessonId
      });
    }

    if (!quiz) {
      console.log("10. Error: Quiz not found");
      return new NextResponse("Quiz not found", { status: 404 });
    }

    console.log("11. Successfully returning quiz data");
    return NextResponse.json(quiz);

  } catch (error) {
    // Log any errors in detail
    console.error("=== Error Debug Log ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch quiz",
        details: error?.message 
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; lessonId: string; quizId: string } }
) {
  try {
    console.log("=== Quiz Delete Debug Log ===");
    console.log("1. Attempting to delete quiz:", params.quizId);

    // Check if quiz exists before deleting
    const existingQuiz = await prisma.quiz.findUnique({
      where: {
        id: params.quizId,
      },
    });

    if (!existingQuiz) {
      console.log("2. Quiz not found for deletion");
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Delete the quiz
    const quiz = await prisma.quiz.delete({
      where: {
        id: params.quizId,
      },
    });

    console.log("3. Quiz deleted successfully:", quiz.id);
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("=== Delete Error Debug Log ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to delete quiz",
        details: error?.message 
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