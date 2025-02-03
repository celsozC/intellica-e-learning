import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get student first
    const student = await prisma.student.findFirst({
      where: {
        userId: payload.id,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check enrollment
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: student.id,
        courseId: params.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      isEnrolled: !!enrollment,
      enrollmentId: enrollment?._id || null,
    });
  } catch (error) {
    console.error("Enrollment check error:", error);
    return NextResponse.json(
      { error: "Failed to check enrollment status" },
      { status: 500 }
    );
  }
}
