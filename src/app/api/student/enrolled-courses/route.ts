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

    let payload;
    try {
      payload = await verifyJWT(token);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!payload?.id) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    try {
      const student = await prisma.student.findFirst({
        where: {
          userId: payload.id,
        },
        include: {
          enrollments: {
            where: {
              status: "ACTIVE",
            },
            include: {
              course: {
                include: {
                  teacher: {
                    select: {
                      fullName: true,
                    },
                  },
                  lessons: {
                    select: {
                      id: true,
                    },
                  },
                  enrollments: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              enrollmentDate: "desc",
            },
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      const enrolledCourses = await prisma.courseEnrollment.findMany({
        where: {
          studentId: student.id,
        },
        include: {
          course: {
            include: {
              teacher: {
                select: {
                  fullName: true,
                },
              },
              lessons: true,
            },
          },
        },
      });

      // Get submission counts for each course
      const coursesWithProgress = await Promise.all(
        enrolledCourses.map(async (enrollment) => {
          const approvedSubmissions = await prisma.submission.count({
            where: {
              studentId: student.id,
              lesson: { courseId: enrollment.courseId },
              status: "APPROVED",
            },
          });

          const totalSubmissions = await prisma.submission.count({
            where: {
              studentId: student.id,
              lesson: { courseId: enrollment.courseId },
            },
          });

          return {
            id: enrollment.courseId,
            title: enrollment.course.title,
            description: enrollment.course.description,
            teacher: enrollment.course.teacher,
            lessonCount: enrollment.course.lessons.length,
            studentCount: await prisma.courseEnrollment.count({
              where: { courseId: enrollment.courseId },
            }),
            progress: Math.round(
              (approvedSubmissions / enrollment.course.lessons.length) * 100
            ),
            approvedSubmissions,
            totalSubmissions,
            enrollmentDate: enrollment.enrollmentDate.toISOString(),
            lastAccessed: enrollment.lastAccessedAt.toISOString(),
            status: enrollment.status,
            enrollmentId: enrollment.id,
          };
        })
      );

      return NextResponse.json({
        courses: coursesWithProgress,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch courses from database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
