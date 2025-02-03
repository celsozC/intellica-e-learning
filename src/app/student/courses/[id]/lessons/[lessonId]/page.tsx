"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  FileText,
  ArrowLeftCircle,
  ArrowRightCircle,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  materialUrl: string | null;
  sequenceOrder: number;
}

interface Submission {
  id: string;
  fileUrl: string | null;
  status: string;
  createdAt: string;
  student: {
    fullName: string;
  };
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextLesson, setNextLesson] = useState<string | null>(null);
  const [prevLesson, setPrevLesson] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonResponse, submissionResponse] = await Promise.all([
          axios.get(
            `/api/student/courses/${params.id}/lessons/${params.lessonId}`
          ),
          axios.get(
            `/api/student/courses/${params.id}/lessons/${params.lessonId}/submissions`
          ),
        ]);

        setLesson(lessonResponse.data.lesson);
        setNextLesson(lessonResponse.data.nextLesson?.id || null);
        setPrevLesson(lessonResponse.data.prevLesson?.id || null);
        setSubmission(submissionResponse.data.submission);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.lessonId, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (submissionFile) {
        formData.append("file", submissionFile);
      }

      const response = await axios.post(
        `/api/student/courses/${params.id}/lessons/${params.lessonId}/submissions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmission(response.data.submission);
      setSubmissionFile(null);
      toast({
        title: "Success",
        description: "Your submission has been saved",
      });
    } catch (error: any) {
      console.error("Error submitting:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to submit your work",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container pt-24 mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="container pt-24 mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(`/student/courses/${params.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>

          <div className="flex items-center gap-2">
            {prevLesson && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/student/courses/${params.id}/lessons/${prevLesson}`
                  )
                }
                className="flex items-center gap-2"
              >
                <ArrowLeftCircle className="h-4 w-4" />
                Previous Lesson
              </Button>
            )}
            {nextLesson && (
              <Button
                onClick={() =>
                  router.push(
                    `/student/courses/${params.id}/lessons/${nextLesson}`
                  )
                }
                className="flex items-center gap-2"
              >
                Next Lesson
                <ArrowRightCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge variant="outline">Lesson {lesson.sequenceOrder}</Badge>
                <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                <CardDescription className="text-base">
                  {lesson.description}
                </CardDescription>
              </div>
              {lesson.materialUrl && (
                <Button asChild variant="outline">
                  <a
                    href={lesson.materialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Material
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue max-w-none dark:prose-invert">
              {lesson.content.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
            <CardDescription>Submit your work for this lesson</CardDescription>
          </CardHeader>
          <CardContent>
            {submission ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Submitted on{" "}
                    {new Date(submission.createdAt).toLocaleString()}
                  </div>
                  <Badge
                    variant={
                      submission.status === "PENDING" ? "secondary" : "success"
                    }
                  >
                    {submission.status}
                  </Badge>
                </div>
                {submission.fileUrl && (
                  <Button asChild variant="outline">
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Submitted File
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload File</label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      required
                    />
                    {submissionFile && (
                      <div className="flex items-center justify-between p-2 border rounded bg-muted">
                        <span className="text-sm">{submissionFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSubmissionFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !submissionFile}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Submit Work
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
