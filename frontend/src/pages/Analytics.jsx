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
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";

const Analytics = () => {
  const analyticsTypes = [
    {
      title: "Phân tích doanh thu",
      description: "Biểu đồ doanh thu theo thời gian",
      icon: TrendingUp,
      color: "blue",
    },
    {
      title: "Phân tích sản phẩm",
      description: "Sản phẩm bán chạy và tồn kho",
      icon: BarChart3,
      color: "green",
    },
    {
      title: "Phân tích khách hàng",
      description: "Thống kê khách hàng và hành vi",
      icon: PieChart,
      color: "purple",
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text color="gray.600" fontSize="lg">
          Phân tích dữ liệu và thống kê chi tiết
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {analyticsTypes.map((analytics, index) => (
          <Card
            key={index}
            shadow="sm"
            cursor="pointer"
            _hover={{ shadow: "md" }}
          >
            <CardBody>
              <VStack spacing={4} align="center">
                <Icon
                  as={analytics.icon}
                  boxSize={12}
                  color={`${analytics.color}.500`}
                  opacity={0.8}
                />
                <VStack spacing={2} textAlign="center">
                  <Text fontWeight="bold" fontSize="lg">
                    {analytics.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {analytics.description}
                  </Text>
                </VStack>
                <Button
                  colorScheme={analytics.color}
                  size="sm"
                  leftIcon={<Activity size={16} />}
                >
                  Xem phân tích
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card shadow="sm">
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">
            Thống kê tổng quan
          </Text>
        </CardHeader>
        <CardBody>
          <Text color="gray.500" textAlign="center" py={8}>
            Dữ liệu thống kê sẽ được hiển thị ở đây.
          </Text>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Analytics;
