"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, FileCheck, History, Trophy, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Attempt {
  id: string;
  score: number;
  completedAt: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number | null;
  maxScore: number;
  questionCount: number;
  attemptCount: number;
  latestAttempt?: Attempt;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimit: number | null;
  maxScore: number;
  questionCount: number;
  attemptCount: number;
  latestAttempt?: Attempt;
}

export default function QuizExamPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const courseId = params.id;
  const lessonId = params.lessonId;

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!courseId || !lessonId) return;
      
      try {
        setLoading(true);
        const [quizResponse, examResponse] = await Promise.all([
          axios.get(`/api/student/courses/${courseId}/lessons/${lessonId}/quizzes`),
          axios.get(`/api/student/courses/${courseId}/lessons/${lessonId}/exams`)
        ]);

        setQuizzes(quizResponse.data);
        setExams(examResponse.data);
      } catch (error) {
        console.error("Failed to fetch assessments:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load assessments"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [courseId, lessonId, toast]);

  const renderAssessmentCard = (assessment: Quiz | Exam, type: 'quiz' | 'exam') => {
    const hasAttempt = assessment.latestAttempt;
    const percentage = hasAttempt 
      ? Math.round((assessment.latestAttempt!.score / assessment.maxScore) * 100)
      : null;

    return (
      <Card key={assessment.id} className={`hover:shadow-md transition-shadow ${hasAttempt ? 'bg-muted/50' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle>{assessment.title}</CardTitle>
                  {hasAttempt && (
                    <Badge variant={percentage! >= 75 ? "success" : "warning"}>
                      {percentage}%
                    </Badge>
                  )}
                </div>
                <CardDescription>{assessment.description}</CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {assessment.timeLimit} minutes
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  {assessment.maxScore} points
                </div>
                <Badge variant="secondary">
                  {assessment.questionCount} Questions
                </Badge>
                {assessment.attemptCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <History className="h-4 w-4" />
                    {assessment.attemptCount} Attempts
                  </div>
                )}
              </div>

              {hasAttempt && (
                <div className="flex items-center gap-x-6 text-sm">
                  <div className="flex items-center gap-x-2">
                    <span className="text-muted-foreground">Latest attempt:</span>
                    <span className="font-medium">
                      {new Date(assessment.latestAttempt!.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <span className="text-muted-foreground">Score:</span>
                    <span className="font-medium">
                      {assessment.latestAttempt!.score}/{assessment.maxScore}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 min-w-[120px]">
              {type === 'exam' && hasAttempt ? (
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/student/courses/${courseId}/lessons/${lessonId}/${type}/${assessment.id}/result`)}
                  className="flex items-center gap-2 w-full"
                >
                  <FileCheck className="h-4 w-4" />
                  View Result
                </Button>
              ) : (
                <>
                  {hasAttempt && (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/student/courses/${courseId}/lessons/${lessonId}/${type}/${assessment.id}/result`)}
                      className="flex items-center gap-2 w-full"
                    >
                      <FileCheck className="h-4 w-4" />
                      View Result
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push(`/student/courses/${courseId}/lessons/${lessonId}/${type}/${assessment.id}`)}
                    className="flex items-center gap-2 w-full"
                    disabled={type === 'exam' && hasAttempt}
                  >
                    <FileCheck className="h-4 w-4" />
                    {hasAttempt ? 'Retake Quiz' : `Start ${type === 'quiz' ? 'Quiz' : 'Exam'}`}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  };

  return (
    <div className="p-6 pt-24">
      <div className="flex flex-col space-y-4 mb-6">
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
            onClick={() => router.push(`/student/courses/${courseId}`)}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Back to Course
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lesson Assessments</CardTitle>
            <CardDescription>
              View and take quizzes and exams for this lesson
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Tabs defaultValue="quizzes" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                  <TabsTrigger value="exams">Exams</TabsTrigger>
                </TabsList>

                <TabsContent value="quizzes">
                  <div className="grid gap-4">
                    {quizzes.map((quiz) => renderAssessmentCard(quiz, 'quiz'))}
                    {quizzes.length === 0 && (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                          <p className="text-muted-foreground">No quizzes available for this lesson</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="exams">
                  <div className="grid gap-4">
                    {exams.map((exam) => renderAssessmentCard(exam, 'exam'))}
                    {exams.length === 0 && (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                          <p className="text-muted-foreground">No exams available for this lesson</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 