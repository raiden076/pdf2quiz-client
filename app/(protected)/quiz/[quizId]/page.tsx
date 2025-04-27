"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getQuiz, getQuizStatus, submitQuiz } from '@/lib/api';
import type { Quiz, QuizQuestion } from '@/lib/types';

export default function QuizPage(props: { params: Promise<{ quizId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  const { quizId } = params;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [status, setStatus] = useState<'loading' | 'processing' | 'ready' | 'failed'>('loading');
  const [progress, setProgress] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
        const statusResponse = await getQuizStatus(quizId);
        
        if (statusResponse.success && statusResponse.data) {
          const { status: quizStatus, progress: quizProgress } = statusResponse.data;
          
          if (quizStatus === 'ready') {
            setStatus('ready');
            fetchQuiz();
          } else if (quizStatus === 'processing') {
            setStatus('processing');
            setProgress(quizProgress || 0);
            
            // Poll status every 2 seconds
            setTimeout(checkQuizStatus, 2000);
          } else {
            setStatus('failed');
            toast({
              variant: 'destructive',
              title: 'Quiz generation failed',
              description: 'There was an error generating your quiz. Please try again.',
            });
          }
        } else {
          setStatus('failed');
          toast({
            variant: 'destructive',
            title: 'Error',
            description: statusResponse.error || 'Failed to check quiz status',
          });
        }
      } catch (error) {
        setStatus('failed');
        console.error('Failed to check quiz status:', error);
      }
    };
    
    const fetchQuiz = async () => {
      try {
        const quizResponse = await getQuiz(quizId);
        
        if (quizResponse.success && quizResponse.data) {
          setQuiz(quizResponse.data);
          // Initialize answers array with -1 (no answer)
          setUserAnswers(new Array(quizResponse.data.questions.length).fill(-1));
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: quizResponse.error || 'Failed to load quiz',
          });
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    };
    
    checkQuizStatus();
  }, [quizId, toast]);

  const handleAnswerChange = (value: string) => {
    const answerIndex = parseInt(value, 10);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await submitQuiz(quizId, userAnswers);
      
      if (response.success && response.data) {
        toast({
          title: 'Quiz submitted successfully',
          description: `You scored ${response.data.score} out of ${response.data.totalQuestions}`,
        });
        
        // Redirect to results page (this would typically be a separate page)
        router.push(`/sessions/${quizId}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Submission failed',
          description: response.error || 'Failed to submit quiz answers',
        });
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading or processing state
  if (status === 'loading' || status === 'processing') {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-none">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center space-y-6 p-8">
                {status === 'processing' ? (
                  <>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-primary" />
                      <div className="absolute -inset-1">
                        <div className="w-full h-full animate-spin rounded-full border-4 border-t-primary border-b-transparent"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold tracking-tight">Generating Quiz</h2>
                      <p className="text-muted-foreground">
                        Our AI is analyzing your PDF and creating questions.
                      </p>
                    </div>
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold tracking-tight">Loading Quiz</h2>
                      <p className="text-muted-foreground">
                        Please wait while we fetch your quiz data.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render error state
  if (status === 'failed') {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center space-y-6 p-8">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Quiz Generation Failed</h2>
                  <p className="text-muted-foreground">
                    There was a problem generating your quiz. Please try uploading your PDF again.
                  </p>
                </div>
                <Button onClick={() => router.push('/quiz/create')}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the quiz
  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center space-y-6 p-8">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">No Questions Found</h2>
                  <p className="text-muted-foreground">
                    We couldn't find any questions for this quiz. Please try another PDF.
                  </p>
                </div>
                <Button onClick={() => router.push('/quiz/create')}>
                  Create New Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestionData: QuizQuestion = quiz.questions[currentQuestion];
  const allQuestionsAnswered = userAnswers.every((answer) => answer !== -1);

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-2 transition-all duration-300" 
              style={{ 
                width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` 
              }}
            ></div>
          </div>
          
          <Card className="p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                {currentQuestionData.text}
              </h2>
              
              <Separator />
              
              <RadioGroup 
                value={userAnswers[currentQuestion].toString()} 
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestionData.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-muted ${
                      userAnswers[currentQuestion] === index ? 'border-primary' : 'border-input'
                    }`}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {option}
                    </span>
                  </label>
                ))}
              </RadioGroup>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                
                {currentQuestion < quiz.questions.length - 1 ? (
                  <Button
                    onClick={goToNextQuestion}
                    disabled={userAnswers[currentQuestion] === -1}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered || isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
          
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-2 max-w-md">
              {quiz.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={index === currentQuestion ? 'default' : userAnswers[index] !== -1 ? 'outline' : 'ghost'}
                  size="icon"
                  className="w-10 h-10"
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}