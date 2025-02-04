import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string; lessonId: string; dicussionId: string } }
) {
  if (!params.dicussionId) {
    return NextResponse.json(
      { error: "Discussion ID is required" },
      { status: 400 }
    );
  }

  try {
    const { content } = await req.json();

    // Get course and teacher info
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!course?.teacher?.user?.id) {
      console.error("Teacher not found");
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    console.log("Course:", course);

    // Create the discussion reply
    const reply = await prisma.discussionReply.create({
      data: {
        content,
        discussionId: params.dicussionId,
        authorId: course.teacher.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error("[DISCUSSION_REPLY_CREATE]", error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}
