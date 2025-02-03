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

    // First get the student using userId
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

    // Find course enrollment
    const courseEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId: params.id,
        studentId: student.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        studentId: true,
        courseId: true,
        status: true,
        enrollmentDate: true,
      },
    });

    console.log("Enrollment check:", {
      courseId: params.id,
      studentId: student.id,
      isEnrolled: !!courseEnrollment,
    });

    return NextResponse.json({
      isEnrolled: !!courseEnrollment,
      enrollmentId: courseEnrollment?.id || null,
      studentId: student.id,
      courseId: params.id,
      enrollment: courseEnrollment || null,
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json(
      {
        error: "Failed to check enrollment status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
