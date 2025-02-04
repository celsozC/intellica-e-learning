"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useEffect, useState, use } from "react";
import { MessageSquare } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Discussion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  lessonId: string;
  author: {
    fullName: string;
    profileImage?: string;
  };
  replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: {
    fullName: string;
    profileImage?: string;
  };
}

interface ReplyInput {
  content: string;
  discussionId: string;
}

export default function LessonDiscussionsPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const resolvedParams = use(params);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/teacher/course/${resolvedParams.id}/lessons/${resolvedParams.lessonId}/discussions/fetchData`
        );
        setDiscussions(response.data);
      } catch (error) {
        console.error("Error fetching discussions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, resolvedParams.lessonId]);

  const handleReply = async (discussionId: string) => {
    try {
      const response = await axios.post(
        `/api/teacher/course/${resolvedParams.id}/lessons/${resolvedParams.lessonId}/discussions/${discussionId}/reply`,
        {
          content: replyInputs[discussionId],
        }
      );

      setDiscussions(
        discussions.map((discussion) => {
          if (discussion.id === discussionId) {
            return {
              ...discussion,
              replies: [...discussion.replies, response.data],
            };
          }
          return discussion;
        })
      );

      setReplyInputs((prev) => ({
        ...prev,
        [discussionId]: "",
      }));
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    discussionId: string
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid new line
      if (replyInputs[discussionId]?.trim()) {
        handleReply(discussionId);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={discussion.id}
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-muted-foreground/20">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex-shrink-0 relative shadow-sm">
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-primary">
                        {discussion.author.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-foreground/90 hover:text-primary transition-colors">
                          {discussion.title}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground/80">
                        by{" "}
                        <span className="text-primary/80">
                          {discussion.author.fullName}
                        </span>
                      </p>
                      <p className="text-sm text-foreground/80 bg-muted/50 p-3 rounded-lg">
                        {discussion.content}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pl-14 space-y-4">
                    {discussion.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="flex items-start space-x-3 group"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex-shrink-0 relative shadow-sm">
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-primary">
                            {reply.author.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 bg-muted/30 p-3 rounded-lg group-hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-foreground/90">
                              {reply.author.fullName}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3 mt-4">
                      <Textarea
                        placeholder="Write a reply... (Press Enter to submit, Shift+Enter for new line)"
                        value={replyInputs[discussion.id] || ""}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({
                            ...prev,
                            [discussion.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => handleKeyDown(e, discussion.id)}
                        className="min-h-[100px] flex-1 bg-background resize-none focus:ring-2 ring-primary/20"
                      />
                      <Button
                        onClick={() => handleReply(discussion.id)}
                        disabled={!replyInputs[discussion.id]?.trim()}
                        className="self-start bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {discussions.length === 0 && (
            <Card className="border-dashed border-2 border-muted-foreground/20">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <MessageSquare className="h-12 w-12 text-primary/20 mb-4" />
                  <h3 className="text-lg font-medium text-foreground/80">
                    No discussions yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No discussions available for this lesson
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
