import React from "react";
import { Box, Flex, HStack, Text, Badge } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useColorModeValue } from "@chakra-ui/react";
import MenuButton from "../../atoms/MenuButton";
import { useLayoutUi } from "../../../contexts/UiContext";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    id: "products",
    label: "Sản phẩm",
    path: "/products",
  },
  {
    id: "sales",
    label: "Bán hàng",
    path: "/sales",
  },
  {
    id: "inventory",
    label: "Nhập kho",
    path: "/inventory",
  },
  {
    id: "customers",
    label: "Khách hàng",
    path: "/customers",
  },
  {
    id: "reports",
    label: "Báo cáo",
    path: "/reports",
  },
  {
    id: "analytics",
    label: "Thống kê",
    path: "/analytics",
  },
];

const Header = () => {
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { isSidebarOpen, toggleSidebar } = useLayoutUi();

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find((item) => item.path === location.pathname);
    return currentItem?.label || "Dashboard";
  };

  const getCurrentPageDescription = () => {
    if (location.pathname === "/dashboard") {
      return "Tổng quan hệ thống";
    }
    return `Quản lý ${getCurrentPageTitle().toLowerCase()}`;
  };

  return (
    <Box
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px={6}
      py={4}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={4}>
          <MenuButton onClick={toggleSidebar} isOpen={isSidebarOpen} />
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {getCurrentPageTitle()}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {getCurrentPageDescription()}
            </Text>
          </Box>
        </HStack>

        <HStack spacing={4}>
          <Badge colorScheme="green" variant="subtle">
            Online
          </Badge>
          <Text fontSize="sm" color="gray.600">
            {new Date().toLocaleDateString("vi-VN")}
          </Text>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
