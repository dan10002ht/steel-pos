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
import { BarChart3, FileText, TrendingUp, PieChart } from "lucide-react";

const Reports = () => {
  const reportTypes = [
    {
      title: "Báo cáo doanh thu",
      description: "Xem báo cáo doanh thu theo thời gian",
      icon: TrendingUp,
      color: "blue",
    },
    {
      title: "Báo cáo bán hàng",
      description: "Thống kê sản phẩm bán chạy",
      icon: BarChart3,
      color: "green",
    },
    {
      title: "Báo cáo tồn kho",
      description: "Tình trạng tồn kho hiện tại",
      icon: PieChart,
      color: "purple",
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text color="gray.600" fontSize="lg">
          Xem các báo cáo và thống kê
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {reportTypes.map((report, index) => (
          <Card
            key={index}
            shadow="sm"
            cursor="pointer"
            _hover={{ shadow: "md" }}
          >
            <CardBody>
              <VStack spacing={4} align="center">
                <Icon
                  as={report.icon}
                  boxSize={12}
                  color={`${report.color}.500`}
                  opacity={0.8}
                />
                <VStack spacing={2} textAlign="center">
                  <Text fontWeight="bold" fontSize="lg">
                    {report.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {report.description}
                  </Text>
                </VStack>
                <Button
                  colorScheme={report.color}
                  size="sm"
                  leftIcon={<FileText size={16} />}
                >
                  Xem báo cáo
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card shadow="sm">
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">
            Báo cáo gần đây
          </Text>
        </CardHeader>
        <CardBody>
          <Text color="gray.500" textAlign="center" py={8}>
            Chưa có báo cáo nào được tạo.
          </Text>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Reports;
