"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Calendar,
  ArrowRight,
  Clock,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  teacher: {
    fullName: string;
  };
  lessonCount: number;
  studentCount: number;
  progress: number;
  enrollmentDate: string;
  lastAccessed: string;
  status: string;
  enrollmentId: string;
}

export default function EnrolledCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/student/enrolled-courses");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch enrolled courses");
        }

        if (data.courses) {
          console.log("Fetched enrolled courses:", data.courses);
          setCourses(data.courses);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load courses"
        );
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load courses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [toast]);

  if (loading) {
    return (
      <div className="container pt-24 mx-auto p-6 space-y-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <h1 className="text-2xl font-bold">Loading your courses...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container pt-24 mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">
              Error Loading Courses
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="container pt-24 mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">No Enrolled Courses</CardTitle>
            <CardDescription>
              You haven&apos;t enrolled in any courses yet. Start your learning
              journey today!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button asChild>
              <Link href="/student/courses">Browse Available Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container pt-24 mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">My Enrolled Courses</h1>
          <p className="text-muted-foreground">
            You have {courses.length} active{" "}
            {courses.length === 1 ? "course" : "courses"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/student/courses">Explore More Courses</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-xl line-clamp-2">
                  {course.title}
                </CardTitle>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    course.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {course.status}
                </span>
              </div>
              <CardDescription className="line-clamp-2 mt-2">
                {course.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{course.lessonCount} Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.studentCount} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(course.enrollmentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Last accessed:{" "}
                    {new Date(course.lastAccessed).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {course.teacher.fullName}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <Link href={`/student/courses/${course.id}`}>
                      Continue Learning <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
