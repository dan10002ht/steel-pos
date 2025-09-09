import React, { useState } from 'react';
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
} from '@chakra-ui/react';
import { Upload, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Page from '@/components/organisms/Page';
import CustomerTable from '@/components/molecules/customers/CustomerTable';
import CustomerFilters from '@/components/molecules/customers/CustomerFilters';
import CustomerEmptyState from '@/components/molecules/customers/CustomerEmptyState';
import { useFetchApi } from '@/hooks/useFetchApi';
import { useDebounce } from '@/hooks/useDebounce';

const CustomerListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch customers from API with debounced search and pagination
  const { data, isLoading, error, refetch } = useFetchApi(
    [
      'customers',
      'search',
      {
        search: debouncedSearchTerm,
        status: filterStatus,
        page: currentPage,
        limit: pageSize,
      },
    ],
    debouncedSearchTerm
      ? `/customers/search?q=${debouncedSearchTerm}&page=${currentPage}&limit=${pageSize}`
      : `/customers?page=${currentPage}&limit=${pageSize}`,
    {
      enabled: true,
    }
  );

  // Use customers data or empty array if not available
  const customersList = data?.customers || data?.data?.customers || [];
  const totalCount = data?.total || data?.data?.total || 0;

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handle page change
  const handlePageChange = newPage => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = newPageSize => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1); // Reset to first page
  };

  // Reset to first page when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus]);

  // Filter customers by status (search is handled by API)
  const filteredCustomers = customersList.filter(customer => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && customer.is_active) ||
      (filterStatus === 'inactive' && !customer.is_active);
    return matchesStatus;
  });

  const handleCustomerClick = id => {
    navigate(`/customers/${id}`);
  };

  const handleEditCustomer = id => {
    navigate(`/customers/${id}/edit`);
  };

  return (
    <Page
      title='Khách hàng'
      subtitle='Quản lý danh sách khách hàng trong hệ thống'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Khách hàng', href: '/customers' },
      ]}
      primaryActions={[
        {
          label: 'Thêm khách hàng',
          onClick: () => navigate('/customers/create'),
          colorScheme: 'blue',
        },
      ]}
      secondaryActions={[
        {
          label: 'Import Excel',
          icon: <Upload size={16} />,
          onClick: () => console.log('Import Excel'),
          variant: 'outline',
        },
        {
          label: 'Xuất Excel',
          icon: <Download size={16} />,
          onClick: () => console.log('Export Excel'),
          variant: 'outline',
        },
      ]}
    >
      {/* Filters and Search */}
      <Card shadow='sm'>
        <CardBody>
          <HStack spacing={4} justify='space-between' wrap='wrap'>
            <CustomerFilters
              searchTerm={searchTerm}
              onSearchChange={e => setSearchTerm(e.target.value)}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
            />
          </HStack>
        </CardBody>
      </Card>

      {/* Customers Table */}
      <Card shadow='sm' p='0'>
        <CardBody>
          {isLoading ? (
            <VStack spacing={4} align='center' justify='center' minH='200px'>
              <Spinner size='lg' color='blue.500' />
              <Text color='gray.500'>Đang tải dữ liệu...</Text>
            </VStack>
          ) : error ? (
            <Alert status='error' borderRadius='md'>
              <AlertIcon />
              <Box>
                <AlertTitle>Lỗi!</AlertTitle>
                <AlertDescription>
                  {error.message ||
                    'Không thể tải danh sách khách hàng. Vui lòng thử lại.'}
                </AlertDescription>
              </Box>
            </Alert>
          ) : filteredCustomers.length === 0 ? (
            <CustomerEmptyState
              hasSearchTerm={!!searchTerm}
              hasFilter={filterStatus !== 'all'}
              onCreateCustomer={() => navigate('/customers/create')}
            />
          ) : (
            <CustomerTable
              customers={filteredCustomers}
              onViewDetail={handleCustomerClick}
              onEdit={handleEditCustomer}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardBody>
      </Card>
    </Page>
  );
};

export default CustomerListPage;
