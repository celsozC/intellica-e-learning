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
import { ArrowLeft, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Answer {
  questionId: string;
  studentAnswer: string;
  correct: boolean;
  points: number;
}

interface ExamResult {
  id: string;
  score: number;
  maxScore: number;
  examTitle: string;
  examDescription: string;
  completedAt: string;
  answers: Answer[];
  questions: {
    questions: {
      id: string;
      question: string;
      type: string;
      options: string[];
      correctAnswer: string;
      points: number;
    }[];
  };
}

export default function ExamResultPage({
  params,
}: {
  params: { id: string; lessonId: string; examId: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/student/courses/${params.id}/lessons/${params.lessonId}/exam/${params.examId}/result`
        );
        
        if (response.data.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.data.error
          });
          return;
        }

        setResult(response.data);
      } catch (error: any) {
        console.error("Failed to fetch result:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.error || "Failed to load result"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [params, toast]);

  if (loading || !result) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.maxScore) * 100);
  const isPassed = percentage >= 75;

  return (
    <div className="p-6 pt-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lesson
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{result.examTitle}</CardTitle>
                <CardDescription>{result.examDescription}</CardDescription>
              </div>
              <Badge variant={isPassed ? "success" : "destructive"} className="ml-4">
                {isPassed ? "Passed" : "Failed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 p-6 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Score:</span>
                <span className="font-medium">{result.score}/{result.maxScore} ({percentage}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">{format(new Date(result.completedAt), "PPpp")}</span>
              </div>
            </div>

            <div className="space-y-6">
              {result.questions.questions.map((question, index) => {
                const answer = result.answers.find(a => a.questionId === question.id);
                return (
                  <Card key={question.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="font-medium">Question {index + 1}</div>
                            <div>{question.question}</div>
                          </div>
                          <Badge variant={answer?.correct ? "success" : "destructive"}>
                            {answer?.points || 0}/{question.points} points
                          </Badge>
                        </div>

                        <div className="grid gap-2">
                          {question.options.map((option) => (
                            <div
                              key={option}
                              className={`p-3 rounded-lg flex items-center justify-between ${
                                option === question.correctAnswer
                                  ? "bg-green-100 dark:bg-green-900/20"
                                  : option === answer?.studentAnswer && !answer.correct
                                  ? "bg-red-100 dark:bg-red-900/20"
                                  : "bg-muted"
                              }`}
                            >
                              <span>{option}</span>
                              {option === question.correctAnswer && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                              {option === answer?.studentAnswer && !answer.correct && (
                                <X className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          ))}
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
              variant="outline"
              onClick={() => router.push(`/student/courses/${params.id}/lessons/${params.lessonId}/quizexam`)}
            >
              Return to Assessment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}