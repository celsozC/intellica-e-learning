import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify the user is a teacher
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: payload.id,
      },
      select: {
        id: true,
        user: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!teacher || teacher.user.role.name !== "teacher") {
      return NextResponse.json(
        { error: "Only teachers can create courses" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Create course with the authenticated teacher's ID
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        teacherId: teacher.id, // Assign to the authenticated teacher
        lessonCount: 0,
        studentCount: 0,
        categoryId: data.categoryId,
      },
      include: {
        teacher: {
          select: {
            fullName: true,
          },
        },
      },
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
