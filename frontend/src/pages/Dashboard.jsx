import React, { useState, useEffect, useCallback } from 'react';
import { Grid, GridItem, VStack } from '@chakra-ui/react';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  CreditCard,
  Percent,
} from 'lucide-react';
import Page from '../components/organisms/Page';
import StatsGrid from '../components/molecules/dashboard/StatsGrid';
import DateFilter from '../components/molecules/dashboard/DateFilter';
import LogsList from '../components/molecules/dashboard/LogsList';
import QuickActions from '../components/molecules/dashboard/QuickActions';
import { useFetchApi } from '../hooks/useFetchApi';
import { formatCurrency } from '../utils/formatters';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [selectedRange, setSelectedRange] = useState('today');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [logsLimit, setLogsLimit] = useState(10);
  const queryClient = useQueryClient();

  // Fetch stats using same API as SalesStats
  const { data: summary, isLoading: _statsLoading } = useFetchApi(
    ['invoices', 'summary', dateFrom, dateTo],
    `/invoices/summary?date_from=${dateFrom}&date_to=${dateTo}`,
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      enabled: !!dateFrom && !!dateTo, // Only fetch when dates are set
    }
  );

  // Debug log for API calls
  useEffect(() => {
    console.log('API call triggered with:', { dateFrom, dateTo });
  }, [dateFrom, dateTo]);

  // Fetch logs (latest, no date range needed)
  const { data: logsData, isLoading: logsLoading } = useFetchApi(
    ['dashboard-logs', logsLimit],
    `/dashboard/logs?limit=${logsLimit}`,
    {
      enabled: true,
    }
  );

  // Handle preset selection (same logic as SalesStats)
  const handlePresetChange = useCallback(
    preset => {
      console.log('handlePresetChange called with:', preset);
      setSelectedRange(preset);
      const today = new Date();

      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      let newDateFrom, newDateTo;

      switch (preset) {
        case 'today': {
          newDateFrom = startOfDay.toISOString().split('T')[0];
          newDateTo = endOfDay.toISOString().split('T')[0];
          break;
        }
        case 'this_week': {
          const startOfWeek = new Date(today);
          // Get Monday of current week (assuming Monday is start of week)
          const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Convert to Monday-based week
          console.log(
            'Day of week:',
            dayOfWeek,
            'Days to Monday:',
            daysToMonday
          );
          startOfWeek.setDate(today.getDate() + daysToMonday);
          newDateFrom = startOfWeek.toISOString().split('T')[0];
          newDateTo = endOfDay.toISOString().split('T')[0];
          console.log('This week range:', { newDateFrom, newDateTo });
          break;
        }
        case 'this_month': {
          const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          newDateFrom = startOfMonth.toISOString().split('T')[0];
          newDateTo = endOfDay.toISOString().split('T')[0];
          break;
        }
        default:
          return;
      }

      console.log('Setting dates:', { newDateFrom, newDateTo });
      setDateFrom(newDateFrom);
      setDateTo(newDateTo);

      // Invalidate and refetch the query to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ['invoices', 'summary', newDateFrom, newDateTo],
      });
    },
    [queryClient]
  );

  // Initialize with today's data
  useEffect(() => {
    if (!dateFrom && !dateTo) {
      handlePresetChange('today');
    }
  }, [dateFrom, dateTo, handlePresetChange]);

  // Process stats data same as SalesStats
  const processStatsData = () => {
    if (!summary) return [];

    const totalAmount = summary.TotalAmount || summary.total_amount || 0;
    const totalInvoices = summary.TotalInvoices || summary.total_invoices || 0;
    const paidAmount = summary.PaidAmount || summary.paid_amount || 0;
    const pendingAmount = summary.PendingAmount || summary.pending_amount || 0;

    return [
      {
        label: 'Tổng doanh thu',
        value: formatCurrency(totalAmount),
        description: 'Tổng doanh thu trong khoảng thời gian',
      },
      {
        label: 'Số hóa đơn',
        value: totalInvoices.toLocaleString(),
        description: 'Tổng số hóa đơn đã tạo',
      },
      {
        label: 'Đã thanh toán',
        value: formatCurrency(paidAmount),
        description: 'Số tiền đã thanh toán',
      },
      {
        label: 'Chờ thanh toán',
        value: formatCurrency(pendingAmount),
        description: 'Số tiền chưa thanh toán',
      },
    ];
  };

  const navigate = useNavigate();
  // Use API data
  const stats = processStatsData();
  const logs = logsData || [];

  const quickActions = [
    {
      icon: ShoppingCart,
      label: 'Tạo đơn hàng mới',
      color: 'blue',
      onClick: () => navigate('/sales/create'),
    },
    {
      icon: Package,
      label: 'Nhập kho',
      color: 'green',
      onClick: () => navigate('/inventory/create'),
    },
    {
      icon: Users,
      label: 'Thêm khách hàng',
      color: 'purple',
      onClick: () => navigate('/customers/create'),
    },
  ];

  const handleRangeChange = range => {
    handlePresetChange(range);
  };

  const handleViewMoreLogs = () => {
    // Load more logs
    setLogsLimit(prev => prev + 10);
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
            hasMore={logs && logs.length >= logsLimit}
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
