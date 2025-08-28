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
import { Users, Plus, FileText, UserCheck } from "lucide-react";

const Customers = () => {
  const quickActions = [
    {
      title: "Thêm khách hàng mới",
      description: "Tạo khách hàng mới",
      icon: Plus,
      color: "blue",
    },
    {
      title: "Danh sách khách hàng",
      description: "Xem tất cả khách hàng",
      icon: FileText,
      color: "green",
    },
    {
      title: "Quản lý nhóm khách hàng",
      description: "Phân loại khách hàng",
      icon: UserCheck,
      color: "purple",
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text color="gray.600" fontSize="lg">
          Quản lý thông tin khách hàng
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
                  leftIcon={<Users size={16} />}
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
            Khách hàng gần đây
          </Text>
        </CardHeader>
        <CardBody>
          <Text color="gray.500" textAlign="center" py={8}>
            Chưa có khách hàng nào. Hãy thêm khách hàng đầu tiên!
          </Text>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Customers;
