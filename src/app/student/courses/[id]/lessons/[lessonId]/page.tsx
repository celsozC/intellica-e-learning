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
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

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

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  materialUrl: string | null;
  sequenceOrder: number;
  discussions: Discussion[];
}

interface Submission {
  id: string;
  fileUrl: string | null;
  status: string;
  createdAt: string;
  student: {
    fullName: string;
  };
  feedback?: string;
  score?: string;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextLesson, setNextLesson] = useState<string | null>(null);
  const [prevLesson, setPrevLesson] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonResponse, submissionResponse, discussionResponse] =
          await Promise.all([
            axios.get(
              `/api/student/courses/${params.id}/lessons/${params.lessonId}`
            ),
            axios.get(
              `/api/student/courses/${params.id}/lessons/${params.lessonId}/submissions`
            ),
            axios.get(
              `/api/student/courses/${params.courseId}/lessons/${params.lessonId}/discussions/fetchData`
            ),
          ]);

        setLesson(lessonResponse.data.lesson);
        setNextLesson(lessonResponse.data.nextLesson?.id || null);
        setPrevLesson(lessonResponse.data.prevLesson?.id || null);
        setSubmission(submissionResponse.data.submission);
        setDiscussions(discussionResponse.data.lesson.discussions || []);
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

        {/* Discussions Preview Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Discussions</CardTitle>
              <CardDescription>
                Join the conversation about this lesson
              </CardDescription>
            </div>
            <Link
              href={`/student/courses/${params.id}/lessons/${params.lessonId}/discussions`}
            >
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                View All Discussions ({discussions.length})
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {discussions.length > 0 ? (
              <div className="space-y-4">
                {discussions.slice(0, 3).map((discussion) => (
                  <Link
                    key={discussion.id}
                    href={`/student/courses/${params.id}/lessons/${params.lessonId}/discussions`}
                    className="block hover:bg-muted/60 transition-colors"
                  >
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-base">
                          {discussion.title}
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {discussion.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span>{discussion.replies.length} replies</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>by</span>
                          <span className="font-medium text-primary">
                            {discussion.author.fullName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {discussions.length > 3 && (
                  <div className="text-center p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      +{discussions.length - 3} more discussions available
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-muted/30">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No discussions yet for this lesson
                </p>
              </div>
            )}
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
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        submission.status === "PENDING"
                          ? "secondary"
                          : submission.status === "GRADED"
                          ? "success"
                          : "default"
                      }
                      className="capitalize"
                    >
                      {submission.status.toLowerCase()}
                    </Badge>
                    {submission.status === "GRADED" && (
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Score:
                        </div>
                        <Badge
                          variant={
                            Number(submission.score) >= 70
                              ? "success"
                              : Number(submission.score) >= 50
                              ? "warning"
                              : "destructive"
                          }
                          className="font-semibold"
                        >
                          {submission.score}/100
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Preview Section */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Submitted File:</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View File
                      </a>
                    </Button>
                  </div>
                  {submission.feedback && (
                    <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                      <div className="text-sm font-medium mb-2">Feedback:</div>
                      <div className="text-sm text-muted-foreground">
                        {submission.feedback}
                      </div>
                    </div>
                  )}
                  {submission.fileUrl && (
                    <div className="rounded-lg mt-4 border bg-muted/50 p-4">
                      {submission.fileUrl.endsWith(".pdf") ? (
                        <iframe
                          src={submission.fileUrl}
                          className="w-full h-[400px] rounded-md"
                          title="PDF Preview"
                        />
                      ) : submission.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <Image
                          src={submission.fileUrl}
                          alt="Submission Preview"
                          width={800}
                          height={400}
                          className="rounded-md object-contain w-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-20 text-muted-foreground">
                          File preview not available
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
