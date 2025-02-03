"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, BookOpen, Layers, User, ChevronLeft } from "lucide-react";
import axios from "axios";

interface Category {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  user: {
    fullName: string;
    email: string;
  };
}

export default function AdminCreateCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    teacherId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, teachersRes] = await Promise.all([
          axios.get("/api/get-categories"),
          axios.get("/api/get-teacher"),
        ]);

        setCategories(categoriesRes.data.categories);
        setTeachers(teachersRes.data.teachers);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("/api/admin/courses/create", formData);

      toast({
        title: "Success",
        description: "Course created successfully",
      });

      router.push(`/admin/courses/${data.id}`);
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-14 bg-gradient-to-b from-background to-muted">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mb-4"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Create New Course
              </h1>
              <p className="text-muted-foreground mt-2">
                Admin Course Creation Panel
              </p>
            </div>
          </div>

          {/* Course Form */}
          <Card className="border-primary/10">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label className="text-base font-medium inline-flex items-center">
                        <BookOpen className="mr-2 h-4 w-4 text-primary" />
                        Course Title
                      </Label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Advanced Web Development"
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium inline-flex items-center">
                        <Layers className="mr-2 h-4 w-4 text-primary" />
                        Category
                      </Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          handleSelectChange("categoryId", value)
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="cursor-pointer"
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium inline-flex items-center">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        Assign Teacher
                      </Label>
                      <Select
                        value={formData.teacherId}
                        onValueChange={(value) =>
                          handleSelectChange("teacherId", value)
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem
                              key={teacher.id}
                              value={teacher.id}
                              className="cursor-pointer"
                            >
                              {teacher.user.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Course Description
                      </Label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide a detailed description of the course..."
                        className="min-h-[280px] resize-none"
                        required
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.title ||
                      !formData.description ||
                      !formData.categoryId ||
                      !formData.teacherId
                    }
                    className="w-full h-12 text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Course...
                      </>
                    ) : (
                      "Create Course"
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
