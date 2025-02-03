"use client";
import { motion } from "framer-motion";
import { Users, BookOpen, ChevronRight, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface Lesson {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  lessons?: Lesson[];
  _count?: {
    enrollments: number;
  };
  createdAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses");
        console.log("Courses data:", response.data);
        setCourses(response.data.courses);
      } catch (err) {
        setError("Failed to fetch courses");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Course Overview
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60"
          >
            Detailed view of all available courses and their lessons
          </motion.p>
        </div>

        <div className="space-y-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() =>
                  setExpandedCourse(
                    expandedCourse === course.id ? null : course.id
                  )
                }
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-white/60 text-sm mb-4">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-white/40 text-sm">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons?.length || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course._count?.enrollments || 0} enrolled</span>
                  </div>
                </div>

                {/* Lessons Section */}
                {expandedCourse === course.id &&
                  course.lessons &&
                  course.lessons.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h4 className="text-white font-medium mb-4">
                        Course Lessons
                      </h4>
                      <div className="space-y-4">
                        {course.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="bg-white/5 rounded-xl p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-white font-medium">
                                {lessonIndex + 1}. {lesson.title}
                              </h5>
                              <span className="text-white/40 text-sm">
                                {new Date(
                                  lesson.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white/60 text-sm">
                              {lesson.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
