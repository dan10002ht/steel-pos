import React, { useState } from 'react';
import {
  HStack,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
} from '@chakra-ui/react';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Page from '@/components/organisms/Page/Page';
import SalesStats from '@/components/molecules/sales/SalesStats';
import SalesTable from '@/components/molecules/sales/SalesTable';
import SalesFilters from '@/components/molecules/sales/SalesFilters';
import { useFetchApi } from '@/hooks/useFetchApi';
import { useDebounce } from '@/hooks/useDebounce';

const SalesListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch invoices from API
  const {
    data: invoicesData,
    error,
    isPending: isLoading,
  } = useFetchApi(
    [
      'invoices',
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
      paymentStatusFilter,
      dateFrom,
      dateTo,
    ],
    `/invoices?page=${currentPage}&limit=${pageSize}&search=${debouncedSearchTerm}&status=${statusFilter}&payment_status=${paymentStatusFilter}`,
    {
      enabled: true,
    }
  );

  const handleViewDetail = id => {
    navigate(`/sales/detail/${id}`);
  };

  const handleEdit = id => {
    navigate(`/sales/edit/${id}`);
  };
  // Extract data from API response
  const invoices = invoicesData?.invoices || [];
  const totalCount = invoicesData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Show loading state
  if (isLoading) {
    return (
      <Page
        title='Danh sách bán hàng'
        subtitle='Quản lý và theo dõi tất cả hoá đơn bán hàng'
      >
        <Flex justify='center' py={10}>
          <Spinner size='xl' />
        </Flex>
      </Page>
    );
  }

  // Show error state
  if (error) {
    return (
      <Page
        title='Danh sách bán hàng'
        subtitle='Quản lý và theo dõi tất cả hoá đơn bán hàng'
      >
        <Alert status='error'>
          <AlertIcon />
          <AlertTitle>Lỗi tải dữ liệu!</AlertTitle>
          <AlertDescription>
            {error.message || 'Không thể tải danh sách hoá đơn'}
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title='Danh sách bán hàng'
      subtitle='Quản lý và theo dõi tất cả hoá đơn bán hàng'
      primaryActions={[
        {
          label: 'Tạo hoá đơn mới',
          icon: <Plus size={16} />,
          onClick: () => navigate('/sales/create'),
          colorScheme: 'blue',
        },
      ]}
    >
      {/* Sales Stats */}
      <SalesStats />

      {/* Search and Actions */}
      <Card>
        <CardBody>
          <HStack justify='space-between' mb={4}>
            <InputGroup maxW='400px'>
              <InputLeftElement pointerEvents='none'>
                <Search size={20} />
              </InputLeftElement>
              <Input
                placeholder='Tìm kiếm theo mã hoá đơn, tên khách hàng, số điện thoại...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </HStack>

          {/* Filters */}
          <SalesFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            paymentStatusFilter={paymentStatusFilter}
            setPaymentStatusFilter={setPaymentStatusFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
          />

          {/* Table */}
          <SalesTable
            invoices={invoices}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardBody>
      </Card>
    </Page>
  );
};

export default SalesListPage;
