import React from "react";
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
import Header from "../components/Header";

const Dashboard = () => {
  const stats = [
    {
      label: "Doanh thu hôm nay",
      value: "12,500,000",
      change: "+12.5%",
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Đơn hàng mới",
      value: "24",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      label: "Sản phẩm tồn kho",
      value: "1,234",
      change: "-2.1%",
      icon: Package,
      color: "orange",
    },
    {
      label: "Khách hàng mới",
      value: "8",
      change: "+15.3%",
      icon: Users,
      color: "purple",
    },
  ];

  const recentActivities = [
    {
      title: "Đơn hàng mới #ORD-001",
      description: "Khách hàng Nguyễn Văn A đã đặt hàng",
      time: "2 phút trước",
      type: "order",
    },
    {
      title: "Nhập kho thành công",
      description: "Đã nhập 500kg sắt thép từ nhà cung cấp",
      time: "15 phút trước",
      type: "import",
    },
    {
      title: "Thanh toán hoàn tất",
      description: "Đơn hàng #ORD-098 đã thanh toán đầy đủ",
      time: "1 giờ trước",
      type: "payment",
    },
  ];

  return (
    <Box>
      <Header />
      <Box p={6}>
        <VStack spacing={6} align="stretch">
          {/* Dashboard Header */}
          <Box>
            <Heading size="lg" mb={2}>
              Dashboard
            </Heading>
            <Text color="gray.600">
              Chào mừng bạn trở lại! Đây là tổng quan hoạt động hôm nay.
            </Text>
          </Box>

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {stats.map((stat, index) => (
              <Card key={index} shadow="sm">
                <CardBody>
                  <HStack justify="space-between" align="flex-start">
                    <VStack align="flex-start" spacing={1}>
                      <StatLabel color="gray.600" fontSize="sm">
                        {stat.label}
                      </StatLabel>
                      <StatNumber fontSize="2xl" fontWeight="bold">
                        {stat.value}
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow
                          type={
                            stat.change.startsWith("+")
                              ? "increase"
                              : "decrease"
                          }
                        />
                        {stat.change}
                      </StatHelpText>
                    </VStack>
                    <Icon
                      as={stat.icon}
                      boxSize={8}
                      color={`${stat.color}.500`}
                      opacity={0.8}
                    />
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Content Grid */}
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Recent Activities */}
            <GridItem>
              <Card shadow="sm">
                <CardHeader>
                  <Heading size="md">Hoạt động gần đây</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {recentActivities.map((activity, index) => (
                      <Box
                        key={index}
                        p={4}
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                        bg="gray.50"
                      >
                        <HStack justify="space-between" align="flex-start">
                          <VStack align="flex-start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm">
                              {activity.title}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {activity.description}
                            </Text>
                          </VStack>
                          <Text fontSize="xs" color="gray.500">
                            {activity.time}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            {/* Quick Actions */}
            <GridItem>
              <Card shadow="sm">
                <CardHeader>
                  <Heading size="md">Thao tác nhanh</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Box
                      p={4}
                      border="1px"
                      borderColor="blue.200"
                      borderRadius="md"
                      bg="blue.50"
                      cursor="pointer"
                      _hover={{ bg: "blue.100" }}
                      transition="all 0.2s"
                    >
                      <HStack>
                        <Icon as={ShoppingCart} color="blue.500" />
                        <Text fontWeight="medium">Tạo đơn hàng mới</Text>
                      </HStack>
                    </Box>
                    <Box
                      p={4}
                      border="1px"
                      borderColor="green.200"
                      borderRadius="md"
                      bg="green.50"
                      cursor="pointer"
                      _hover={{ bg: "green.100" }}
                      transition="all 0.2s"
                    >
                      <HStack>
                        <Icon as={Package} color="green.500" />
                        <Text fontWeight="medium">Nhập kho</Text>
                      </HStack>
                    </Box>
                    <Box
                      p={4}
                      border="1px"
                      borderColor="purple.200"
                      borderRadius="md"
                      bg="purple.50"
                      cursor="pointer"
                      _hover={{ bg: "purple.100" }}
                      transition="all 0.2s"
                    >
                      <HStack>
                        <Icon as={Users} color="purple.500" />
                        <Text fontWeight="medium">Thêm khách hàng</Text>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
};

export default Dashboard;
