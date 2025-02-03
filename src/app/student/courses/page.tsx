"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Users, GraduationCap } from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface Course {
  id: string;
  title: string;
  description: string;
  teacher: {
    fullName: string;
  };
  _count: {
    lessons: number;
    enrollments: number;
  };
  createdAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/student/courses");
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container pt-24 mx-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col space-y-4">
            <h1 className="text-4xl font-bold">Available Courses</h1>
            <p className="text-muted-foreground">
              Discover and enroll in our wide range of courses
            </p>
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-24 mx-auto p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-4xl font-bold">Available Courses</h1>
          <p className="text-muted-foreground">
            Discover and enroll in our wide range of courses
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link href={`/student/courses/${course.id}`} key={course.id}>
                <Card className="hover:shadow-lg transition-shadow h-full hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        <span>Instructor: {course.teacher.fullName}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <BookOpen className="h-3 w-3" />
                          {course._count.lessons} Lessons
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" />
                          {course._count.enrollments} Students
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
