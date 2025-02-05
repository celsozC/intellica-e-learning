"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Loader2,
  User,
  Calendar,
  Users,
  BookOpen,
  Plus,
  FileText,
  ChevronRight,
  MessageSquare,
  Layout,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

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
    position?: number;
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
            <TabsTrigger value="lessons">Lessons / Assignments</TabsTrigger>
            <TabsTrigger value="assignment">Quizzes / Exams</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
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
              <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Course Lessons / Assignments</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage your course content
                    </p>
                  </div>
                </div>
                <Button
                  className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                  onClick={() =>
                    router.push(`/teacher/courses/${course.id}/lessons/create`)
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson and Assignment
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {course.lessons?.length ? (
                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={lesson.id}
                        className="group flex items-center justify-between p-5 border rounded-xl bg-card hover:bg-accent/50 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Layout className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-muted-foreground">
                                {lesson.description}
                              </p>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                Lesson / Assignment {lesson.position || ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            router.push(
                              `/teacher/courses/${course.id}/lessons/${lesson.id}`
                            )
                          }
                        >
                          <span className="mr-2">View Lesson / Assignment</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">
                      No lessons created yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start adding lessons to your course
                    </p>
                    <Button
                      className="mt-4 bg-primary/10 text-primary hover:bg-primary/20"
                      onClick={() =>
                        router.push(
                          `/teacher/courses/${course.id}/lessons/create`
                        )
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Lesson
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignment" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Lessons Quizzes / Exams</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage quizzes and exams for each lesson
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {course.lessons?.length ? (
                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={lesson.id}
                        className="group flex items-center justify-between p-5 border rounded-xl bg-card hover:bg-accent/50 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-muted-foreground">
                                {lesson.description}
                              </p>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                Lesson {lesson.position || ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            router.push(
                              `/teacher/courses/${course.id}/lessons/${lesson.id}/quizexam`
                            )
                          }
                        >
                          <span className="mr-2">Manage Quizzes & Exams</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">
                      No lessons available
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create lessons first to add quizzes and exams
                    </p>
                    <Button
                      className="mt-4 bg-primary/10 text-primary hover:bg-primary/20"
                      onClick={() =>
                        router.push(`/teacher/courses/${course.id}/lessons/create`)
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Lesson
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Course Discussions</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Engage with your students
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {course.lessons?.length ? (
                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={lesson.id}
                        className="group flex items-center justify-between p-5 border rounded-xl bg-card hover:bg-accent/50 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <MessageSquare className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-muted-foreground">
                                {lesson.description}
                              </p>
                             
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            router.push(
                              `/teacher/courses/${course.id}/lessons/${lesson.id}/discussions`
                            )
                          }
                        >
                          <span className="mr-2">Join Discussion</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">
                      No discussions started yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Discussions will appear here when students engage with
                      lessons
                    </p>
                  </div>
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
