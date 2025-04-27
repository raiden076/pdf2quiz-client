import axios from "axios";
import { getToken } from "./auth";
import type {
  ApiResponse,
  LoginData,
  RegisterData,
  AuthResponse,
  Quiz,
  QuizSubmission,
  QuizResult,
  Session,
  SessionDetail,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to request if available
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const registerUser = async (
  data: RegisterData
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Registration failed",
    };
  }
};

export const loginUser = async (
  data: LoginData
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Login failed",
    };
  }
};

// User APIs
export const getUserProfile = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await api.get<User>("/users/me");
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get user profile",
    };
  }
};

// Quiz APIs
export const uploadPdf = async (
  pdfFile: File
): Promise<ApiResponse<{ quizSetId: string }>> => {
  try {
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);

    const response = await api.post<{ quizSetId: string }>(
      "/quiz/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to upload PDF",
    };
  }
};

export const getQuizStatus = async (
  quizId: string
): Promise<ApiResponse<{ status: string; progress?: number }>> => {
  try {
    const response = await api.get<{ status: string; progress?: number }>(
      `/quiz/status/${quizId}`
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get quiz status",
    };
  }
};

export const getQuiz = async (quizId: string): Promise<ApiResponse<Quiz>> => {
  try {
    const response = await api.get<Quiz>(`/quiz/${quizId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get quiz",
    };
  }
};

export const submitQuiz = async (
  quizId: string,
  answers: number[]
): Promise<ApiResponse<QuizResult>> => {
  try {
    const submission: QuizSubmission = {
      quizId,
      answers,
    };

    const response = await api.post<QuizResult>(
      `/quiz/submit/${quizId}`,
      submission
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to submit quiz",
    };
  }
};

// Session APIs
export const getSessions = async (): Promise<ApiResponse<Session[]>> => {
  try {
    const response = await api.get<Session[]>("/sessions");
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get sessions",
    };
  }
};

export const getSessionDetail = async (
  sessionId: string
): Promise<ApiResponse<SessionDetail>> => {
  try {
    const response = await api.get<SessionDetail>(`/sessions/${sessionId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get session detail",
    };
  }
};
