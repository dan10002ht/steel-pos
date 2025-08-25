import React from "react";
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
} from "@chakra-ui/react";
import { Package, Plus, FileText, TrendingUp } from "lucide-react";
import MainLayout from "../components/Layout/MainLayout";

const Inventory = () => {
  const quickActions = [
    {
      title: "Nhập kho mới",
      description: "Tạo phiếu nhập kho",
      icon: Plus,
      color: "blue",
    },
    {
      title: "Danh sách nhập kho",
      description: "Xem lịch sử nhập kho",
      icon: FileText,
      color: "green",
    },
    {
      title: "Báo cáo tồn kho",
      description: "Xem báo cáo tồn kho",
      icon: TrendingUp,
      color: "purple",
    },
  ];

  return (
    <MainLayout>
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

        <Card shadow="sm">
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">
              Lịch sử nhập kho gần đây
            </Text>
          </CardHeader>
          <CardBody>
            <Text color="gray.500" textAlign="center" py={8}>
              Chưa có lịch sử nhập kho nào.
            </Text>
          </CardBody>
        </Card>
      </VStack>
    </MainLayout>
  );
};

export default Inventory;
