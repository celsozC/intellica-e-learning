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
import { ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false';
  options: string[];
}

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimit: number | null;
  maxScore: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export default function TakeExamPage({
  params,
}: {
  params: { id: string; lessonId: string; examId: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/student/courses/${params.id}/lessons/${params.lessonId}/exam/${params.examId}`
        );
        
        if (response.data.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.data.error
          });
          return;
        }

        setExam(response.data);
        if (response.data.timeLimit) {
          setTimeLeft(response.data.timeLimit * 60);
        }
      } catch (error: any) {
        console.error("Failed to fetch exam:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.error || "Failed to load exam"
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id && params.lessonId && params.examId) {
      fetchExam();
    }
  }, [params, toast]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showStartDialog) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showStartDialog]);

  const handleStartExam = () => {
    setShowStartDialog(false);
    if (exam?.timeLimit) {
      setTimeLeft(exam.timeLimit * 60);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const getProgress = () => {
    if (!exam) return 0;
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / exam.questions.length) * 100;
  };

  const handleSubmit = async () => {
    if (!exam) return;

    const unansweredCount = exam.questions.filter(
      (q) => !answers[q.id]
    ).length;

    if (unansweredCount > 0 && timeLeft !== 0) {
      const confirmed = window.confirm(
        `You have ${unansweredCount} unanswered question${
          unansweredCount === 1 ? '' : 's'
        }. Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `/api/student/courses/${params.id}/lessons/${params.lessonId}/exam/${params.examId}/submit`,
        { answers }
      );

      if (response.data.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.error
        });
        return;
      }

      router.push(`/student/courses/${params.id}/lessons/${params.lessonId}/exam/${params.examId}/result`);
    } catch (error: any) {
      console.error("Failed to submit exam:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to submit exam"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !exam) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-24">
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Exam</DialogTitle>
            <DialogDescription>
              You are about to start {exam.title}. This exam has {exam.questions.length} questions
              {exam.timeLimit ? ` and a time limit of ${exam.timeLimit} minutes` : ''}.
              Make sure you are ready before starting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleStartExam}>
              Start Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Exam
          </Button>
          {timeLeft !== null && (
            <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="text-lg">
              <Clock className="h-4 w-4 mr-2" />
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
            <CardDescription>{exam.description}</CardDescription>
            <div className="mt-4 space-y-2">
              <div className="text-sm text-muted-foreground">
                Progress: {Object.keys(answers).length}/{exam.questions.length} questions answered
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {exam.questions.map((question, index) => (
              <Card key={question.id} className="p-4">
                <div className="space-y-4">
                  <div className="font-medium">
                    Question {index + 1}: {question.text}
                  </div>
                  <RadioGroup
                    value={answers[question.id]}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                        <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </Card>
            ))}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={submitting || (timeLeft !== null && timeLeft <= 0)}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : timeLeft !== null && timeLeft <= 0 ? (
                "Time's Up!"
              ) : (
                "Submit Exam"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
