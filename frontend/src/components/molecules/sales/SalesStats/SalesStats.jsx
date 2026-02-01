import React, { useContext, useState } from 'react';
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
  Button,
  Badge,
  Select,
  Tooltip,
} from '@chakra-ui/react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Calendar,
  CreditCard,
  Percent,
  Receipt,
  Clock,
} from 'lucide-react';
import { useFetchApi } from '@/hooks/useFetchApi';
import { formatCurrency } from '@/utils/formatters';
import SkeletonCard from '@/components/atoms/SkeletonCard';
import SalesFilterField from '@/components/atoms/sales/SalesFilterField';
import { AuthContext } from '@/contexts/AuthContext';

const SalesStats = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const { isAdmin } = useContext(AuthContext);

  // Date range presets
  const datePresets = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'yesterday', label: 'Hôm qua' },
    { value: 'thisWeek', label: 'Tuần này' },
    { value: 'lastWeek', label: 'Tuần trước' },
    { value: 'thisMonth', label: 'Tháng này' },
    { value: 'lastMonth', label: 'Tháng trước' },
    { value: 'thisQuarter', label: 'Quý này' },
    { value: 'thisYear', label: 'Năm nay' },
  ];

  const { data: summary, isLoading } = useFetchApi(
    ['invoices', 'summary', dateFrom, dateTo],
    `/invoices/summary?date_from=${dateFrom}&date_to=${dateTo}`,
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  // Handle preset selection
  const handlePresetChange = preset => {
    setSelectedPreset(preset);
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

    switch (preset) {
      case 'today': {
        setDateFrom(startOfDay.toISOString().split('T')[0]);
        setDateTo(endOfDay.toISOString().split('T')[0]);
        break;
      }
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setDateFrom(yesterday.toISOString().split('T')[0]);
        setDateTo(yesterday.toISOString().split('T')[0]);
        break;
      }
      case 'thisWeek': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        setDateFrom(startOfWeek.toISOString().split('T')[0]);
        setDateTo(endOfDay.toISOString().split('T')[0]);
        break;
      }
      case 'lastWeek': {
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        setDateFrom(lastWeekStart.toISOString().split('T')[0]);
        setDateTo(lastWeekEnd.toISOString().split('T')[0]);
        break;
      }
      case 'thisMonth': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateFrom(startOfMonth.toISOString().split('T')[0]);
        setDateTo(endOfDay.toISOString().split('T')[0]);
        break;
      }
      case 'lastMonth': {
        const lastMonthStart = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateFrom(lastMonthStart.toISOString().split('T')[0]);
        setDateTo(lastMonthEnd.toISOString().split('T')[0]);
        break;
      }
      case 'thisQuarter': {
        const quarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
        setDateFrom(startOfQuarter.toISOString().split('T')[0]);
        setDateTo(endOfDay.toISOString().split('T')[0]);
        break;
      }
      case 'thisYear': {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        setDateFrom(startOfYear.toISOString().split('T')[0]);
        setDateTo(endOfDay.toISOString().split('T')[0]);
        break;
      }
      default:
        break;
    }
  };

  const handleResetFilter = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedPreset('');
  };

  if (isLoading) {
    return (
      <VStack spacing={4} align='stretch'>
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
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

  // Calculate additional metrics
  const totalAmount = summary.TotalAmount || summary.total_amount || 0;
  const totalInvoices = summary.TotalInvoices || summary.total_invoices || 0;
  const paidAmount = summary.PaidAmount || summary.paid_amount || 0;
  const pendingAmount = summary.PendingAmount || summary.pending_amount || 0;

  // Mock trend data (in real app, this would come from comparison with previous period)

  const statItems = [
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

  return (
    <VStack spacing={4} align='stretch'>
      {/* Date Range Filter */}
      <Card>
        <CardBody>
          <VStack spacing={4} align='stretch'>
            <Text fontSize='lg' fontWeight='semibold' color='gray.700'>
              Bộ lọc thời gian
            </Text>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={4}
              wrap='wrap'
              align={{ base: 'flex-start', md: 'flex-end' }}
            >
              <Box flex='1'>
                <Text fontSize='sm' fontWeight='medium' mb={2} color='gray.600'>
                  Chọn nhanh khoảng thời gian
                </Text>
                <Select
                  placeholder='Chọn khoảng thời gian'
                  value={selectedPreset}
                  onChange={e => handlePresetChange(e.target.value)}
                  size='md'
                >
                  {datePresets.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </Select>
              </Box>
              <SalesFilterField
                type='date'
                label='Từ ngày'
                value={dateFrom}
                onChange={setDateFrom}
              />
              <SalesFilterField
                type='date'
                label='Đến ngày'
                value={dateTo}
                onChange={setDateTo}
              />
              <Button
                leftIcon={<RotateCcw size={16} />}
                onClick={handleResetFilter}
                variant='outline'
                size='md'
                minW='120px'
              >
                Đặt lại
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      {isAdmin && (
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(2, 1fr)',
            xl: 'repeat(4, 1fr)',
          }}
          gap={4}
        >
          {statItems.map((item, index) => (
            <Card key={index} _hover={{ shadow: 'md' }} transition='all 0.2s'>
              <CardBody>
                <VStack align='stretch' spacing={3}>
                  <HStack justify='space-between' align='flex-start'>
                    <VStack align='flex-start' spacing={1} flex='1'>
                      <HStack spacing={2}>
                        <Text
                          color='gray.600'
                          fontSize='sm'
                          fontWeight='medium'
                        >
                          {item.label}
                        </Text>
                      </HStack>
                      <Text fontSize='2xl' fontWeight='bold' color='gray.800'>
                        {item.value}
                      </Text>
                    </VStack>
                    {item.trend && (
                      <Tooltip label={item.description} hasArrow>
                        <Badge
                          colorScheme={item.trend.isPositive ? 'green' : 'red'}
                          variant='subtle'
                          display='flex'
                          alignItems='center'
                          gap={1}
                          px={2}
                          py={1}
                          borderRadius='md'
                        >
                          <Icon
                            as={item.trend.isPositive ? ArrowUp : ArrowDown}
                            boxSize={3}
                          />
                          <Text fontSize='xs' fontWeight='bold'>
                            {item.trend.value}%
                          </Text>
                        </Badge>
                      </Tooltip>
                    )}
                  </HStack>
                  {item.description && (
                    <Text fontSize='xs' color='gray.500' lineHeight='short'>
                      {item.description}
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
    </VStack>
  );
};

export default SalesStats;
