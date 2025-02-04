"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { use } from "react";
import axios from "axios";
import { MessageSquare, Reply, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface Author {
  id: string;
  fullName: string;
}

interface Lesson {
  id: string;
  title: string;
  discussions: Discussion[];
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: Author;
  replies: {
    id: string;
    content: string;
    createdAt: string;
    author: Author;
  }[];
}

export default function LessonDiscussions({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const resolvedParams = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchLessonDiscussions();
  }, [resolvedParams]);

  const fetchLessonDiscussions = async () => {
    try {
      const response = await axios.get(
        `/api/student/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}/discussions/fetchData`
      );
      setLesson(response.data.lesson);
    } catch (error) {
      setError("Failed to load lesson discussions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (discussionId: string) => {
    try {
      // First get the user data
      const user = await axios.get(
        `/api/student/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}/discussions/${discussionId}/details`
      );

      // Then send the reply with the user ID
      const response = await axios.post(
        `/api/student/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}/discussions/${discussionId}/reply`,
        {
          content: replyContent,
          discussionId,
          authorId: user.data.user.id,
        }
      );

      setReplyContent("");
      setReplyingTo(null);
      fetchLessonDiscussions();
    } catch (error) {
      console.error("Failed to post reply:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        Loading discussions...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center p-12">
        Lesson not found
      </div>
    );
  }

  const discussions = lesson.discussions || [];

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20">
      <div className="absolute inset-0" />

      <div className="relative max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <Link
          href={`/student/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}`}
        >
          <Button
            variant="ghost"
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Lesson
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {lesson.title} - Discussions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View discussions for this lesson
          </p>
        </div>

        {/* Discussions List */}
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  No discussions available for this lesson.
                </p>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{discussion.author.fullName}</span>
                        <span>•</span>
                        <span>
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {discussion.content}
                    </p>

                    {/* Replies Section */}
                    <div className="space-y-4">
                      {discussion.replies?.length > 0 && (
                        <div className="ml-6 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          {discussion.replies.map((reply) => (
                            <div key={reply.id} className="text-sm">
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                <span>{reply.author.fullName}</span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    reply.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Button and Form */}
                      <div className="mt-4">
                        {replyingTo === discussion.id ? (
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Write your reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="w-full min-h-[100px] bg-transparent"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReply(discussion.id)}
                                disabled={!replyContent.trim()}
                              >
                                Post Reply
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setReplyingTo(discussion.id)}
                          >
                            <Reply className="h-4 w-4" />
                            Reply to Discussion
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
