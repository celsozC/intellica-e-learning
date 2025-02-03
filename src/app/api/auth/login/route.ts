import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function getCurrentUser() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      include: { role: true },
    });

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

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

    // Update isActive to true immediately after successful login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create token payload using the updated user
    const tokenData = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    };

    console.log("Creating token with data:", tokenData);

    const token = await signJWT(tokenData);

    // After successful login, before returning the response
    // Log the login action
    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        details: `User logged in: ${user.email}`,
      },
    });

    // Create the response using the updated user
    const response = NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profileImage: updatedUser.profileImage,
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

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: body.isActive,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
