import React, { useState } from "react";
import {
  Box,
  VStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Button,
  Icon,
  HStack,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { Package, Plus, FileText, TrendingUp, ArrowLeft } from "lucide-react";
import MainLayout from "../components/Layout/MainLayout";
import ImportOrderForm from "../components/ImportOrderForm";
import ImportOrderList from "../components/ImportOrderList";
import InventoryReport from "../components/InventoryReport";

const Inventory = () => {
  const [currentView, setCurrentView] = useState("list"); // dashboard, create, list, report
  const { isOpen, onOpen, onClose } = useDisclosure();

  const quickActions = [
    {
      title: "Nhập kho mới",
      description: "Tạo phiếu nhập kho",
      icon: Plus,
      color: "blue",
      action: () => setCurrentView("create"),
    },
    {
      title: "Danh sách nhập kho",
      description: "Xem lịch sử nhập kho",
      icon: FileText,
      color: "green",
      action: () => setCurrentView("list"),
    },
    {
      title: "Báo cáo tồn kho",
      description: "Xem báo cáo tồn kho",
      icon: TrendingUp,
      color: "purple",
      action: () => setCurrentView("report"),
    },
  ];

  const renderDashboard = () => (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text color="gray.600" fontSize="lg">
          Quản lý nhập kho và tồn kho
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {quickActions.map((action, index) => (
          <Card
            key={index}
            shadow="sm"
            cursor="pointer"
            _hover={{ shadow: "md" }}
            onClick={action.action}
          >
            <CardBody>
              <VStack spacing={4} align="center">
                <Icon
                  as={action.icon}
                  boxSize={12}
                  color={`${action.color}.500`}
                  opacity={0.8}
                />
                <VStack spacing={2} textAlign="center">
                  <Text fontWeight="bold" fontSize="lg">
                    {action.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {action.description}
                  </Text>
                </VStack>
                <Button
                  colorScheme={action.color}
                  size="sm"
                  leftIcon={<Package size={16} />}
                >
                  Truy cập
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </VStack>
  );

  const renderCreateForm = () => (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Tạo mới nhập kho</Heading>
        <Button
          leftIcon={<ArrowLeft size={16} />}
          variant="outline"
          onClick={() => setCurrentView("dashboard")}
        >
          Quay lại
        </Button>
      </HStack>
      <ImportOrderForm onNavigateToList={() => setCurrentView("list")} />
    </VStack>
  );

  const renderList = () => (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Danh sách nhập kho</Heading>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="blue"
          onClick={() => setCurrentView("create")}
        >
          Tạo đơn nhập hàng
        </Button>
      </HStack>
      <ImportOrderList
        onNavigateToCreate={() => setCurrentView("create")}
        onNavigateToDashboard={() => setCurrentView("dashboard")}
      />
    </VStack>
  );

  const renderReport = () => (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Báo cáo tồn kho</Heading>
        <Button
          leftIcon={<ArrowLeft size={16} />}
          variant="outline"
          onClick={() => setCurrentView("dashboard")}
        >
          Quay lại
        </Button>
      </HStack>
      <InventoryReport />
    </VStack>
  );

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return renderDashboard();
      case "create":
        return renderCreateForm();
      case "list":
        return renderList();
      case "report":
        return renderReport();
      default:
        return renderList();
    }
  };

  return (
    <MainLayout>
      <Box p={6}>
        {renderContent()}
      </Box>
    </MainLayout>
  );
};

export default Inventory;
