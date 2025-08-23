import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, Spinner, Center } from "@chakra-ui/react";

const ProtectedRoute = ({ children }) => {
  // const { isAuthenticated, isLoading } = useAuth();
  // TODO: Remove this after done this feature
  const isAuthenticated = true;
  const isLoading = false;
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
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, hiển thị children
  return children;
};

export default ProtectedRoute;
