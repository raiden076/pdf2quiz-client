// Authentication Types
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {}

// Quiz Types
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
}

export interface Quiz {
  id: string;
  title: string;
  created: string;
  questions: QuizQuestion[];
  status: 'processing' | 'ready' | 'failed';
}

export interface QuizSubmission {
  quizId: string;
  answers: number[];
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  questionsWithAnswers: {
    question: QuizQuestion;
    userAnswer: number;
    isCorrect: boolean;
  }[];
}

// Session Types
export interface Session {
  id: string;
  quizId: string;
  title: string;
  date: string;
  score: number;
  totalQuestions: number;
}

export interface SessionDetail extends Session {
  questionsWithAnswers: {
    question: QuizQuestion;
    userAnswer: number;
    isCorrect: boolean;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}