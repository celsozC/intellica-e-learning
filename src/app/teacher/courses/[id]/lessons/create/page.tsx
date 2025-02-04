"use client";

import { useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateLessonPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Add the file to formData if it exists
      if (file) {
        formData.append("file", file);
      }

      const { data } = await axios.post(
        `/api/teacher/course/${params.id}/lessons/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Success",
        description: "Lesson created successfully",
      });

      // Redirect to the lesson details page
      router.push(`/teacher/courses/${params.id}/`);
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast({
        title: "Error",
        description: "Failed to create lesson",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container pt-24 mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter lesson title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter lesson description"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Enter lesson content"
                  required
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sequenceOrder" className="text-sm font-medium">
                  Sequence Order
                </label>
                <Input
                  id="sequenceOrder"
                  name="sequenceOrder"
                  type="number"
                  min="1"
                  placeholder="Enter sequence order"
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Course Material (Optional)
                  </label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a PDF, DOC, or image file
                  </p>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>

                {file && (
                  <div className="flex items-center justify-between p-2 border rounded bg-muted">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Create Lesson
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
