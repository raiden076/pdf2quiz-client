"use client";

import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { User } from "./types";

const TOKEN_COOKIE_KEY = "pdf_quiz_auth_token";

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    try {
      const decoded: any = jwtDecode(token);
      const expiryDate = new Date(decoded.exp * 1000);

      Cookies.set(TOKEN_COOKIE_KEY, token, {
        expires: expiryDate,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict", // Recommended for security
        path: "/", // Make the cookie available on all paths
      });
    } catch (error) {
      console.error("Failed to decode token or set cookie:", error);
      // Optionally, handle this error (e.g., don't set token)
    }
  }
};

// Get the token from the cookie
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return Cookies.get(TOKEN_COOKIE_KEY) || null;
  }
  return null;
};

// Remove the token cookie
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    Cookies.remove(TOKEN_COOKIE_KEY, { path: "/" }); // Specify path when removing
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const getUserFromToken = (): User | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      createdAt: new Date(decoded.iat * 1000).toISOString(),
    };
  } catch (error) {
    return null;
  }
};
