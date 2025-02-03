import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Request body:", body);

    const { title, description, categoryId, teacherId } = body;

    if (!title || !description || !categoryId || !teacherId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        categoryId,
        teacherId,
      },
    });

    return NextResponse.json({
      success: true,
      id: course.id,
      title: course.title,
      description: course.description,
      categoryId: course.categoryId,
      teacherId: course.teacherId,
    });
  } catch (error) {
    console.error("Error details:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create course",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
