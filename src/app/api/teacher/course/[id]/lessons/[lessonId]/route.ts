import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get("token");

    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token.value);

    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get course and lesson info
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      include: {
        lessons: {
          where: {
            id: params.lessonId,
          },
        },
      },
    });

    if (!course || !course.lessons[0]) {
      return NextResponse.json(
        { error: "Course or lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      courseName: course.title,
      lessonName: course.lessons[0].title,
    });
  } catch (error) {
    console.error("Error fetching course info:", error);
    return NextResponse.json(
      { error: "Failed to fetch course information" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;

    const lesson = await prisma.lesson.update({
      where: {
        id: params.lessonId,
        courseId: params.id,
      },
      data: {
        title,
        description,
        content,
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}
