"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { CheckCircle2, BookOpen, ArrowRight } from "lucide-react";

export default function EnrollmentSuccessPage() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background pt-24 pb-12">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={200}
      />

      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center p-6 shadow-lg">
            <CardHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto"
              >
                <CheckCircle2 className="h-24 w-24 text-primary mx-auto mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold mb-2">
                Congratulations! 🎉
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                You have successfully enrolled in the course
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-primary/10 p-6 rounded-lg"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  What&apos;s Next?
                </h3>
                <ul className="text-left space-y-3 text-muted-foreground">
                  <li>✓ Access all course materials</li>
                  <li>✓ Track your progress</li>
                  <li>✓ Engage with other students</li>
                  <li>✓ Earn your certificate</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              >
                <Button size="lg" asChild>
                  <Link href="/student/enrolled" className="gap-2">
                    Go to My Courses <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/student/courses">Browse More Courses</Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-muted-foreground"
        >
          <p>Need help? Contact our support team</p>
        </motion.div>
      </div>
    </div>
  );
}
