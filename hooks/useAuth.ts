import { useMutation } from "@tanstack/react-query";
import { authService, type LoginCredentials } from "@/services/auth.service";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { getDecodedToken } from "@/lib/auth";
import { getFirstAllowedRoute } from "@/lib/permissions";
import { toast } from "sonner";
import type { ApiResponse, LoginResponse } from "@/types";

/**
 * Login mutation hook
 */
export function useLogin() {
  const { refreshUser } = useAuthContext();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (response) => {
      // Based on old code analysis: API returns { token: "...", user: {...} } directly
      // authService.login returns response.data (axios response.data)
      // So response here is the actual API response body: { token: "...", user: {...} }
      const loginResponse = response as unknown as LoginResponse | ApiResponse<LoginResponse>;
      
      // Try both structures: direct token or nested in data
      const token = 
        (loginResponse as LoginResponse).token || 
        ((loginResponse as ApiResponse<LoginResponse>).data?.token);
      
      if (token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          refreshUser();
          toast.success("Login successful! Welcome back.");
          // Redirect to first route the user has permission for (e.g. if no Overview permission, go to Courses or Users etc.)
          setTimeout(() => {
            const decoded = getDecodedToken();
            const permissions = decoded?.permissions;
            const target = getFirstAllowedRoute(Array.isArray(permissions) ? permissions : undefined);
            const path = target ?? "/";
            if (window.location.pathname !== path) {
              window.location.href = path;
            }
          }, 100);
        }
      } else {
        console.error("Login response structure:", response);
        toast.error("Login failed: Token not found in response");
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid email or password!";
      toast.error(errorMessage);
    },
  });
}
