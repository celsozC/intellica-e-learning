"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, ChevronRight, Clock, Award, ArrowLeft, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface QuizExam {
  id: string;
  title: string;
  description: string;
  timeLimit: number | null;
  maxScore: number;
  questions: {
    questions: Question[];
  };
  attemptCount: number;
  questionCount: number;
  createdAt: string;
}

export default function LessonQuizExam({ params }: { params: { id: string; lessonId: string } }) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizExam[]>([]);
  const [exams, setExams] = useState<QuizExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/teacher/course/${params.id}/lessons/${params.lessonId}/quizexamData`);
        setQuizzes(response.data.quizzes);
        setExams(response.data.exams);

        console.log("CELSOGODDDD: ", response.data);
      } catch (error) {
        console.error("Failed to fetch quiz/exam data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.lessonId]);

  const renderAssessments = (items: QuizExam[], type: "quiz" | "exam") => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            No {type}zes available
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first {type} to get started
          </p>
        </div>
      );
    }

    return items.map((item) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex items-center justify-between p-5 border rounded-xl bg-card hover:bg-accent/50 transition-all hover:shadow-md"
      >
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {item.description}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {item.timeLimit || "No"} time limit
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Award className="h-4 w-4 mr-1" />
                {item.maxScore} points
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {item.questionCount} questions
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {item.attemptCount} attempts
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Created: {format(new Date(item.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() =>
            router.push(
              `/teacher/courses/${params.id}/lessons/${params.lessonId}/${type}/${item.id}`
            )
          }
        >
          <span className="mr-2">View Details</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>
    ));
  };

  if (isLoading) {
    return <div className="p-6 pt-24 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex pt-16 flex-col space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push(`/teacher/courses/${params.id}/`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Lesson Assessments</h1>
          <div className="flex space-x-3">
            <Button
              className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
              onClick={() =>
                router.push(`/teacher/courses/${params.id}/lessons/${params.lessonId}/quizexam/create`)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Quiz/Exam
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="quizzes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes">
          <Card>
            <CardHeader>
              <CardTitle>Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderAssessments(quizzes, "quiz")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderAssessments(exams, "exam")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}