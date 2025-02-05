"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice';
  options: string[];
  correctAnswer: string;
  points: number;
}

type AssessmentType = 'quiz' | 'exam';

export default function CreateQuizExamPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('quiz');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "",
      type: 'multiple_choice',
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 20, // Default points per question
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleQuestionChange = (index: number, field: keyof Question, value: string | string[]) => {
    const newQuestions = [...questions];
    if (field === 'options') {
      newQuestions[index][field] = value as string[];
    } else {
      newQuestions[index][field] = value as string;
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: (questions.length + 1).toString(),
        question: "",
        type: 'multiple_choice',
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 20, // Default points per question
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question || q.options.some(opt => !opt) || !q.correctAnswer) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please complete all questions and options",
        });
        return;
      }
      if (!q.options.includes(q.correctAnswer)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Correct answer must be one of the options",
        });
        return;
      }
    }

    try {
      setSubmitting(true);
      const endpoint = assessmentType === 'quiz' 
        ? `/api/teacher/course/${params.id}/lessons/${params.lessonId}/quiz`
        : `/api/teacher/course/${params.id}/lessons/${params.lessonId}/exam`;

      const response = await axios.post(endpoint, {
        title,
        description,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        maxScore: questions.reduce((sum, q) => sum + q.points, 0),
        questions: {
          questions: questions.map(q => ({
            id: q.id,
            question: q.question,
            type: 'multiple_choice',
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points
          }))
        },
        lessonId: params.lessonId,
      });

      toast({
        title: "Success",
        description: `${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} created successfully`,
      });

      router.push(`/teacher/courses/${params.id}/`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || `Failed to create ${assessmentType}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Quiz/Exam</CardTitle>
            <CardDescription>
              Create a multiple choice assessment for your students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Assessment Type</Label>
                <RadioGroup
                  value={assessmentType}
                  onValueChange={(value: AssessmentType) => setAssessmentType(value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quiz" id="quiz" />
                    <Label htmlFor="quiz">Quiz</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exam" id="exam" />
                    <Label htmlFor="exam">Exam</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="title">{assessmentType === 'quiz' ? 'Quiz' : 'Exam'} Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Enter ${assessmentType} title`}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter quiz/exam description"
                />
              </div>
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="Enter time limit in minutes"
                />
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <Card key={question.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">
                      Question {questionIndex + 1}
                    </CardTitle>
                    {questions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) =>
                          handleQuestionChange(questionIndex, "question", e.target.value)
                        }
                        placeholder="Enter your question"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Options</Label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(questionIndex, optionIndex, e.target.value)
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label>Correct Answer</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={question.correctAnswer}
                        onChange={(e) =>
                          handleQuestionChange(questionIndex, "correctAnswer", e.target.value)
                        }
                      >
                        <option value="">Select correct answer</option>
                        {question.options.map((option, index) => (
                          option && (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          )
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) =>
                          handleQuestionChange(questionIndex, "points", e.target.value)
                        }
                        min="1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={addQuestion} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating {assessmentType === 'quiz' ? 'Quiz' : 'Exam'}...
                </>
              ) : (
                `Create ${assessmentType === 'quiz' ? 'Quiz' : 'Exam'}`
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
