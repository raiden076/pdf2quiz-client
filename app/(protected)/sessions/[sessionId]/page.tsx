"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle, 
  Download, 
  RefreshCcw,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getSessionDetail } from '@/lib/api';
import type { SessionDetail } from '@/lib/types';

export default function SessionDetailPage(props: { params: Promise<{ sessionId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  const { sessionId } = params;

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionDetail = async () => {
      setIsLoading(true);
      try {
        const response = await getSessionDetail(sessionId);
        if (response.success && response.data) {
          setSession(response.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: response.error || 'Failed to load session details',
          });
        }
      } catch (error) {
        console.error('Failed to fetch session details:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionDetail();
  }, [sessionId, toast]);

  const exportToPDF = () => {
    toast({
      title: 'Export initiated',
      description: 'Your results are being exported to PDF.',
    });
    
    // In a real app, this would call an API to generate a PDF
    setTimeout(() => {
      toast({
        title: 'Export complete',
        description: 'Your results have been exported to PDF.',
      });
    }, 2000);
  };

  const retakeQuiz = () => {
    if (!session) return;
    
    // In a real app, this would call an API to create a new session with the same quiz
    router.push(`/quiz/${session.quizId}`);
  };

  // Calculate statistics
  const percentageScore = session 
    ? Math.round((session.score / session.totalQuestions) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/sessions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-full mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center space-y-6 p-8">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Session Not Found</h2>
                  <p className="text-muted-foreground">
                    We couldn't find this session. It may have been deleted or you don't have access to it.
                  </p>
                </div>
                <Button onClick={() => router.push('/sessions')}>
                  Back to Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/sessions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{session.title}</h1>
          <p className="text-muted-foreground">
            Completed on {format(new Date(session.date), 'MMMM d, yyyy')}
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                <span className="text-3xl font-bold">
                  {percentageScore}%
                </span>
                <span className="text-sm text-muted-foreground">Overall Score</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {session.score}
                </span>
                <span className="text-sm text-muted-foreground">Correct Answers</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {session.totalQuestions - session.score}
                </span>
                <span className="text-sm text-muted-foreground">Incorrect Answers</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score</span>
                <span>{percentageScore}%</span>
              </div>
              <Progress 
                value={percentageScore} 
                className="h-4 rounded-md" 
                indicatorColor={
                  percentageScore > 80 ? 'bg-green-500' : 
                  percentageScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                }
              />
            </div>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Button variant="outline" onClick={exportToPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
              <Button onClick={retakeQuiz}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Question Review</h2>
          
          {session.questionsWithAnswers.map((item, index) => (
            <Card key={index} className={`border-l-4 ${
              item.isCorrect 
                ? 'border-l-green-500 dark:border-l-green-600' 
                : 'border-l-red-500 dark:border-l-red-600'
            }`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2 items-start">
                    <span className="font-medium">Q{index + 1}.</span>
                    <div className="flex-1">
                      <p className="font-medium">{item.question.text}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 ml-6">
                    {item.question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className={`p-3 rounded-md border flex items-start gap-3 ${
                          item.question.correctOption === optionIndex
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                            : item.userAnswer === optionIndex && !item.isCorrect
                            ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                            : 'border-input'
                        }`}
                      >
                        {item.question.correctOption === optionIndex ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        ) : item.userAnswer === optionIndex ? (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-input shrink-0 mt-0.5" />
                        )}
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                  
                  {!item.isCorrect && (
                    <div className="ml-6 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Correct Answer:</p>
                      <p className="text-sm">
                        {item.question.options[item.question.correctOption]}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}