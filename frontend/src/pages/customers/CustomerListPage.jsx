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
  const [debtFilter, setDebtFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build API URL with sort and filter params
  const buildUrl = () => {
    if (debouncedSearchTerm) {
      return `/customers/search?q=${debouncedSearchTerm}&page=${currentPage}&limit=${pageSize}`;
    }
    let url = `/customers?page=${currentPage}&limit=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    if (debtFilter) {
      url += `&debt_filter=${debtFilter}`;
    }
    return url;
  };

  // Fetch customers from API with debounced search and pagination
  const { data, isLoading, error, refetch } = useFetchApi(
    [
      'customers',
      'search',
      {
        search: debouncedSearchTerm,
        status: filterStatus,
        debtFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: pageSize,
      },
    ],
    buildUrl(),
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

  // Reset to first page when search, filter, or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, debtFilter, sortBy, sortOrder]);

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

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
              debtFilter={debtFilter}
              onDebtFilterChange={setDebtFilter}
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
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
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
