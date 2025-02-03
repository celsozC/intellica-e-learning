"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Users,
  Clock,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Course {
  id: string;
  title: string;
  description: string;
  teacher: {
    id: string;
    fullName: string;
    specialization: string;
    bio: string;
  };
  lessons: {
    id: string;
    title: string;
    description: string;
    content: string;
    materialUrl: string | null;
    sequenceOrder: number;
  }[];
  lessonCount: number;
  studentCount: number;
  createdAt: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!params.id) return;

      setCheckingEnrollment(true);
      try {
        const response = await axios.get(
          `/api/courses/${params.id}/check-enrollment`
        );
        setIsEnrolled(response.data.isEnrolled);
      } catch (error) {
        console.error("Failed to check enrollment:", error);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [params.id]);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${params.id}`);
        setCourse(response.data.course);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to fetch course");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  // Enroll handler
  const handleEnroll = async () => {
    if (!course || enrolling || isEnrolled || checkingEnrollment) return;

    setEnrolling(true);
    try {
      // Double check enrollment before proceeding
      const checkResponse = await axios.get(
        `/api/student/courses/${params.id}/enroll`
      );

      if (checkResponse.data.isEnrolled) {
        setIsEnrolled(true);
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this course",
        });
        return;
      }

      // Make POST request to enroll
      const response = await axios.post(
        `/api/student/courses/${params.id}/enroll`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to enroll");
      }

      setIsEnrolled(true);
      toast({
        title: "Success",
        description:
          response.data.message || "Successfully enrolled in the course",
      });

      // Redirect to enrolled courses page
      router.push("/student/enrolled/success");
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to enroll",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="container pt-24 mx-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" asChild>
            <Link href="/student/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold">Course Not Found</h1>
          <p className="text-muted-foreground">
            The requested course could not be found.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/student/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-24 mx-auto p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="text-xl text-muted-foreground mt-2">
            {course.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <span>{course.lessonCount} Lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span>{course.studentCount} Students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span>
                          Created{" "}
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lessons">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Lessons</CardTitle>
                    <CardDescription>
                      Total of {course.lessonCount} lessons in this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {course.lessons.map((lesson) => (
                          <div key={lesson.id}>
                            {isEnrolled ? (
                              <Link
                                href={`/student/courses/${params.id}/lessons/${lesson.id}`}
                              >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                  <CardHeader>
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-lg">
                                          {lesson.title}
                                        </CardTitle>
                                        <CardDescription>
                                          {lesson.description}
                                        </CardDescription>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {lesson.materialUrl && (
                                          <Badge variant="outline">
                                            Material Available
                                          </Badge>
                                        )}
                                        <Badge>
                                          Lesson {lesson.sequenceOrder}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardHeader>
                                </Card>
                              </Link>
                            ) : (
                              <Card className="opacity-75">
                                <CardHeader>
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <CardTitle className="text-lg">
                                        {lesson.title}
                                      </CardTitle>
                                      <CardDescription>
                                        {lesson.description}
                                      </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {lesson.materialUrl && (
                                        <Badge variant="outline">
                                          Material Available
                                        </Badge>
                                      )}
                                      <Badge variant="secondary">
                                        Lesson {lesson.sequenceOrder}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardHeader>
                              </Card>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardHeader>
                    <CardTitle>About the Instructor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Name</h4>
                      <p className="text-muted-foreground">
                        {course.teacher.fullName}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Specialization</h4>
                      <p className="text-muted-foreground">
                        {course.teacher.specialization}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Bio</h4>
                      <p className="text-muted-foreground">
                        {course.teacher.bio}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Self-paced learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span>Comprehensive materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span>Interactive discussions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <span>Certificate on completion</span>
                </div>
                {isEnrolled ? (
                  <Button className="w-full mt-4" variant="secondary" asChild>
                    <Link href="/student/enrolled">Go to Course</Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-4"
                    onClick={handleEnroll}
                    disabled={enrolling || checkingEnrollment || isEnrolled}
                  >
                    {enrolling ? (
                      <>
                        <span className="animate-spin mr-2">⚪</span>
                        Enrolling...
                      </>
                    ) : checkingEnrollment ? (
                      "Checking enrollment..."
                    ) : (
                      "Enroll Now"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
