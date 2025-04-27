"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { getSessions } from '@/lib/api';
import type { Session } from '@/lib/types';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await getSessions();
        if (response.success && response.data) {
          // Sort sessions by date (most recent first)
          const sortedSessions = [...response.data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setSessions(sortedSessions);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, []);
  
  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Loading state UI
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quiz History</h1>
            <p className="text-muted-foreground">
              View and analyze your past quiz sessions
            </p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full mb-4" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz History</h1>
          <p className="text-muted-foreground">
            View and analyze your past quiz sessions
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredSessions.length > 0 ? (
          <div className="space-y-6">
            {/* Cards view for small screens */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:hidden">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg truncate">{session.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.date), 'MMM d, yyyy')}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-3">
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
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/sessions/${session.id}`} className="w-full">
                      <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Table view for larger screens */}
            <div className="hidden md:block rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.title}</TableCell>
                      <TableCell>{format(new Date(session.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span 
                            className={`font-medium ${
                              (session.score / session.totalQuestions) > 0.8 ? 'text-green-600 dark:text-green-400' : 
                              (session.score / session.totalQuestions) > 0.6 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {Math.round((session.score / session.totalQuestions) * 100)}%
                          </span>
                          <Progress 
                            value={(session.score / session.totalQuestions) * 100} 
                            className="h-2 w-24" 
                            indicatorColor={
                              (session.score / session.totalQuestions) > 0.8 ? 'bg-green-500' : 
                              (session.score / session.totalQuestions) > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>{session.score}/{session.totalQuestions}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/sessions/${session.id}`}>
                          <Button size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No sessions found</h3>
            <p className="text-muted-foreground mt-1">
              {sessions.length > 0 
                ? "No sessions match your search."
                : "You haven't taken any quizzes yet."}
            </p>
            <Link href="/quiz/create" className="mt-4">
              <Button>Create Quiz</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}