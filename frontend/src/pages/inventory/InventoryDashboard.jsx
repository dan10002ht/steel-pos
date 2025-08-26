import React from "react";
import {
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const quickActions = [
    {
      title: "Nhập kho mới",
      description: "Tạo phiếu nhập kho",
      icon: Plus,
      color: "blue",
      action: () => navigate("/inventory/create"),
    },
    {
      title: "Danh sách nhập kho",
      description: "Xem lịch sử nhập kho",
      icon: FileText,
      color: "green",
      action: () => navigate("/inventory/list"),
    },
    {
      title: "Báo cáo tồn kho",
      description: "Xem báo cáo tồn kho",
      icon: TrendingUp,
      color: "purple",
      action: () => navigate("/inventory/report"),
    },
  ];
  // Mock data - sẽ được thay thế bằng API calls
  const stats = [
    {
      label: "Tổng sản phẩm",
      value: "1,234",
      change: "+12%",
      changeType: "increase",
      icon: Package,
      color: "blue",
    },
    {
      label: "Tồn kho thấp",
      value: "23",
      change: "+5",
      changeType: "increase",
      icon: AlertTriangle,
      color: "orange",
    },
    {
      label: "Giá trị tồn kho",
      value: "2.5B VNĐ",
      change: "+8%",
      changeType: "increase",
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Đơn nhập tháng này",
      value: "45",
      change: "-3",
      changeType: "decrease",
      icon: TrendingDown,
      color: "red",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "import",
      product: "Thép hộp 40x40",
      quantity: "1000m",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: 2,
      type: "export",
      product: "Thép tấm 3mm",
      quantity: "500kg",
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: 3,
      type: "import",
      product: "Thép ống 50mm",
      quantity: "2000m",
      date: "2024-01-13",
      status: "pending",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "import":
        return "📥";
      case "export":
        return "📤";
      default:
        return "📋";
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Dashboard Kho
          </Heading>
          <Text color="gray.600">
            Tổng quan về tình trạng kho và hoạt động nhập xuất
          </Text>
        </Box>

        {/* Quick Actions */}
        <Box>
          <Text color="gray.600" fontSize="lg" mb={4}>
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

        {/* Stats Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          {stats.map((stat, index) => (
            <Card key={index} shadow="sm">
              <CardBody>
                <HStack justify="space-between" align="flex-start">
                  <Stat>
                    <VStack align="flex-start" spacing={1}>
                      <StatLabel color="gray.600" fontSize="sm">
                        {stat.label}
                      </StatLabel>
                      <StatNumber fontSize="2xl" fontWeight="bold">
                        {stat.value}
                      </StatNumber>
                      <HStack spacing={1}>
                        <StatArrow
                          type={stat.changeType}
                          color={
                            stat.changeType === "increase"
                              ? "green.500"
                              : "red.500"
                          }
                        />
                        <StatHelpText color="gray.600" fontSize="sm" mb={0}>
                          {stat.change}
                        </StatHelpText>
                      </HStack>
                    </VStack>
                  </Stat>
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg={`${stat.color}.100`}
                    color={`${stat.color}.600`}
                  >
                    <Icon as={stat.icon} boxSize={6} />
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {/* Recent Activities */}
        <Card shadow="sm">
          <CardBody>
            <Heading size="md" mb={4}>
              Hoạt động gần đây
            </Heading>
            <VStack spacing={3} align="stretch">
              {recentActivities.map((activity) => (
                <HStack
                  key={activity.id}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  justify="space-between"
                >
                  <HStack spacing={3}>
                    <Text fontSize="lg">{getActivityIcon(activity.type)}</Text>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="medium">{activity.product}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {activity.quantity} • {activity.date}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme={getStatusColor(activity.status)}>
                    {activity.status === "completed"
                      ? "Hoàn thành"
                      : "Chờ xử lý"}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default InventoryDashboard;
