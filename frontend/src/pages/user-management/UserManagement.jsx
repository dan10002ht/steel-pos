import React, { useContext } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { Plus, UserPlus } from "lucide-react";
import Page from "../../components/organisms/Page";
import CreateUserModal from "./components/CreateUserModal";
import UserList from "./components/UserList";
import { AuthContext } from "../../contexts/AuthContext";

const UserManagement = () => {
  const { isAdmin } = useContext(AuthContext);      
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Chỉ admin mới được truy cập trang quản lý tài khoản
  if (!isAdmin) {
    return (
      <Page
        title="Quản lý tài khoản"
        subtitle="Quản lý và tạo tài khoản người dùng trong hệ thống"
        error={{
          message: "Chỉ có quyền quản trị viên mới được truy cập trang này."
        }}
      />
    );
  }

  const handleCreateUserSuccess = () => {
    onClose();
    toast({
      title: "Tạo tài khoản thành công",
      description: "Tài khoản mới đã được tạo thành công.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleCreateUserError = (error) => {
    toast({
      title: "Lỗi tạo tài khoản",
      description: error.message || "Có lỗi xảy ra khi tạo tài khoản.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Page
      title="Quản lý tài khoản"
      subtitle="Quản lý và tạo tài khoản người dùng trong hệ thống"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Quản lý tài khoản", href: "/user-management" },
      ]}
      primaryActions={[
        {
          label: "Tạo tài khoản mới",
          icon: <Plus size={20} />,
          onClick: onOpen,
          colorScheme: "blue",
        },
      ]}
    >
      {/* User List */}
      <Card shadow="sm">
        <CardBody>
          <UserList />
        </CardBody>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleCreateUserSuccess}
        onError={handleCreateUserError}
      />
    </Page>
  );
};

export default UserManagement;
