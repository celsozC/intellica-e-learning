import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Get the student role
    const studentRole = await prisma.role.findFirst({
      where: { name: "student" },
    });

    if (!studentRole) {
      return NextResponse.json(
        { error: "Student role not found" },
        { status: 500 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    try {
      // Create user with student details using transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            fullName,
            email,
            password: hashedPassword,
            roleId: studentRole.id,
            isActive: true,
          },
          include: {
            role: true,
          },
        });

        // Create student details
        const student = await tx.student.create({
          data: {
            fullName,
            userId: user.id,
          },
        });

        // Log the registration
        await prisma.systemLog.create({
          data: {
            userId: user.id,
            action: "REGISTER",
            details: `New user registered: ${user.email}`,
          },
        });

        return {
          ...user,
          studentDetails: student,
        };
      });

      // Remove sensitive data from response
      const { password: _, ...userWithoutPassword } = result;

      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Transaction error:", error);
      return NextResponse.json(
        {
          error: "Failed to create user account",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Failed to process registration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
