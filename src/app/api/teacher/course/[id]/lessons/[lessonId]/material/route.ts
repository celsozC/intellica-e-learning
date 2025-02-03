import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public/uploads/lessons");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // Sanitize filename
    const filename = `${uniqueSuffix}-${safeFileName}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update lesson with new material URL
    const materialUrl = `/uploads/lessons/${filename}`;
    const lesson = await prisma.lesson.update({
      where: {
        id: params.lessonId,
        courseId: params.id,
      },
      data: {
        materialUrl,
      },
    });

    return NextResponse.json({
      lesson,
      materialUrl,
    });
  } catch (error) {
    console.error("Error uploading material:", error);
    return NextResponse.json(
      { error: "Failed to upload material" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    // Get the current lesson to find the material URL
    const currentLesson = await prisma.lesson.findUnique({
      where: {
        id: params.lessonId,
        courseId: params.id,
      },
      select: {
        materialUrl: true,
      },
    });

    if (currentLesson?.materialUrl) {
      // Get the filename from the URL
      const filename = currentLesson.materialUrl.split("/").pop();
      if (filename) {
        // Delete the file from the filesystem
        const filePath = path.join(
          process.cwd(),
          "public/uploads/lessons",
          filename
        );
        if (existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      }
    }

    // Update the lesson to remove the material URL
    const lesson = await prisma.lesson.update({
      where: {
        id: params.lessonId,
        courseId: params.id,
      },
      data: {
        materialUrl: null,
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
