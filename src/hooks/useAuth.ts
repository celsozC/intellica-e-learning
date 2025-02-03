"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  email: string;
  fullName: string;
  profileImage: string;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Auth check response:", data);

        if (data.user) {
          console.log("User data:", JSON.stringify(data.user, null, 2));
          setUser(data.user);
        } else {
          console.log("No user data in response");
          setUser(null);
        }
      } else {
        console.log("Auth check failed:", response.status);
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      toast({
        title: "Logged out successfully",
        description: "You are now logged out",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    console.log(
      "Current user state:",
      user ? JSON.stringify(user, null, 2) : "null"
    );
  }, [user]);

  return {
    user,
    loading,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };
}
