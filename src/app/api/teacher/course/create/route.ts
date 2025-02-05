import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await auth();
    
    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, description, categoryId } = body;

    // Validate required fields
    if (!title || !description || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, and categoryId are required" },
        { status: 400 }
      );
    }

    // Validate category exists
    const category = await prisma.courseCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Create the course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        teacherId: teacher.id,
        categoryId,
        status: "active",
        lessonCount: 0,
        studentCount: 0,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        lessonCount: true,
        studentCount: true,
        category: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json(course);

  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}