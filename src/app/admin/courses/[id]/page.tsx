"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { use } from "react";
import { Loader2, Edit, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    description: string;
  };
  teacher: {
    id: string;
    fullName: string;
    email: string;
  };
  lessons: Array<{
    id: string;
    title: string;
    description: string;
    sequenceOrder: number;
    assignments: any[];
    quiz: any | null;
    discussions: any[];
  }>;
  enrollments: Array<{
    student: {
      user: {
        fullName: string;
        email: string;
      };
    };
  }>;
}

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = use(
    params instanceof Promise ? params : Promise.resolve(params)
  );
  const courseId = resolvedParams.id;

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/admin/courses/${courseId}`);
        setCourse(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch course details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role.name === "admin") {
      fetchCourse();
    }
  }, [user, courseId, toast]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role.name !== "admin") {
    router.push("/login");
    return null;
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6 pt-24">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            Course not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/courses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <Button onClick={() => router.push(`/admin/courses/${courseId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Course
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Title</h3>
                <p>{course.title}</p>
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p>{course.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Category</h3>
                <p>{course.category.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <Badge>{course.status}</Badge>
              </div>
              <div>
                <h3 className="font-semibold">Teacher</h3>
                <p>{course.teacher.fullName}</p>
              </div>
              <div>
                <h3 className="font-semibold">Created At</h3>
                <p>{new Date(course.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Activities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>{lesson.sequenceOrder}</TableCell>
                    <TableCell>{lesson.title}</TableCell>
                    <TableCell>{lesson.description}</TableCell>
                    <TableCell>
                      <div className="space-x-2">
                        <Badge variant="outline">
                          {lesson.assignments.length} Assignments
                        </Badge>
                        <Badge variant="outline">
                          {lesson.quiz ? "1" : "0"} Quiz
                        </Badge>
                        <Badge variant="outline">
                          {lesson.discussions.length} Discussions
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.enrollments.map((enrollment, index) => (
                  <TableRow key={index}>
                    <TableCell>{enrollment.student.user.fullName}</TableCell>
                    <TableCell>{enrollment.student.user.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
