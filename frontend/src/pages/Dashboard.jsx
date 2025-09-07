import React from "react";
import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import StatsGrid from "../components/molecules/dashboard/StatsGrid";
import RecentActivities from "../components/molecules/dashboard/RecentActivities";
import QuickActions from "../components/molecules/dashboard/QuickActions";

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

  const quickActions = [
    {
      icon: ShoppingCart,
      label: "Tạo đơn hàng mới",
      color: "blue",
      onClick: () => console.log("Create new order"),
    },
    {
      icon: Package,
      label: "Nhập kho",
      color: "green",
      onClick: () => console.log("Import inventory"),
    },
    {
      icon: Users,
      label: "Thêm khách hàng",
      color: "purple",
      onClick: () => console.log("Add customer"),
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text color="gray.600" fontSize="lg">
          Chào mừng bạn trở lại! Đây là tổng quan hoạt động hôm nay.
        </Text>
      </Box>

      <StatsGrid stats={stats} />

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <GridItem>
          <RecentActivities activities={recentActivities} />
        </GridItem>
        <GridItem>
          <QuickActions actions={quickActions} />
        </GridItem>
      </Grid>
    </VStack>
  );
};

export default Dashboard;
