import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { ShoppingCart, DollarSign, AlertCircle } from 'lucide-react';
import CustomerStatCard from '../../atoms/CustomerStatCard';
import SkeletonCard from '../../atoms/SkeletonCard';
import { formatCurrency } from '@/utils/formatters';
import { useFetchApi } from '../../../hooks/useFetchApi';

const CustomerStatsGrid = ({ customerId }) => {
  // Fetch customer analytics data
  const {
    data: analytics,
    isLoading,
    error,
  } = useFetchApi(
    ['customer', customerId, 'analytics'],
    `/customers/${customerId}/analytics`,
    {
      enabled: !!customerId,
    }
  );

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </SimpleGrid>
    );
  }

  if (error) {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <CustomerStatCard
          label='Tổng hóa đơn'
          value='N/A'
          helpText='Không thể tải dữ liệu'
          icon={ShoppingCart}
        />
        <CustomerStatCard
          label='Tổng chi tiêu'
          value='N/A'
          helpText='Không thể tải dữ liệu'
          icon={DollarSign}
        />
        <CustomerStatCard
          label='Dư nợ'
          value='N/A'
          helpText='Không thể tải dữ liệu'
          icon={AlertCircle}
        />
      </SimpleGrid>
    );
  }

  const totalInvoices = analytics?.total_invoices || 0;
  const totalSpent = analytics?.total_spent || 0;
  const unpaidDebt = analytics?.unpaid_debt || 0;

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
      <CustomerStatCard
        label='Tổng hóa đơn'
        value={totalInvoices}
        helpText='Hóa đơn đã mua'
        icon={ShoppingCart}
      />
      <CustomerStatCard
        label='Tổng chi tiêu'
        value={formatCurrency(totalSpent)}
        helpText='Tổng tiền đã chi'
        icon={DollarSign}
      />
      <CustomerStatCard
        label='Dư nợ chưa thanh toán'
        value={formatCurrency(unpaidDebt)}
        helpText='Số tiền còn nợ'
        icon={AlertCircle}
      />
    </SimpleGrid>
  );
};

export default CustomerStatsGrid;
