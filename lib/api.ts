import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { logout, checkTokenValidity } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token and handle FormData
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (token) {
      // Check if token is valid before using it
      if (!checkTokenValidity(token)) {
        // Token is invalid or expired, logout immediately
        if (typeof window !== "undefined") {
          logout();
        }
        return Promise.reject(new Error("Token expired"));
      }
      
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // If FormData is being sent, remove default Content-Type header
    // Axios will automatically set Content-Type with boundary for FormData
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - sign out and redirect to login
      if (typeof window !== "undefined") {
        logout();
      }
    }
    
    // Handle 403 Forbidden errors with meaningful message (prefer message over error code)
    if (error.response?.status === 403) {
      const responseData = error.response.data as { error?: string; message?: string } | undefined;
      const message =
        responseData?.message ||
        responseData?.error ||
        "You do not have permission to perform this action";
      error.message = message;
    }
    
    // Extract error message from response for other errors (prefer message over error code)
    if (error.response?.data) {
      const responseData = error.response.data as { error?: string; message?: string };
      const displayMessage =
        responseData.message ||
        responseData.error ||
        error.message;
      error.message = displayMessage;
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
