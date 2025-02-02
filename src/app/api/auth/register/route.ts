import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Get the student role
    const studentRole = await prisma.role.findUnique({
      where: { name: "student" },
    });

    if (!studentRole) {
      return NextResponse.json(
        { error: "Student role not found" },
        { status: 500 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create both User and Student records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          isActive: true,
          role: {
            connect: {
              name: "student",
            },
          },
        },
        include: {
          role: true,
        },
      });

      // Create the student with minimal required data
      const student = await tx.student.create({
        data: {
          fullName,
          dateOfBirth: new Date(), // Default value, can be updated later
          gender: "Unspecified", // Default value, can be updated later
          profileImage: "/default-avatar.jpg", // Default value, can be updated later
        },
      });

      return { user, student };
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user;

    return NextResponse.json({
      message: "Registration successful",
      user: userWithoutPassword,
      student: result.student,
    });
  } catch (error: unknown) {
    console.error("Registration error:", {
      name: error instanceof Error ? error.name : "Unknown error",
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
