import { useState, useEffect } from "react";
import { useCreateApi, useFetchApi } from "./index";
import { apiUtils } from "../shared/services/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useCreateApi("/auth/login", {
    onSuccess: (data) => {
      const userData = data.data;
      localStorage.setItem("accessToken", userData.access_token);
      localStorage.setItem("refreshToken", userData.refresh_token);
      localStorage.setItem("user", JSON.stringify(userData.user));

      setUser(userData.user);
      setIsAuthenticated(true);
    },
    onError: (error) => {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    },
  });

  const whoAmIQuery = useFetchApi(
    apiUtils.createListQueryKey("auth", "whoami"),
    "/auth/whoami",
    {
      enabled: false, // Chỉ chạy khi cần thiết
      retry: false,
    }
  );

  // Refresh token mutation
  const refreshTokenMutation = useCreateApi("/auth/refresh", {
    onSuccess: (data) => {
      const { access_token } = data.data;
      localStorage.setItem("accessToken", access_token);
    },
    onError: () => {
      // Refresh token failed, logout
      logout();
    },
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  // Check auth status
  const checkAuthStatus = async () => {
    try {
      const hasToken = !!localStorage.getItem("accessToken");

      if (!hasToken) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Verify token với server và lấy thông tin user hiện tại
      const response = await whoAmIQuery.refetch();
      const userData = response.data.data;

      setUser(userData);
      setIsAuthenticated(true);

      // Cập nhật localStorage với thông tin mới nhất từ server
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Auth check error:", error);
      // Token không hợp lệ, xóa khỏi localStorage
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,

    // Actions
    login: loginMutation.mutate,
    logout,
    checkAuthStatus,

    // Mutation states
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    // Refresh token
    refreshToken: refreshTokenMutation.mutate,
    isRefreshing: refreshTokenMutation.isPending,
  };
};
