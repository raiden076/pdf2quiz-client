"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { getSessions } from '@/lib/api';
import { getUserFromToken } from '@/lib/auth';
import type { Session } from '@/lib/types';

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const userInfo = getUserFromToken();
    if (userInfo) {
      setUser({ username: userInfo.username || userInfo.email });
    }

    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await getSessions();
        if (response.success && Array.isArray(response.data)) {
          setSessions(response.data);
        } else {
          // If response.data is not an array, set to empty array
          setSessions([]);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        setSessions([]); // Ensure sessions is an array even on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Calculate statistics
  const totalQuizzes = sessions.length;
  const averageScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, session) => sum + (session.score / session.totalQuestions * 100), 0) / sessions.length)
    : 0;
  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user ? `, ${user.username}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Your PDF quiz generator dashboard. Create new quizzes or review your past sessions.
          </p>
        </section>

        {/* Stats Cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">Quizzes created from PDFs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : `${averageScore}%`}</div>
              <Progress
                value={averageScore}
                className="h-2 mt-2"
                indicatorColor={
                  averageScore > 80 ? 'bg-green-500' :
                  averageScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                }
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : sessions.length > 0 ? (
                  <span>{new Date(sessions[0].date).toLocaleDateString()}</span>
                ) : 'No activity'}
              </div>
              <p className="text-xs text-muted-foreground">Last quiz taken</p>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <Link href="/quiz/create">
              <CardHeader className="flex flex-row items-center gap-4">
                <PlusCircle className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Create New Quiz</CardTitle>
                  <CardDescription>Upload a PDF and generate quiz questions</CardDescription>
                </div>
              </CardHeader>
            </Link>
          </Card>
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <Link href="/sessions">
              <CardHeader className="flex flex-row items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>View All Sessions</CardTitle>
                  <CardDescription>Review your quiz history and performance</CardDescription>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </section>

        {/* Recent Sessions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent Sessions</h2>
            <Link href="/sessions">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : recentSessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle className="truncate">{session.title}</CardTitle>
                    <CardDescription>{new Date(session.date).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Score</span>
                      <span className="font-medium">{Math.round((session.score / session.totalQuestions) * 100)}%</span>
                    </div>
                    <Progress
                      value={(session.score / session.totalQuestions) * 100}
                      className="h-2"
                      indicatorColor={
                        (session.score / session.totalQuestions) > 0.8 ? 'bg-green-500' :
                        (session.score / session.totalQuestions) > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }
                    />
                  </CardContent>
                  <CardFooter>
                    <Link href={`/sessions/${session.id}`} className="w-full">
                      <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No sessions yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first quiz to start learning.
              </p>
              <Link href="/quiz/create" className="mt-4">
                <Button>Create Quiz</Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}