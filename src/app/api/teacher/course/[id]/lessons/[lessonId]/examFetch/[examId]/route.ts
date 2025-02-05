import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string; lessonId: string; examId: string } }
) {
  try {
    console.log("=== Exam Fetch Debug Log ===");
    console.log("1. Request URL:", req.url);
    console.log("2. All Params:", params);
    console.log("3. Course ID:", params.id);
    console.log("4. Lesson ID:", params.lessonId);
    console.log("5. Exam ID:", params.examId);

    if (!params.examId || !params.lessonId) {
      console.log("6. Error: Missing parameters");
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    console.log("7. Executing prisma query for exam:", params.examId);

    const exam = await prisma.exam.findFirst({
      where: {
        id: params.examId,
        lessonId: params.lessonId
      }
    });

    console.log("8. Query result:", exam ? "Exam found" : "Exam not found");
    if (exam) {
      console.log("9. Exam details:", {
        id: exam.id,
        title: exam.title,
        lessonId: exam.lessonId
      });
    }

    if (!exam) {
      console.log("10. Error: Exam not found");
      return new NextResponse("Exam not found", { status: 404 });
    }

    console.log("11. Successfully returning exam data");
    return NextResponse.json(exam);

  } catch (error) {
    console.error("=== Error Debug Log ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch exam",
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
  { params }: { params: { id: string; lessonId: string; examId: string } }
) {
  try {
    console.log("=== Exam Delete Debug Log ===");
    console.log("1. Attempting to delete exam:", params.examId);

    const exam = await prisma.exam.delete({
      where: {
        id: params.examId,
      },
    });

    console.log("2. Exam deleted successfully:", exam.id);
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("=== Delete Error Debug Log ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error?.message);
    
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to delete exam",
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