"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  FileCheck,
  Loader2,
  Clock,
  Download,
  File,
  BookOpen,
  User,
  MessageSquare,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Submission {
  _id: string;
  fileUrl: string;
  score: number | null;
  feedback: string | null;
  status: "PENDING" | "GRADED";
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  materialUrl: string | null;
  sequenceOrder: number;
  discussions: Discussion[];
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    fullName: string;
  };
  replies: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      fullName: string;
    };
  }[];
}

interface CourseInfo {
  courseName: string;
  lessonName: string;
}

export default function LessonSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFeedback, setCurrentFeedback] = useState<string>("");
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [submittingGrade, setSubmittingGrade] = useState<string | null>(null);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchSubmissions(),
          fetchCourseInfo(),
          fetchDiscussions(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load lesson data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.courseId, params.lessonId]);

  const fetchDiscussions = async () => {
    const response = await axios.get(
      `/api/teacher/course/${params.id}/lessons/${params.lessonId}/discussions/fetchData`
    );
    console.log("Fetched discussions:", response.data);
    setLesson(response.data);
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/teacher/course/${params.id}/lessons/${params.lessonId}/submissions`
      );

      console.log("Fetched submissions:", response.data);
      console.log("CELSOGOD: " + response.data.submissions);
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseInfo = async () => {
    try {
      const { data } = await axios.get(
        `/api/teacher/course/${params.id}/lessons/${params.lessonId}`
      );
      setCourseInfo({
        courseName: data.courseName,
        lessonName: data.lessonName,
      });
    } catch (error) {
      console.error("Error fetching course information:", error);
      toast({
        title: "Error",
        description: "Failed to fetch course information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId: string) => {
    try {
      console.log("Attempting to grade submission:", { submissionId });
      if (!submissionId) {
        console.error("No submission ID provided");
        toast({
          title: "Error",
          description: "Submission ID is missing",
          variant: "destructive",
        });
        return;
      }

      if (currentScore === null || currentScore === undefined) {
        toast({
          title: "Error",
          description: "Please enter a score",
          variant: "destructive",
        });
        return;
      }

      setSubmittingGrade(submissionId);

      const payload = {
        submissionId,
        score: Number(currentScore),
        feedback: currentFeedback || "",
      };

      console.log("Sending grade payload:", payload);

      await axios.post(
        `/api/teacher/course/${params.id}/lessons/${params.lessonId}/submissions`,
        payload
      );

      toast({
        title: "Success",
        description: "Submission graded successfully",
      });

      setCurrentScore(null);
      setCurrentFeedback("");
      setCurrentSubmissionId(null);
      await fetchSubmissions();
    } catch (error) {
      console.error("Grade submission error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to grade submission",
        variant: "destructive",
      });
    } finally {
      setSubmittingGrade(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container pt-24 mx-auto py-10 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Lesson
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/teacher/courses/${params.id}`)}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Back to Course
            </Button>
          </div>
          {courseInfo && (
            <div className="space-y-1 pt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{courseInfo.courseName}</span>
                <span>•</span>
                <span>{courseInfo.lessonName}</span>
              </div>
            </div>
          )}
        </div>
        <Badge variant="secondary" className="text-sm">
          {submissions.length} Submissions
        </Badge>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Student Assignment Submissions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium">
                No submissions yet
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission) => (
                <Card
                  key={submission._id}
                  className="overflow-hidden border-muted"
                >
                  <div className="bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {submission.studentName}
                            </span>
                          </div>
                          <Badge
                            variant={
                              submission.status === "PENDING"
                                ? "secondary"
                                : "success"
                            }
                            className="capitalize"
                          >
                            {submission.status === "PENDING" ? (
                              <Clock className="h-3 w-3 mr-1" />
                            ) : (
                              <FileCheck className="h-3 w-3 mr-1" />
                            )}
                            {submission.status.toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Assignment: {submission.assignmentTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted{" "}
                          {new Date(
                            submission.submittedAt
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            submission.submittedAt
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 transition"
                      >
                        <Download className="h-4 w-4" />
                        View Submission
                      </a>
                    </div>
                  </div>
                  <Separator />
                  <div className="p-4">
                    {submission.status === "PENDING" ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium mb-1.5 block">
                              Score
                            </label>
                            <Input
                              type="number"
                              placeholder="Enter score (0-100)"
                              className="max-w-[150px]"
                              min={0}
                              max={100}
                              onChange={(e) => {
                                setCurrentScore(Number(e.target.value));
                                setCurrentSubmissionId(submission._id);
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">
                            Feedback
                          </label>
                          <Textarea
                            placeholder="Enter feedback for the student..."
                            className="resize-none"
                            value={currentFeedback}
                            onChange={(e) => {
                              setCurrentFeedback(e.target.value);
                              setCurrentSubmissionId(submission._id);
                            }}
                          />
                        </div>
                        <Button
                          onClick={() => handleGrade(submission.id)}
                          className="w-full sm:w-auto"
                          disabled={submittingGrade === submission.id}
                        >
                          {submittingGrade === submission._id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Grade"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Score</p>
                          <p className="text-2xl font-semibold">
                            {submission.score}/100
                          </p>
                        </div>
                        {submission.feedback && (
                          <div>
                            <p className="text-sm font-medium">Feedback</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {submission.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Student Discussions</CardTitle>
            <CardDescription>
              Recent discussions and questions from students
            </CardDescription>
          </div>
          <Link
            href={`/teacher/courses/${params.id}/lessons/${params.lessonId}/discussions`}
          >
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              View All
            </Button>
          </Link>
        </CardHeader>
      </Card>
    </div>
  );
}
