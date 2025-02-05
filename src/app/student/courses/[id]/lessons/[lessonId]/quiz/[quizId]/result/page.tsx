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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Trophy, XCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface QuizResult {
  quizTitle: string;
  quizDescription: string;
  score: number;
  maxScore: number;
  completedAt: string;
  timeSpent: number | null;
  answers: Array<{
    questionId: string;
    studentAnswer: string;
    correct: boolean;
    points: number;
  }>;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    options: string[];
    correctAnswer: string;
    points: number;
  }>;
}

export default function QuizResultPage({
  params,
}: {
  params: { id: string; lessonId: string; quizId: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await axios.get(
          `/api/student/courses/${params.id}/lessons/${params.lessonId}/quiz/${params.quizId}/result`
        );
        setResult(response.data);
      } catch (error) {
        console.error("Failed to fetch result:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quiz result",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [params.id, params.lessonId, params.quizId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-6 pt-24">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h2 className="mt-4 text-lg font-semibold">No Result Found</h2>
              <p className="mt-2 text-muted-foreground">
                We couldn't find any results for this quiz.
              </p>
              <Button
                onClick={() => router.back()}
                className="mt-4"
                variant="outline"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentage = (result.score / result.maxScore) * 100;
  const formattedTimeSpent = result.timeSpent
    ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s`
    : "N/A";

  return (
    <div className="p-6 pt-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quiz
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{result.quizTitle}</CardTitle>
            <CardDescription>{result.quizDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Overview */}
            <Card className="bg-muted">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <Trophy className="mx-auto h-6 w-6 text-primary mb-2" />
                    <div className="text-2xl font-bold">
                      {result.score}/{result.maxScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                  <div className="text-center">
                    <Clock className="mx-auto h-6 w-6 text-primary mb-2" />
                    <div className="text-2xl font-bold">{formattedTimeSpent}</div>
                    <div className="text-sm text-muted-foreground">Time Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 mb-2">
                      <Progress value={percentage} className="h-12 w-12" />
                    </div>
                    <div className="text-2xl font-bold">{Math.round(percentage)}%</div>
                    <div className="text-sm text-muted-foreground">Percentage</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Review */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question Review</h3>
              {result.questions.map((question, index) => {
                const answer = result.answers.find(a => a.questionId === question.id);
                return (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="font-medium">
                            Question {index + 1}: {question.question}
                          </div>
                          <div className="flex items-center gap-2">
                            {answer?.correct ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              {answer?.points || 0}/{question.points} points
                            </span>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <div className="text-sm text-muted-foreground">
                            Your answer: {answer?.studentAnswer || "No answer"}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Correct answer: {question.correctAnswer}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => router.push(`/student/courses/${params.id}/`)}
            >
              Return to Course
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}