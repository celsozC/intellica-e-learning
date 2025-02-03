import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(
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
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Create new enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId: student.id,
        courseId: params.id,
        status: "ACTIVE",
        enrollmentDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in the course",
      enrollment: enrollment,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
