import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const discussions = await prisma.discussion.findMany({
      where: {
        lessonId: params.lessonId,
      },
      include: {
        author: {
          select: {
            fullName: true,
            profileImage: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(discussions);
  } catch (error) {
    console.log("[DISCUSSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
