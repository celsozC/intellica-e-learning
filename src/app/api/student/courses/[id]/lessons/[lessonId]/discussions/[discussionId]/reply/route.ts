import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const { content, discussionId, authorId } = await req.json();

    const reply = await prisma.discussionReply.create({
      data: {
        content,
        authorId,
        discussionId,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error("[DISCUSSION_REPLY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
