import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { Box, Spinner, Center } from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "./Layout/MainLayout";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Hiển thị loading spinner khi đang kiểm tra authentication
  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // Nếu đã đăng nhập, hiển thị children hoặc Outlet
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;
