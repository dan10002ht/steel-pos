import React from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
} from "@chakra-ui/react";
import { LogOut, User, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Lỗi đăng xuất",
        description: "Có lỗi xảy ra khi đăng xuất",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={6}
      py={4}
      shadow="sm"
    >
      <Flex justify="space-between" align="center">
        {/* Logo và tên ứng dụng */}
        <Flex align="center" gap={3}>
          <Box
            w="8"
            h="8"
            bg="blue.500"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
          >
            <Text fontSize="sm" fontWeight="bold">
              SP
            </Text>
          </Box>
          <Heading size="md" color="gray.800">
            Steel POS
          </Heading>
        </Flex>

        {/* User menu */}
        <HStack spacing={4}>
          <Text fontSize="sm" color="gray.600">
            Xin chào, {user?.full_name || "User"}
          </Text>

          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              size="sm"
              px={3}
              py={2}
              borderRadius="md"
              _hover={{ bg: "gray.100" }}
            >
              <HStack spacing={2}>
                <Avatar size="sm" name={user?.full_name} />
                <Text fontSize="sm" fontWeight="medium">
                  {user?.username}
                </Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<User size={16} />}>Thông tin cá nhân</MenuItem>
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
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
