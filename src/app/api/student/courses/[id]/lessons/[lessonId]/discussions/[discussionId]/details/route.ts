import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      throw new Error("Not authenticated");
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      throw new Error("Invalid token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        profileImage: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[DISCUSSION_DETAILS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
