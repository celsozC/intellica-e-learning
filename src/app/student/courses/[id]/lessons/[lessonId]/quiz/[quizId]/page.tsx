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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Question {
  id: string;
  text: string;
  options: string[];
  type: 'multiple_choice' | 'true_false';
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number | null;
  maxScore: number;
  questions: Question[];
}

export default function TakeQuizPage({
  params,
}: {
  params: { id: string; lessonId: string; quizId: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const courseId = params.id;
  const lessonId = params.lessonId;
  const quizId = params.quizId;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/student/courses/${courseId}/lessons/${lessonId}/quiz/${quizId}`);
        console.log("Quiz data:", response.data); // Debug log
        setQuiz(response.data);
        if (response.data.timeLimit) {
          setTimeLeft(response.data.timeLimit * 60);
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quiz"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, lessonId, quizId, toast]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

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
  }, [timeLeft]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      setSubmitting(true);
      const response = await axios.post(`/api/student/courses/${courseId}/lessons/${lessonId}/quiz/${quizId}/submit`, {
        answers
      });

      toast({
        title: "Quiz Submitted",
        description: `Your score: ${response.data.score}/${quiz.maxScore}`
      });

      router.push(`/student/courses/${courseId}/lessons/${lessonId}/quiz/${quizId}/result`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit quiz"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className="p-6 pt-24">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load quiz questions. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 pt-24">
      <div className="flex flex-col space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
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
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.isArray(quiz.questions) && quiz.questions.map((question, index) => (
              <Card key={question.id || index} className="p-4">
                <div className="space-y-4">
                  <div className="font-medium">
                    Question {index + 1}: {question.text}
                  </div>
                  <RadioGroup
                    value={answers[question.id]}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                  >
                    {Array.isArray(question.options) && question.options.map((option, optionIndex) => (
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
                "Submit Quiz"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}