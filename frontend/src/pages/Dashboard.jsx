import React, { useState, useEffect } from 'react';
import { Grid, GridItem, VStack } from '@chakra-ui/react';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
} from 'lucide-react';
import Page from '../components/organisms/Page';
import StatsGrid from '../components/molecules/dashboard/StatsGrid';
import DateFilter from '../components/molecules/dashboard/DateFilter';
import LogsList from '../components/molecules/dashboard/LogsList';
import QuickActions from '../components/molecules/dashboard/QuickActions';
import { useFetchApi } from '../hooks/useFetchApi';

const Dashboard = () => {
  const [selectedRange, setSelectedRange] = useState('today');

  // Fetch stats based on selected date range
  const { data: statsData, isLoading: statsLoading } = useFetchApi(
    ['dashboard-stats', selectedRange],
    `/dashboard/stats?range=${selectedRange}`,
    {
      enabled: true,
    }
  );

  // Fetch logs (latest 10, no date range needed)
  const { data: logsData, isLoading: logsLoading } = useFetchApi(
    ['dashboard-logs'],
    '/dashboard/logs?limit=10',
    {
      enabled: true,
    }
  );

  // Process stats data similar to SalesStats
  const processStatsData = data => {
    if (!data) return [];

    return [
      {
        label: 'Tổng doanh thu',
        value: data.totalRevenue || '0',
        icon: DollarSign,
        color: 'green',
        description: 'Tổng doanh thu trong khoảng thời gian',
      },
      {
        label: 'Số đơn hàng',
        value: data.totalOrders || '0',
        icon: ShoppingCart,
        color: 'blue',
        description: 'Tổng số đơn hàng đã tạo',
      },
      {
        label: 'Sản phẩm tồn kho',
        value: data.totalProducts || '0',
        icon: Package,
        color: 'orange',
        description: 'Tổng số sản phẩm trong kho',
      },
      {
        label: 'Khách hàng mới',
        value: data.newCustomers || '0',
        icon: Users,
        color: 'purple',
        description: 'Số khách hàng mới',
      },
    ];
  };

  // Use API data or default stats
  const stats = processStatsData(statsData?.data);
  const logs = logsData?.data || [];

  const quickActions = [
    {
      icon: ShoppingCart,
      label: 'Tạo đơn hàng mới',
      color: 'blue',
      onClick: () => console.log('Create new order'),
    },
    {
      icon: Package,
      label: 'Nhập kho',
      color: 'green',
      onClick: () => console.log('Import inventory'),
    },
    {
      icon: Users,
      label: 'Thêm khách hàng',
      color: 'purple',
      onClick: () => console.log('Add customer'),
    },
  ];

  const handleRangeChange = range => {
    setSelectedRange(range);
  };

  const handleViewMoreLogs = () => {
    // Navigate to logs page or open logs modal
    console.log('Navigate to logs page');
  };

  return (
    <Page
      title='Dashboard'
      subtitle='Tổng quan hoạt động và thống kê hệ thống'
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }]}
    >
      {/* Date Filter */}
      <DateFilter
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
      />

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <GridItem>
          <LogsList
            logs={logs}
            isLoading={logsLoading}
            onViewMore={handleViewMoreLogs}
          />
        </GridItem>
        <GridItem>
          <QuickActions actions={quickActions} />
        </GridItem>
      </Grid>
    </Page>
  );
};

export default Dashboard;
