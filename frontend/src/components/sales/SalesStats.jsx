import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Icon,
  Grid,
  Flex,
} from "@chakra-ui/react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const SalesStats = ({ invoices = [] }) => {
  const calculateStats = () => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + (parseFloat(invoice.total_amount) || 0),
      0
    );
    const paidInvoices = invoices.filter(
      (invoice) => invoice.payment_status === "paid"
    ).length;
    const pendingInvoices = invoices.filter(
      (invoice) => invoice.payment_status === "pending"
    ).length;

    // Calculate today's stats
    const today = new Date().toISOString().split("T")[0];
    const todayInvoices = invoices.filter((invoice) => {
      if (!invoice.created_at) return false;
      const invoiceDate = new Date(invoice.created_at).toISOString().split("T")[0];
      return invoiceDate === today;
    });
    const todayRevenue = todayInvoices.reduce(
      (sum, invoice) => sum + (parseFloat(invoice.total_amount) || 0),
      0
    );

    // Calculate this month's stats
    const currentMonth =
      new Date().getFullYear() +
      "-" +
      String(new Date().getMonth() + 1).padStart(2, "0");
    const monthInvoices = invoices.filter((invoice) => {
      if (!invoice.created_at) return false;
      const invoiceDate = new Date(invoice.created_at).toISOString().split("T")[0];
      return invoiceDate.startsWith(currentMonth);
    });
    const monthRevenue = monthInvoices.reduce(
      (sum, invoice) => sum + (parseFloat(invoice.total_amount) || 0),
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
      value: formatCurrency(stats.totalRevenue),
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
      value: formatCurrency(stats.monthRevenue),
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
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)"
        }}
        gap={4}
      >
        {statItems.map((item, index) => (
          <Card key={index}>
            <CardBody>
              <HStack justify="space-between" align="flex-start">
                <VStack align="flex-start" spacing={1}>
                  <Text color="gray.600" fontSize="sm">
                    {item.label}
                  </Text>
                  <HStack>

                  <Text fontSize="xl" fontWeight="bold">
                    {item.value}
                  </Text>
                  <HStack spacing={1}>
                    <Icon
                      as={item.changeType === "increase" ? ArrowUp : ArrowDown}
                      color={
                        item.changeType === "increase" ? "green.500" : "red.500"
                      }
                      boxSize={4}
                    />
                    <Text color="gray.600" fontSize="sm">
                      {item.change}
                    </Text>
                  </HStack>
                  </HStack>
                  
                </VStack>
                <Flex
                  p={3}
                  borderRadius="lg"
                  bg={`${item.color}.100`}
                  color={`${item.color}.600`}
                >
                  <Icon as={item.icon} boxSize={6} />
                </Flex>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </VStack>
  );
};

export default SalesStats;
