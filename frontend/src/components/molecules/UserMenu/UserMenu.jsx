import React from "react";
import { Box, Button, Menu, MenuButton, MenuList, MenuItem, MenuDivider, HStack } from "@chakra-ui/react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/useAuthContext";
import UserAvatar from "../../atoms/UserAvatar";
import { useColorModeValue } from "@chakra-ui/react";

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
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
          <UserAvatar user={user} />
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
  );
};

export default UserMenu;
