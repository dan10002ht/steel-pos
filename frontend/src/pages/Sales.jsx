import React from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Button,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { ShoppingCart, Plus, FileText, DollarSign } from "lucide-react";

const Sales = () => {
  const quickActions = [
    {
      title: "Tạo đơn hàng mới",
      description: "Tạo hoá đơn bán hàng mới",
      icon: Plus,
      color: "blue",
      action: () => console.log("Tạo đơn hàng mới"),
    },
    {
      title: "Danh sách đơn hàng",
      description: "Xem tất cả đơn hàng",
      icon: FileText,
      color: "green",
      action: () => console.log("Xem danh sách đơn hàng"),
    },
    {
      title: "Báo cáo doanh thu",
      description: "Xem báo cáo doanh thu",
      icon: DollarSign,
      color: "purple",
      action: () => console.log("Xem báo cáo doanh thu"),
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Content */}
      <Box>
        <Text color="gray.600" fontSize="lg">
          Quản lý bán hàng và tạo đơn hàng
        </Text>
      </Box>

      {/* Quick Actions */}
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
                  onClick={action.action}
                  leftIcon={<ShoppingCart size={16} />}
                >
                  Truy cập
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Recent Sales */}
      <Card shadow="sm">
        <CardHeader>
          <Heading size="md">Đơn hàng gần đây</Heading>
        </CardHeader>
        <CardBody>
          <Text color="gray.500" textAlign="center" py={8}>
            Chưa có đơn hàng nào. Hãy tạo đơn hàng đầu tiên!
          </Text>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Sales;
