import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  Divider,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import {
  Menu as HamburgerIcon,
  ChevronDown,
  User,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    id: "inventory",
    label: "Quản lý nhập kho",
    icon: <Package size={20} />,
    children: [
      {
        id: "create-import",
        label: "Tạo mới nhập kho",
        icon: <Package size={16} />,
      },
      {
        id: "import-list",
        label: "Danh sách nhập kho",
        icon: <FileText size={16} />,
      },
    ],
  },
  {
    id: "sales",
    label: "Quản lý bán hàng",
    icon: <ShoppingCart size={20} />,
    children: [
      {
        id: "create-invoice",
        label: "Tạo mới hoá đơn",
        icon: <ShoppingCart size={16} />,
      },
      {
        id: "invoice-list",
        label: "Danh sách hoá đơn",
        icon: <FileText size={16} />,
      },
    ],
  },
  {
    id: "products",
    label: "Quản lý sản phẩm",
    icon: <Package size={20} />,
    children: [
      {
        id: "create-product",
        label: "Tạo mới sản phẩm",
        icon: <Package size={16} />,
      },
      {
        id: "product-list",
        label: "Danh sách sản phẩm",
        icon: <FileText size={16} />,
      },
    ],
  },
  {
    id: "debt",
    label: "Quản lý công nợ",
    icon: <FileText size={20} />,
  },
  {
    id: "customers",
    label: "Quản lý khách hàng",
    icon: <Users size={20} />,
    children: [
      {
        id: "create-customer",
        label: "Tạo mới khách hàng",
        icon: <Users size={16} />,
      },
      {
        id: "customer-list",
        label: "Danh sách khách hàng",
        icon: <FileText size={16} />,
      },
    ],
  },
];

const MainLayout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <Box key={item.id}>
        <Button
          variant="ghost"
          justifyContent="flex-start"
          w="full"
          h="auto"
          py={3}
          px={4}
          onClick={() => (hasChildren ? toggleExpanded(item.id) : undefined)}
          rightIcon={hasChildren ? <ChevronDown size={16} /> : undefined}
          transform={hasChildren && isExpanded ? "rotate(180deg)" : undefined}
          transition="all 0.2s"
        >
          <HStack spacing={3} w="full">
            {item.icon}
            <Text fontSize="sm" fontWeight="medium">
              {item.label}
            </Text>
          </HStack>
        </Button>

        {hasChildren && isExpanded && (
          <VStack spacing={1} pl={8} align="stretch">
            {item.children.map((child) => (
              <Button
                key={child.id}
                variant="ghost"
                size="sm"
                justifyContent="flex-start"
                w="full"
                h="auto"
                py={2}
                px={3}
                colorScheme="gray"
              >
                <HStack spacing={2}>
                  {child.icon}
                  <Text fontSize="xs">{child.label}</Text>
                </HStack>
              </Button>
            ))}
          </VStack>
        )}
      </Box>
    );
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header - Mobile */}
      <Box
        as="header"
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex justify="space-between" align="center" px={4} py={3}>
          <HStack spacing={3}>
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon size={20} />}
              variant="ghost"
              onClick={onOpen}
              display={{ base: "flex", lg: "none" }}
            />
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              Steel POS
            </Text>
          </HStack>

          <HStack spacing={3}>
            <Badge colorScheme="green" variant="subtle">
              Online
            </Badge>
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<ChevronDown size={16} />}
                size="sm"
              >
                <HStack spacing={2}>
                  <Avatar size="xs" name="Admin" />
                  <Text fontSize="sm" display={{ base: "none", md: "block" }}>
                    Admin
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<User size={16} />}>Hồ sơ</MenuItem>
                <MenuItem icon={<Settings size={16} />}>Cài đặt</MenuItem>
                <MenuDivider />
                <MenuItem icon={<LogOut size={16} />} color="red.500">
                  Đăng xuất
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      <Flex>
        {/* Sidebar - Desktop */}
        <Box
          as="nav"
          w={{ base: "0", lg: "280px" }}
          bg="white"
          borderRight="1px"
          borderColor="gray.200"
          display={{ base: "none", lg: "block" }}
          position="sticky"
          top="73px"
          h="calc(100vh - 73px)"
          overflowY="auto"
        >
          <VStack spacing={0} align="stretch" py={4}>
            <Box px={4} py={2}>
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="gray.500"
                textTransform="uppercase"
              >
                Navigation
              </Text>
            </Box>
            <Divider />
            <VStack spacing={0} align="stretch" mt={2}>
              {menuItems.map(renderMenuItem)}
            </VStack>
          </VStack>
        </Box>

        {/* Main Content */}
        <Box
          as="main"
          flex={1}
          minH="calc(100vh - 73px)"
          p={{ base: 4, lg: 6 }}
        >
          {children}
        </Box>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="bold">
              Steel POS
            </Text>
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch" py={4}>
              <Box px={4} py={2}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.500"
                  textTransform="uppercase"
                >
                  Navigation
                </Text>
              </Box>
              <Divider />
              <VStack spacing={0} align="stretch" mt={2}>
                {menuItems.map(renderMenuItem)}
              </VStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default MainLayout;
