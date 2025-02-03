"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2, User, Calendar, Users, BookOpen, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  lessonCount: number;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
  teacher: {
    fullName: string;
    email: string;
  };
  lessons: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
  }>;
  students: Array<{
    id: string;
    fullName: string;
    email: string;
  }>;
  discussions: Array<{
    id: string;
    title: string;
    createdAt: string;
    repliesCount: number;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    dueDate: string;
    submissionCount: number;
  }>;
  exams: Array<{
    id: string;
    title: string;
    scheduledFor: string;
    duration: number;
  }>;
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/teacher/course/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchCourse();
    }
  }, []);

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6 pt-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => router.push("/teacher/courses")}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <Button
            onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}
          >
            Edit Course
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Lessons</p>
              </div>
              <p className="text-2xl font-bold mt-2">{course.lessonCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <p className="text-2xl font-bold mt-2">{course.studentCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
              <p className="text-2xl font-bold mt-2">
                {new Date(course.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{course.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{course.teacher.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.teacher.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Course Lessons</CardTitle>
                <Button
                  onClick={() =>
                    router.push(`/teacher/courses/${course.id}/lessons/create`)
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </Button>
              </CardHeader>
              <CardContent>
                {course.lessons?.length ? (
                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {lesson.description}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/teacher/courses/${course.id}/lessons/${lesson.id}`
                            )
                          }
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No lessons created yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
              </CardHeader>
              <CardContent>
                {course.students?.length ? (
                  <div className="space-y-4">
                    {course.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{student.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No students enrolled yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
