import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function getCurrentUser() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      include: { role: true },
    });

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const lessonId = params.lessonId;

    // Get the authenticated student
    const student = await prisma.student.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check for existing pending submission
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        lessonId,
        studentId: student.id,
        status: "PENDING",
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You already have a pending submission for this lesson" },
        { status: 400 }
      );
    }

    let fileUrl = null;

    if (file) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), "public/uploads/submissions");

      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${uniqueSuffix}-${safeFileName}`;
      const filePath = path.join(uploadsDir, filename);

      // Write file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      fileUrl = `/uploads/submissions/${filename}`;
    }

    const submission = await prisma.submission.create({
      data: {
        fileUrl,
        status: "PENDING",
        studentId: student.id,
        userId: student.userId,
        lessonId,
        assignmentId: lessonId,
        score: null,
        feedback: null,
      },
      include: {
        student: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      {
        error: "Failed to create submission",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const submission = await prisma.submission.findFirst({
      where: {
        lessonId: params.lessonId,
        studentId: student.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        student: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch submission",
      },
      {
        status: 500,
      }
    );
  }
}
