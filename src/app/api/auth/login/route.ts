import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signJWT } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log("Login attempt for:", email);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
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

    console.log("Found user:", { ...user, password: "[HIDDEN]" });

    if (!user || !user.role) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create token payload
    const tokenData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
    };

    console.log("Creating token with data:", tokenData);

    const token = await signJWT(tokenData);

    // Create the response
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        profileImage: user.profileImage,
      },
    });

    // Set cookie with strict security options
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log("Login successful, token set in cookie");
    console.log("Cookie details:", {
      name: "token",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error details:", {
      name: error instanceof Error ? error.name : "Unknown error",
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Failed to login. Please try again." },
      { status: 500 }
    );
  }
}
