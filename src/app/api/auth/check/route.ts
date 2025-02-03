import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };

    if (!decoded) {
      return NextResponse.json({ user: null });
    }

    // Get full user data including role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: true,
        student: true,
        instructor: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Return user data without sensitive information
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        studentId: user.student?.id,
        instructorId: user.instructor?.id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null });
  }
}
