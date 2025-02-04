import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const courseId = params.id; // Extract ID at the start

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const sequenceOrder = parseInt(formData.get("sequenceOrder") as string);
    const file = formData.get("file") as File | null;

    // Get course and verify teacherId
    const course = await prisma.course.findUnique({
      where: {
        id: courseId, // Use extracted ID
      },
      select: {
        teacherId: true,
      },
    });

    if (!course?.teacherId) {
      return NextResponse.json(
        { error: "Course teacher not found" },
        { status: 404 }
      );
    }

    // Get teacher and their associated user
    const teacher = await prisma.teacher.findUnique({
      where: {
        id: course.teacherId,
      },
      include: {
        user: true, // Include the user relation
      },
    });

    if (!teacher?.user?.id) {
      return NextResponse.json(
        { error: "Teacher user not found" },
        { status: 404 }
      );
    }

    // Create lesson with proper schema
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        content,
        sequenceOrder,
        courseId: courseId, // Use extracted ID
        materialUrl: null,
      },
    });

    // Create discussion with proper schema
    const discussion = await prisma.discussion.create({
      data: {
        title: `Discussion: ${title}`,
        content: `Welcome to the discussion section for ${title}. Feel free to ask questions and share your thoughts about this lesson.`,
        lessonId: lesson.id,
        authorId: teacher.user.id, // Use the teacher's user ID
      },
    });

    // Handle file upload if exists
    if (file) {
      const uploadsDir = path.join(process.cwd(), "public/uploads/lessons");

      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${uniqueSuffix}-${safeFileName}`;
      const filePath = path.join(uploadsDir, filename);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Update lesson with material URL
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { materialUrl: `/uploads/lessons/${filename}` },
      });

      lesson.materialUrl = `/uploads/lessons/${filename}`;
    }

    return NextResponse.json({
      lesson,
      discussion,
    });
  } catch (error) {
    console.log("Error creating lesson and discussion:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create lesson and discussion" }),
      { status: 500 }
    );
  }
}
