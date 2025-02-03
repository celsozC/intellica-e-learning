"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { use } from "react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import axios from "axios";

interface Teacher {
  id: string;
  user: {
    fullName: string;
    email: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  teacherId: string;
  categoryId: string;
  teacher: Teacher;
  category: Category;
}

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = use(
    params instanceof Promise ? params : Promise.resolve(params)
  );
  const courseId = resolvedParams.id;

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teacherId: "",
    categoryId: "",
    status: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching course data for ID:", courseId);

        const [courseRes, teachersRes, categoriesRes] = await Promise.all([
          axios.get(`/api/admin/courses/${courseId}/edit`),
          axios.get("/api/admin/teachers"),
          axios.get("/api/admin/course-categories"),
        ]);

        console.log("Course data received:", courseRes.data);
        console.log("Teachers data received:", teachersRes.data);
        console.log("Categories data received:", categoriesRes.data);

        setCourse(courseRes.data);
        setTeachers(teachersRes.data);
        setCategories(categoriesRes.data);

        setFormData({
          title: courseRes.data.title,
          description: courseRes.data.description,
          teacherId: courseRes.data.teacherId,
          categoryId: courseRes.data.categoryId,
          status: courseRes.data.status,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch course data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role.name === "admin") {
      fetchData();
    }
  }, [user, courseId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await axios.put(`/api/admin/courses/${courseId}/edit`, formData);
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      router.push(`/admin/courses/${courseId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role.name !== "admin") {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/courses/${courseId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course Details
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Title
                </h3>
                <p className="mt-1">{course?.title}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Status
                </h3>
                <p className="mt-1">{course?.status}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Teacher
                </h3>
                <p className="mt-1">
                  {course?.teacher.user.fullName} ({course?.teacher.user.email})
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Category
                </h3>
                <p className="mt-1">{course?.category.name}</p>
              </div>
              <div className="col-span-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Description
                </h3>
                <p className="mt-1">{course?.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title
                  <span className="text-sm text-muted-foreground ml-2">
                    (Current: {course?.title})
                  </span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter new title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description
                  <span className="text-sm text-muted-foreground ml-2">
                    (Current: {course?.description.substring(0, 50)}...)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter new description"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">
                  Teacher
                  <span className="text-sm text-muted-foreground ml-2">
                    (Current: {course?.teacher.user.fullName})
                  </span>
                </Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacherId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.user.fullName} ({teacher.user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category
                  <span className="text-sm text-muted-foreground ml-2">
                    (Current: {course?.category.name})
                  </span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
