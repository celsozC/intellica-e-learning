import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token?.value) {
      return null;
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token.value, secret);

    if (!payload || typeof payload.id !== "string") {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { role: true },
    });

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { fullName, email, roleId, isActive } = body;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        fullName,
        email,
        roleId,
        isActive,
      },
      include: {
        role: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate the ID format first
    if (!params.id || params.id.length !== 24) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    if (currentUser.role.name !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting the last admin user
    if (user.role.name === "admin") {
      const adminCount = await prisma.user.count({
        where: {
          role: {
            name: "admin",
          },
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin user" },
          { status: 400 }
        );
      }
    }

    // Delete the user and all related data
    await prisma.$transaction(async (tx) => {
      // Delete system logs first
      await tx.systemLog.deleteMany({
        where: { userId: user.id },
      });

      // Delete role-specific details if they exist
      if (user.role.name === "student") {
        await tx.student
          .delete({
            where: { userId: user.id },
          })
          .catch(() => {}); // Ignore if doesn't exist
      }

      if (user.role.name === "teacher") {
        await tx.teacher
          .delete({
            where: { userId: user.id },
          })
          .catch(() => {}); // Ignore if doesn't exist
      }

      if (user.role.name === "admin") {
        await tx.admin
          .delete({
            where: { userId: user.id },
          })
          .catch(() => {}); // Ignore if doesn't exist
      }

      // Finally delete the user
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
