import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = await cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find student by userId
    const student = await prisma.student.findFirst({
      where: {
        userId: payload.id,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Format the date to YYYY-MM-DD for input type="date"
    const formattedDate = student.dateOfBirth
      ? new Date(student.dateOfBirth).toISOString().split("T")[0]
      : "";

    const profile = {
      id: student.id,
      fullName: student.fullName,
      email: student.user.email,
      dateOfBirth: formattedDate,
      gender: student.gender,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const token = await cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    try {
      // Find student first to ensure it exists
      const student = await prisma.student.findFirst({
        where: {
          userId: payload.id,
        },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      // Update both student and user models
      const [updatedStudent] = await prisma.$transaction([
        prisma.student.update({
          where: {
            id: student.id, // Use student.id instead of userId
          },
          data: {
            fullName: data.fullName,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender: data.gender,
          },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        }),
        prisma.user.update({
          where: {
            id: payload.id,
          },
          data: {
            fullName: data.fullName,
          },
        }),
      ]);

      // Format the date for response
      const formattedDate = updatedStudent.dateOfBirth
        ? new Date(updatedStudent.dateOfBirth).toISOString().split("T")[0]
        : "";

      const profile = {
        id: updatedStudent.id,
        fullName: updatedStudent.fullName,
        email: updatedStudent.user.email,
        dateOfBirth: formattedDate,
        gender: updatedStudent.gender,
      };

      return NextResponse.json(profile);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to update profile in database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating student profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
