"use client";

import * as React from "react";
import {
  Moon,
  Sun,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, setUser, logout } = useAuthStore();
  const { setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/auth/me");
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount and route changes
  useEffect(() => {
    fetchUser();
  }, [pathname]); // Re-run when pathname changes

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <nav
        className={`fixed top-0 left-0 right-0 border-b bg-background/75 backdrop-blur-sm transition-all duration-200 z-50 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <div
          className={`flex items-center justify-between px-4 container mx-auto h-full transition-all duration-200`}
        >
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain border border-zinc-800 invert dark:invert-0 rounded-md"
                priority
              />
            </div>
          </Link>
          <Button variant="ghost" disabled>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 border-b bg-background/75 backdrop-blur-sm transition-all duration-200 z-50 ${
        scrolled ? "h-14" : "h-16"
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 container mx-auto h-full transition-all duration-200`}
      >
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative h-8 w-8">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain border border-zinc-800 invert dark:invert-0 rounded-md"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <div className="flex flex-col items-start text-sm">
                    <span>
                      {user.fullName}
                      {" / "}
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.role.name}
                      </span>
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/${user.role.name.toLowerCase()}`)
                  }
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>

                {user.role.name !== "admin" && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/${user.role.name.toLowerCase()}/profile`)
                      }
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
