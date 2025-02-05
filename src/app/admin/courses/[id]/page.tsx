"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { use } from "react";
import { Loader2, Edit, ArrowLeft, Users, Book, MessageSquare, FileText, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { format, parseISO } from "date-fns";

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lessonCount: number;
  studentCount: number;
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
    content: string;
    materialUrl: string | null;
    sequenceOrder: number;
    createdAt: string;
    updatedAt: string;
    assignments: Array<{
      id: string;
      title: string;
      description: string;
      dueDate: string;
      maxScore: number;
      submissions: Array<{
        id: string;
        score: number | null;
        status: string;
        submittedAt: string;
        student: {
          user: {
            fullName: string;
          }
        }
      }>;
    }>;
    quizzes: Array<{
      id: string;
      title: string;
      description: string;
      timeLimit: number | null;
      maxScore: number;
      questions: any;
      attempts: Array<{
        score: number;
        student: {
          user: {
            fullName: string;
          }
        }
      }>;
    }>;
    exams: Array<{
      id: string;
      title: string;
      description: string;
      timeLimit: number | null;
      maxScore: number;
      questions: any;
      attempts: Array<{
        score: number;
        student: {
          user: {
            fullName: string;
          }
        }
      }>;
    }>;
    discussions: Array<{
      id: string;
      title: string;
      content: string;
      createdAt: string;
      author: {
        fullName: string;
      };
      replies: Array<{
        content: string;
        createdAt: string;
        author: {
          fullName: string;
        }
      }>;
    }>;
  }>;
  enrollments: Array<{
    id: string;
    enrolledAt: string;
    status: string;
    student: {
      user: {
        fullName: string;
        email: string;
      };
    };
  }>;
}

interface Assessment {
  id: string;
  lessonTitle: string;
  type: 'Quiz' | 'Exam';
  title: string;
  timeLimit: number | null;
  attempts: Array<{
    score: number;
    student: {
      user: {
        fullName: string;
      }
    }
  }>;
  maxScore: number;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), 'PP');
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = use(params instanceof Promise ? params : Promise.resolve(params));
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
        {/* Course Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </div>
              <Badge className="ml-2">{course.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{course.category.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Teacher</p>
                <p className="font-medium">{course.teacher.fullName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(course.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(course.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course.enrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course.lessons.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Discussions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {course.lessons.reduce((total, lesson) => total + lesson.discussions.length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {course.lessons.reduce((total, lesson) => total + lesson.assignments.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Content Tabs */}
        <Tabs defaultValue="lessons" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>All lessons in sequential order</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Activities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.lessons.map((lesson) => (
                      <TableRow key={lesson.id}>
                        <TableCell>{lesson.sequenceOrder}</TableCell>
                        <TableCell className="font-medium">{lesson.title}</TableCell>
                        <TableCell>{lesson.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline">
                              {lesson.assignments.length} Assignments
                            </Badge>
                            <Badge variant="outline">
                              {lesson.quizzes.length} Quizzes
                            </Badge>
                            <Badge variant="outline">
                              {lesson.exams.length} Exams
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
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Students currently enrolled in this course</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrolled Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>{enrollment.student.user.fullName}</TableCell>
                        <TableCell>{enrollment.student.user.email}</TableCell>
                        <TableCell>{formatDate(enrollment.enrolledAt)}</TableCell>
                        <TableCell>
                          <Badge>{enrollment.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Course Assignments</CardTitle>
                <CardDescription>All assignments across lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Average Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.lessons.map((lesson) =>
                      lesson.assignments.map((assignment) => {
                        const submissionCount = assignment.submissions.length;
                        const averageScore = submissionCount > 0
                          ? assignment.submissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / submissionCount
                          : 0;

                        return (
                          <TableRow key={assignment.id}>
                            <TableCell>{lesson.title}</TableCell>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>{formatDate(assignment.dueDate)}</TableCell>
                            <TableCell>{submissionCount}</TableCell>
                            <TableCell>{averageScore.toFixed(1)}/{assignment.maxScore}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions">
            <Card>
              <CardHeader>
                <CardTitle>Course Discussions</CardTitle>
                <CardDescription>All discussions across lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Replies</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.lessons.map((lesson) =>
                      lesson.discussions.map((discussion) => (
                        <TableRow key={discussion.id}>
                          <TableCell>{lesson.title}</TableCell>
                          <TableCell>{discussion.title}</TableCell>
                          <TableCell>{discussion.author.fullName}</TableCell>
                          <TableCell>{formatDate(discussion.createdAt)}</TableCell>
                          <TableCell>{discussion.replies.length}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Course Assessments</CardTitle>
                <CardDescription>All quizzes and exams across lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Time Limit</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Average Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course?.lessons.flatMap((lesson) => [
                      ...(lesson.quizzes?.map((quiz) => ({
                        id: quiz.id,
                        lessonTitle: lesson.title,
                        type: 'Quiz' as const,
                        title: quiz.title,
                        timeLimit: quiz.timeLimit,
                        attempts: quiz.attempts || [],
                        maxScore: quiz.maxScore
                      })) || []),
                      ...(lesson.exams?.map((exam) => ({
                        id: exam.id,
                        lessonTitle: lesson.title,
                        type: 'Exam' as const,
                        title: exam.title,
                        timeLimit: exam.timeLimit,
                        attempts: exam.attempts || [],
                        maxScore: exam.maxScore
                      })) || [])
                    ]).map((assessment: Assessment) => {
                      const attemptCount = assessment?.attempts?.length || 0;
                      const averageScore = attemptCount > 0
                        ? assessment.attempts.reduce((acc, att) => acc + (att.score || 0), 0) / attemptCount
                        : 0;

                      return (
                        <TableRow key={assessment.id}>
                          <TableCell>{assessment.lessonTitle}</TableCell>
                          <TableCell>
                            <Badge variant={assessment.type === 'Quiz' ? 'default' : 'secondary'}>
                              {assessment.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{assessment.title}</TableCell>
                          <TableCell>
                            {assessment.timeLimit ? `${assessment.timeLimit} mins` : 'No limit'}
                          </TableCell>
                          <TableCell>{attemptCount}</TableCell>
                          <TableCell>
                            {averageScore.toFixed(1)}/{assessment.maxScore}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
