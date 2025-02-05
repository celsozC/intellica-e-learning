"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Clock, Award, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  maxScore: number;
  questions: {
    questions: Question[];
  };
  createdAt: string;
}

export default function ExamPage({ params }: { params: { id: string; lessonId: string; examId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        console.log("Fetching exam with params:", {
          courseId: params.id,
          lessonId: params.lessonId,
          examId: params.examId
        });
        
        const response = await axios.get(
          `/api/teacher/course/${params.id}/lessons/${params.lessonId}/examFetch/${params.examId}`
        );
        
        console.log("Exam data received:", response.data);
        setExam(response.data);
      } catch (error) {
        console.error("Failed to fetch exam:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load exam data"
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.examId) {
      fetchExam();
    }
  }, [params, toast]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/teacher/course/${params.id}/lessons/${params.lessonId}/examFetch/${params.examId}`);
      toast({
        title: "Success",
        description: "Exam deleted successfully"
      });
      router.push(`/teacher/courses/${params.id}/lessons/${params.lessonId}/quizexam`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete exam"
      });
    }
  };

  if (loading) {
    return <div className="p-6 pt-24">Loading...</div>;
  }

  if (!exam) {
    return (
      <div className="p-6 pt-24">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>Exam not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-24">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Exam
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
            <CardDescription>{exam.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Time Limit: {exam.timeLimit} minutes
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Max Score: {exam.maxScore} points
              </div>
              <div className="text-muted-foreground">
                Created: {format(new Date(exam.createdAt), 'PPP')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions ({exam.questions.questions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {exam.questions.questions.map((question, index) => (
              <Card key={question.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">
                          Question {index + 1}
                        </h3>
                        <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                          <span>{question.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{question.points} points</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-lg mt-2">{question.question}</p>

                    {question.type === "multiple_choice" && (
                      <div className="space-y-2 mt-4">
                        <h4 className="font-medium">Options:</h4>
                        <ul className="space-y-2">
                          {question.options?.map((option, optIndex) => (
                            <li 
                              key={optIndex}
                              className={`p-3 rounded-lg ${
                                option === question.correctAnswer 
                                  ? "bg-green-50 text-green-700 border border-green-200" 
                                  : "bg-gray-50 text-black border border-gray-200"
                              }`}
                            >
                              {option}
                              {option === question.correctAnswer && (
                                <span className="ml-2 text-sm">(Correct Answer)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {question.type === "true_false" && (
                      <div className="mt-4">
                        <h4 className="font-medium">Correct Answer:</h4>
                        <div className="mt-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                          {question.correctAnswer}
                        </div>
                      </div>
                    )}

                    {question.type === "essay" && (
                      <div className="mt-4">
                        <h4 className="font-medium">Expected Answer:</h4>
                        <div className="mt-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg whitespace-pre-wrap">
                          {question.correctAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}