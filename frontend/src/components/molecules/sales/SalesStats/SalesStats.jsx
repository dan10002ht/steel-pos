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
import { useFetchApi } from "@/hooks/useFetchApi";
import { formatCurrency } from "@/utils/formatters";
import SkeletonCard from "@/components/atoms/SkeletonCard";

const SalesStats = () => {
  const { data: summary, isLoading, error } = useFetchApi(
    ["invoices", "summary"],
    "/invoices/summary",
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  if (isLoading) {
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
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </Grid>
      </VStack>
    );
  }

  if (!summary) return null;

  const statItems = [
    {
      label: "Tổng doanh thu",
      value: formatCurrency(summary.TotalAmount || summary.total_amount || 0),
      change: "+12%",
      changeType: "increase",
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Hoá đơn hôm nay",
      value: String(summary.TodayInvoices || summary.today_invoices || 0),
      change: `+${summary.TodayInvoices || summary.today_invoices || 0}`,
      changeType: (summary.TodayInvoices || summary.today_invoices || 0) > 0 ? "increase" : "decrease",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      label: "Doanh thu tháng",
      value: formatCurrency(summary.TodayAmount || summary.today_amount || 0),
      change: "+8%",
      changeType: "increase",
      icon: TrendingUp,
      color: "purple",
    },
    {
      label: "Chờ thanh toán",
      value: String((summary.PendingAmount || summary.pending_amount || 0) > 0 ? 1 : 0),
      change: "",
      changeType: "increase",
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
