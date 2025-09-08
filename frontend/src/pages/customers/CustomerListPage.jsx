import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  Badge,
} from '@chakra-ui/react';
import {
  Eye,
  Edit,
  Plus,
  Upload,
  Download,
  Users,
  Phone,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Page from '../../components/organisms/Page';
import SearchInput from '../../components/atoms/SearchInput';
import FilterDropdown from '../../components/atoms/FilterDropdown';
import Pagination from '../../components/atoms/Pagination';
import { useFetchApi } from '../../hooks/useFetchApi';
import { useDebounce } from '../../hooks/useDebounce';

const CustomerListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
  ];

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

  const formatPhoneNumber = (phone) => {
    // Simple phone formatting
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
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
            <HStack spacing={4} wrap='wrap' w='100%'>
              <SearchInput
                placeholder='Tìm kiếm khách hàng...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <FilterDropdown
                label='Trạng thái'
                options={statusOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder='Tất cả'
              />
            </HStack>
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
            // Empty State
            <VStack
              spacing={6}
              align='center'
              justify='center'
              minH='300px'
              py={12}
            >
              <Box
                p={6}
                borderRadius='full'
                bg='gray.50'
                color='gray.400'
                display='flex'
                alignItems='center'
                justifyContent='center'
              >
                <Users size={48} />
              </Box>
              <VStack spacing={2} textAlign='center'>
                <Text fontSize='xl' fontWeight='semibold' color='gray.700'>
                  Chưa có khách hàng nào
                </Text>
                <Text fontSize='md' color='gray.500' maxW='400px'>
                  {searchTerm || filterStatus !== 'all'
                    ? 'Không tìm thấy khách hàng phù hợp với bộ lọc hiện tại'
                    : 'Bắt đầu bằng cách thêm khách hàng đầu tiên vào hệ thống'}
                </Text>
                {!searchTerm && filterStatus === 'all' && (
                  <Button
                    leftIcon={<Plus size={16} />}
                    colorScheme='blue'
                    onClick={() => navigate('/customers/create')}
                    mt={4}
                  >
                    Thêm khách hàng đầu tiên
                  </Button>
                )}
              </VStack>
            </VStack>
          ) : (
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th fontWeight='bold'>Tên khách hàng</Th>
                    <Th fontWeight='bold'>Số điện thoại</Th>
                    <Th fontWeight='bold'>Địa chỉ</Th>
                    <Th fontWeight='bold'>Trạng thái</Th>
                    <Th fontWeight='bold'>Ngày tạo</Th>
                    <Th fontWeight='bold'>Thao tác</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredCustomers.map((customer) => (
                    <Tr
                      key={customer.id}
                      _hover={{ bg: 'gray.50' }}
                      cursor='pointer'
                      onClick={() => handleCustomerClick(customer.id)}
                    >
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight='bold' fontSize='md'>
                            {customer.name}
                          </Text>
                          <Text fontSize='xs' color='gray.500'>
                            ID: {customer.id}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Phone size={14} color='gray.500' />
                          <Text fontSize='md' fontFamily='mono'>
                            {formatPhoneNumber(customer.phone)}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        {customer.address ? (
                          <HStack spacing={2} align="start">
                            <MapPin size={14} color='gray.500' mt={1} />
                            <Text fontSize='sm' color='gray.600' noOfLines={2}>
                              {customer.address}
                            </Text>
                          </HStack>
                        ) : (
                          <Text fontSize='sm' color='gray.400' fontStyle='italic'>
                            Chưa có địa chỉ
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={customer.is_active ? 'green' : 'red'}
                          variant='subtle'
                        >
                          {customer.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize='sm' color='gray.600'>
                          {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size='sm'
                            variant='ghost'
                            colorScheme='blue'
                            onClick={e => {
                              e.stopPropagation();
                              handleCustomerClick(customer.id);
                            }}
                            title='Xem chi tiết'
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            colorScheme='orange'
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/customers/${customer.id}/edit`);
                            }}
                            title='Chỉnh sửa'
                          >
                            <Edit size={16} />
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {!isLoading && !error && totalCount > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              )}
            </TableContainer>
          )}
        </CardBody>
      </Card>
    </Page>
  );
};

export default CustomerListPage;
