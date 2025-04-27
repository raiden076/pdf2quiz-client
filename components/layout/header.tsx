"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FileText, Menu, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setTheme, theme } = useTheme();

  // Check if user is authenticated - This will be replaced with actual auth check
  useEffect(() => {
    // For now, just checking if we're in a protected route
    setIsAuthenticated(pathname?.includes('/dashboard') || pathname?.includes('/quiz') || pathname?.includes('/sessions'));
  }, [pathname]);

  // Handle scroll event to update header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled || isAuthenticated
          ? "bg-background/95 backdrop-blur-sm border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-lg font-bold">PDF Quiz</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link 
                href="/dashboard" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Dashboard
              </Link>
              <Link 
                href="/quiz/create" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/quiz/create" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Create Quiz
              </Link>
              <Link 
                href="/sessions" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname?.includes("/sessions") ? "text-primary" : "text-muted-foreground"
                )}
              >
                History
              </Link>
              <Link 
                href="/profile" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/profile" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Profile
              </Link>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/login" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Login
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </nav>
        
        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-6 pt-6">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-lg font-bold"
                >
                  <FileText className="h-5 w-5" />
                  PDF Quiz
                </Link>
                <nav className="grid gap-4">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        href="/dashboard" 
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/quiz/create" 
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          pathname === "/quiz/create" ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        Create Quiz
                      </Link>
                      <Link 
                        href="/sessions" 
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          pathname?.includes("/sessions") ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        History
                      </Link>
                      <Link 
                        href="/profile" 
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          pathname === "/profile" ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        Profile
                      </Link>
                      <Button variant="outline" size="sm">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          pathname === "/login" ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        Login
                      </Link>
                      <Link href="/register">
                        <Button size="sm" className="w-full">Register</Button>
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}