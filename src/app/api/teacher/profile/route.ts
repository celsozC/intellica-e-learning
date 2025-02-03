import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findFirst({
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

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const profile = {
      ...teacher,
      email: teacher.user.email,
    };

    console.log("Fetched teacher profile:", profile);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const data = await request.json();

    // Use transaction to update both Teacher and User
    const [updatedTeacher] = await prisma.$transaction([
      // Update teacher profile
      prisma.teacher.update({
        where: {
          userId: payload.id,
        },
        data: {
          fullName: data.fullName,
          gender: data.gender,
          bio: data.bio,
          specialization: data.specialization,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      // Update user's fullName
      prisma.user.update({
        where: {
          id: payload.id,
        },
        data: {
          fullName: data.fullName,
        },
      }),
    ]);

    console.log("Profile updated successfully for user:", payload.id);

    const profile = {
      ...updatedTeacher,
      email: updatedTeacher.user.email,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
