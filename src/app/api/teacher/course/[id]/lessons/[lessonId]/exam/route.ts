import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const values = await req.json();

    // Validate required fields
    if (!values.title || !values.description || !values.questions) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        title: values.title,
        description: values.description,
        timeLimit: values.timeLimit ? Number(values.timeLimit) : null,
        maxScore: Number(values.maxScore),
        questions: values.questions,
        lessonId: params.lessonId,
      }
    });

    return NextResponse.json(exam);

  } catch (error: any) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam", details: error.message },
      { status: 500 }
    );
  }
}