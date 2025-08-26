import React from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Divider,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ChevronDown,
  User,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  Home,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Home size={20} />,
    path: "/dashboard",
  },
  {
    id: "products",
    label: "Sản phẩm",
    icon: <Package size={20} />,
    path: "/products",
  },
  {
    id: "inventory",
    label: "Nhập kho",
    icon: <Package size={20} />,
    path: "/inventory",
  },
  {
    id: "customers",
    label: "Khách hàng",
    icon: <Users size={20} />,
    path: "/customers",
  },
  {
    id: "reports",
    label: "Báo cáo",
    icon: <BarChart3 size={20} />,
    path: "/reports",
  },
  {
    id: "analytics",
    label: "Thống kê",
    icon: <TrendingUp size={20} />,
    path: "/analytics",
  },
];

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const isActiveRoute = (path) => {
    if (path === "/inventory") {
      return location.pathname.startsWith("/inventory");
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Sidebar Navigation */}
      <Box
        w="280px"
        bg={bgColor}
        borderRight="1px"
        borderColor={borderColor}
        position="fixed"
        h="100%"
        overflowY="auto"
        zIndex={20}
      >
        {/* Logo Section */}
        <Box p={6} borderBottom="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Box
              w="10"
              h="10"
              bg="blue.500"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
            >
              <Text fontSize="lg" fontWeight="bold">
                SP
              </Text>
            </Box>
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                Steel POS
              </Text>
              <Text fontSize="xs" color="gray.500">
                Point of Sale System
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Navigation Menu */}
        <VStack spacing={1} p={4} align="stretch">
          {menuItems.map((item) => (
            <Box key={item.id}>
              <Button
                variant={isActiveRoute(item.path) ? "solid" : "ghost"}
                colorScheme={isActiveRoute(item.path) ? "blue" : "gray"}
                justifyContent="flex-start"
                w="full"
                h="auto"
                py={3}
                px={4}
                onClick={() => navigate(item.path)}
                _hover={{
                  bg: isActiveRoute(item.path) ? "blue.600" : hoverBg,
                }}
                transition="all 0.2s"
              >
                <HStack spacing={3} w="full">
                  {item.icon}
                  <Text fontSize="sm" fontWeight="medium">
                    {item.label}
                  </Text>
                </HStack>
              </Button>

              {/* Sub-menu items */}
              {item.subItems && isActiveRoute(item.path) && (
                <VStack spacing={1} mt={2} ml={4} align="stretch">
                  {item.subItems.map((subItem) => (
                    <Button
                      key={subItem.id}
                      variant={isActiveRoute(subItem.path) ? "solid" : "ghost"}
                      colorScheme={
                        isActiveRoute(subItem.path) ? "blue" : "gray"
                      }
                      justifyContent="flex-start"
                      w="full"
                      h="auto"
                      py={2}
                      px={4}
                      size="sm"
                      onClick={() => navigate(subItem.path)}
                      _hover={{
                        bg: isActiveRoute(subItem.path) ? "blue.600" : hoverBg,
                      }}
                      transition="all 0.2s"
                    >
                      <Text fontSize="sm" fontWeight="medium">
                        {subItem.label}
                      </Text>
                    </Button>
                  ))}
                </VStack>
              )}
            </Box>
          ))}
        </VStack>

        {/* User Section */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={4}
          borderTop="1px"
          borderColor={borderColor}
          bg={bgColor}
        >
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              w="full"
              justifyContent="flex-start"
              h="auto"
              py={3}
              px={4}
              _hover={{ bg: hoverBg }}
            >
              <HStack spacing={3} w="full">
                <Avatar size="sm" name={user?.full_name || user?.username} />
                <VStack align="flex-start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {user?.full_name || user?.username || "User"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user?.role || "User"}
                  </Text>
                </VStack>
                <ChevronDown size={16} />
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<User size={16} />}>Hồ sơ</MenuItem>
              <MenuItem icon={<Settings size={16} />}>Cài đặt</MenuItem>
              <MenuDivider />
              <MenuItem
                icon={<LogOut size={16} />}
                onClick={handleLogout}
                color="red.500"
              >
                Đăng xuất
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box ml="280px" flex={1} minH="100vh">
        {/* Top Header */}
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
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                {menuItems.find((item) => item.path === location.pathname)
                  ?.label || "Dashboard"}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {location.pathname === "/dashboard"
                  ? "Tổng quan hệ thống"
                  : `Quản lý ${
                      menuItems
                        .find((item) => item.path === location.pathname)
                        ?.label?.toLowerCase() || ""
                    }`}
              </Text>
            </Box>

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

        {/* Page Content */}
        <Box p={6}>{children}</Box>
      </Box>
    </Flex>
  );
};

export default MainLayout;
