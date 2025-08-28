import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  StatArrow,
  Card,
  CardBody,
  Icon,
} from "@chakra-ui/react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

const SalesStats = ({ invoices = [] }) => {
  const calculateStats = () => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );
    const paidInvoices = invoices.filter(
      (invoice) => invoice.paymentStatus === "paid"
    ).length;
    const pendingInvoices = invoices.filter(
      (invoice) => invoice.paymentStatus === "pending"
    ).length;

    // Calculate today's stats
    const today = new Date().toISOString().split("T")[0];
    const todayInvoices = invoices.filter((invoice) => invoice.date === today);
    const todayRevenue = todayInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );

    // Calculate this month's stats
    const currentMonth =
      new Date().getFullYear() +
      "-" +
      String(new Date().getMonth() + 1).padStart(2, "0");
    const monthInvoices = invoices.filter((invoice) =>
      invoice.date.startsWith(currentMonth)
    );
    const monthRevenue = monthInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );

    return {
      totalInvoices,
      totalRevenue,
      paidInvoices,
      pendingInvoices,
      todayRevenue,
      monthRevenue,
      todayInvoices: todayInvoices.length,
      monthInvoices: monthInvoices.length,
    };
  };

  const stats = calculateStats();

  const statItems = [
    {
      label: "Tổng doanh thu",
      value: `${stats.totalRevenue.toLocaleString("vi-VN")} VNĐ`,
      change: "+12%",
      changeType: "increase",
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Hoá đơn hôm nay",
      value: stats.todayInvoices.toString(),
      change: `+${stats.todayInvoices}`,
      changeType: stats.todayInvoices > 0 ? "increase" : "decrease",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      label: "Doanh thu tháng",
      value: `${stats.monthRevenue.toLocaleString("vi-VN")} VNĐ`,
      change: "+8%",
      changeType: "increase",
      icon: TrendingUp,
      color: "purple",
    },
    {
      label: "Chờ thanh toán",
      value: stats.pendingInvoices.toString(),
      change: `-${stats.pendingInvoices}`,
      changeType: "decrease",
      icon: Users,
      color: "orange",
    },
  ];

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="bold">
        Thống kê bán hàng
      </Text>

      <Box>
        <Text color="gray.600" fontSize="sm" mb={2}>
          Tổng quan
        </Text>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {stats.totalInvoices} hoá đơn
        </Text>
        <HStack spacing={1}>
          <StatArrow type="increase" />
          <Text fontSize="sm" color="gray.600">
            Tổng doanh thu: {stats.totalRevenue.toLocaleString("vi-VN")} VNĐ
          </Text>
        </HStack>
      </Box>

      <HStack spacing={4}>
        {statItems.map((item, index) => (
          <Card key={index} flex={1}>
            <CardBody>
              <HStack justify="space-between" align="flex-start">
                <VStack align="flex-start" spacing={1}>
                  <Text color="gray.600" fontSize="sm">
                    {item.label}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold">
                    {item.value}
                  </Text>
                  <HStack spacing={1}>
                    <StatArrow
                      type={item.changeType}
                      color={
                        item.changeType === "increase" ? "green.500" : "red.500"
                      }
                    />
                    <Text color="gray.600" fontSize="sm">
                      {item.change}
                    </Text>
                  </HStack>
                </VStack>
                <Box
                  p={3}
                  borderRadius="lg"
                  bg={`${item.color}.100`}
                  color={`${item.color}.600`}
                >
                  <Icon as={item.icon} boxSize={6} />
                </Box>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </HStack>
    </VStack>
  );
};

export default SalesStats;
