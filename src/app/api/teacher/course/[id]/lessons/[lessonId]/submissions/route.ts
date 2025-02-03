import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

interface Submission {
  _id: string;
  fileUrl: string;
  score: number | null;
  feedback: string | null;
  status: "PENDING" | "GRADED";
  userId: string;
  studentId: string;
  assignmentId: string;
  lessonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get("token");

    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token.value);

    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find submissions and include user data
    const submissions = await prisma.submission.findMany({
      where: {
        lessonId: params.lessonId,
      },
    });

    // Get user details for each submission
    const submissionsWithUsers = await Promise.all(
      submissions.map(async (submission) => {
        const user = await prisma.user.findUnique({
          where: {
            id: submission.userId,
          },
          select: {
            fullName: true,
          },
        });

        return {
          id: submission.id,
          fileUrl: submission.fileUrl,
          score: submission.score,
          feedback: submission.feedback,
          status: submission.status,
          studentId: submission.studentId,
          assignmentId: submission.assignmentId,
          submittedAt: submission.createdAt,
          studentName: user?.fullName || "Unknown Student",
        };
      })
    );

    console.log("Found submissions with users:", submissionsWithUsers); // Debug log

    return NextResponse.json({
      submissions: submissionsWithUsers,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  console.log("POST request received");
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get("token");

    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token.value);

    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body); // Debug log

    const { submissionId, score, feedback } = body;

    // Validate all required fields
    if (!submissionId) {
      console.log("Missing submissionId");
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      );
    }

    if (score === undefined || score === null) {
      console.log("Missing score");
      return NextResponse.json({ error: "Score is required" }, { status: 400 });
    }

    // Find the submission first to verify it exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },
    });

    if (!existingSubmission) {
      console.log("Submission not found:", submissionId);
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    console.log("Found existing submission:", existingSubmission);

    // Update the submission
    const updatedSubmission = await prisma.submission.update({
      where: {
        id: submissionId,
      },
      data: {
        score: Number(score),
        feedback: feedback || null,
        status: "GRADED",
        updatedAt: new Date(),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log("Updated submission:", updatedSubmission);

    return NextResponse.json({
      submission: {
        id: updatedSubmission.id,
        fileUrl: updatedSubmission.fileUrl,
        score: updatedSubmission.score,
        feedback: updatedSubmission.feedback,
        status: updatedSubmission.status,
        studentId: updatedSubmission.studentId,
        studentName: updatedSubmission.student.user.fullName,
        submittedAt: updatedSubmission.createdAt,
      },
    });
  } catch (error) {
    console.error("Error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to grade submission",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
