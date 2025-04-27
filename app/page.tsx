import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Brain, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Turn PDFs into Interactive Quizzes
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Upload your PDFs and instantly generate smart quizzes to test knowledge and improve retention.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/login">
                <Button size="lg" className="animate-pulse">
                  Get Started
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-3 p-6 bg-card rounded-lg shadow-sm transition-all hover:shadow-md">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">PDF Processing</h3>
              <p className="text-center text-muted-foreground">
                Upload any PDF document and our system will analyze the content.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 bg-card rounded-lg shadow-sm transition-all hover:shadow-md">
              <div className="p-3 rounded-full bg-primary/10">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Intelligent Quiz Generation</h3>
              <p className="text-center text-muted-foreground">
                AI-powered technology creates relevant questions based on document content.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 bg-card rounded-lg shadow-sm transition-all hover:shadow-md">
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Performance Tracking</h3>
              <p className="text-center text-muted-foreground">
                Track progress and analyze results to improve knowledge retention.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}