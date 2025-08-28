import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuthContext";
import MainLayout from "./organisms/MainLayout";
import SplashScreen from "./SplashScreen";

const ProtectedRoute = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // Hiển thị splash screen khi đang kiểm tra authentication
  if (isLoading) {
    return <SplashScreen />;
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị children hoặc Outlet
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;
