import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function auth() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return null;
    }

    // Verify the token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function POST() {
  try {
    // Get the current user before clearing the token
    const user = await auth();

    if (user) {
      // Update isActive to false
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });

      // Log the logout action
      await prisma.systemLog.create({
        data: {
          userId: user.id,
          action: "LOGOUT",
          details: `User logged out: ${user.email}`,
        },
      });
    }

    // Clear the token cookie
    await (await cookies()).delete("token");

    return NextResponse.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to process logout" },
      { status: 500 }
    );
  }
}
