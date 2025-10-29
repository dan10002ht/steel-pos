import React, { useState, useContext } from 'react';
import {
  Box,
  Card,
  CardBody,
  Button,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Select,
  Heading,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import {
  Plus,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  Printer,
  Calendar,
  Package,
  Search,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Page from '../../components/organisms/Page';
import Pagination from '../../components/atoms/Pagination';
import { useFetchApi } from '../../hooks/useFetchApi';
import { useEditApi } from '../../hooks/useEditApi';
import { useDeleteApi } from '../../hooks/useDeleteApi';
import { useQueryClient } from '@tanstack/react-query';

import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/atoms/StatusBadge';
import InventoryFilters from '../../components/molecules/inventory/InventoryFilters';
import { TOAST_DURATION } from '../../constants/options';
import { AuthContext } from '../../contexts/AuthContext';

const InventoryList = () => {
  const { isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');
  const toast = useToast();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (currentPage) queryParams.append('page', currentPage);
  if (pageSize) queryParams.append('limit', pageSize);
  if (statusFilter) queryParams.append('status', statusFilter);
  if (supplierFilter) queryParams.append('supplier_name', supplierFilter);
  if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);

  const queryString = queryParams.toString();
  const apiUrl = `/import-orders${queryString ? `?${queryString}` : ''}`;

  // Fetch import orders
  const {
    data: importOrdersData,
    error,
    isPending: isLoading,
  } = useFetchApi(
    [
      'import-orders',
      {
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        supplierName: supplierFilter,
        search: debouncedSearchTerm,
      },
    ],
    apiUrl
  );

  // Approve import order mutation
  const approveMutation = useEditApi('/import-orders', {
    method: 'POST',
    invalidateQueries: [['import-orders']],
    onSuccess: (data, variables) => {
      // Invalidate specific import order query after approval
      const orderId = variables.url?.split('/')[2]; // Extract ID from URL
      if (orderId) {
        queryClient.invalidateQueries({
          queryKey: ['import-order', orderId],
        });
      }

      toast({
        title: 'Thành công',
        description: 'Đơn nhập hàng đã được phê duyệt',
        status: 'success',
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });
      setIsApprovalModalOpen(false);
    },
    onError: error => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể phê duyệt đơn nhập hàng',
        status: 'error',
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });
    },
  });

  // Delete import order mutation
  const deleteMutation = useDeleteApi('/import-orders', {
    invalidateQueries: [['import-orders']],
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đơn nhập hàng đã được xóa',
        status: 'success',
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });
    },
    onError: error => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa đơn nhập hàng',
        status: 'error',
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });
    },
  });

  // Use API response directly
  const importOrders = importOrdersData?.import_orders || [];
  const totalCount = importOrdersData?.total || 0;

  const suppliers = [
    'Công ty Thép ABC',
    'Công ty Thép XYZ',
    'Công ty Thép DEF',
    'Công ty Thép GHI',
  ];

  const handleApproval = order => {
    setSelectedOrder(order);
    setApprovalNote('');
    setIsApprovalModalOpen(true);
  };

  const handleApprovalConfirmed = () => {
    if (!selectedOrder) return;

    approveMutation.mutate({
      url: `/import-orders/${selectedOrder.id}/approve`,
      data: { approval_note: approvalNote },
    });
  };

  // const handleDelete = orderId => {
  //   if (window.confirm('Bạn có chắc chắn muốn xóa đơn nhập hàng này?')) {
  //     deleteMutation.mutate(orderId);
  //   }
  // };

  const handleEdit = orderId => {
    // Navigate to edit page
    navigate(`/inventory/${orderId}/edit`);
  };

  const handleViewDetail = orderId => {
    // Navigate to detail page
    navigate(`/inventory/${orderId}`);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        setCurrentPage(1);
        break;
      case 'status':
        setStatusFilter(value);
        setCurrentPage(1);
        break;
      case 'supplier':
        setSupplierFilter(value);
        setCurrentPage(1);
        break;
      case 'page':
        setCurrentPage(value);
        break;
      case 'limit':
        setPageSize(value);
        setCurrentPage(1);
        break;
      default:
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSupplierFilter('');
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải danh sách đơn nhập hàng',
        status: 'error',
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });
    }
  }, [error, toast]);

  return (
    <Page
      title='Quản lý kho'
      subtitle='Danh sách đơn nhập hàng và quản lý tồn kho'
      primaryActions={[
        {
          label: 'Tạo đơn nhập hàng',
          onClick: () => navigate('/inventory/create'),
          colorScheme: 'blue',
          leftIcon: <Plus size={16} />,
        },
      ]}
    >
      <Box w='100%' maxW='100%' mx='auto'>
        {/* Filters Section */}
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align='stretch'>
              <InventoryFilters
                searchTerm={searchTerm}
                onSearchChange={value => handleFilterChange('search', value)}
                statusFilter={statusFilter}
                onStatusChange={value => handleFilterChange('status', value)}
                supplierFilter={supplierFilter}
                onSupplierChange={value =>
                  handleFilterChange('supplier', value)
                }
                pageSize={pageSize}
                onPageSizeChange={value =>
                  handleFilterChange('pageSize', value)
                }
                suppliers={suppliers.map(name => ({ name }))}
              />

              <Button
                size='sm'
                variant='outline'
                w='fit-content'
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card>
          <CardBody>
            <Box overflowX='auto'>
              <Table variant='simple' size='sm'>
                <Thead>
                  <Tr>
                    <Th>Mã đơn</Th>
                    <Th>Nhà cung cấp</Th>
                    <Th>Ngày nhập kho</Th>
                    <Th isNumeric>Tổng giá trị</Th>
                    <Th isNumeric>SL SP</Th>
                    <Th>Trạng thái</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {importOrders.map(order => (
                    <Tr
                      height={'60px'}
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => handleViewDetail(order.id)}
                      cursor='pointer'
                      key={order.id}
                    >
                      <Td>{order.import_code}</Td>
                      <Td>{order.supplier_name}</Td>
                      <Td>{formatDate(order.import_date)}</Td>
                      <Td isNumeric>{formatCurrency(order.total_amount)}</Td>
                      <Td isNumeric>
                        {order.items?.reduce(
                          (acc, item) => acc + item.quantity,
                          0
                        ) || 0}
                      </Td>
                      <Td>
                        <StatusBadge status={order.status} />
                      </Td>
                      <Td>
                        <HStack spacing={1} justify='flex-end'>
                          {order.status === 'pending' && (
                            <Tooltip label='Phê duyệt' placement='top' hasArrow>
                              <IconButton
                                icon={<Check size={18} />}
                                size='sm'
                                colorScheme='green'
                                aria-label='Phê duyệt'
                                onClick={e => {
                                  e.stopPropagation();
                                  handleApproval(order);
                                }}
                                isLoading={approveMutation.isPending}
                              />
                            </Tooltip>
                          )}
                          {order.status === 'pending' && (
                            <Tooltip label='Sửa' placement='top' hasArrow>
                              <IconButton
                                icon={<Edit size={18} />}
                                size='sm'
                                aria-label='Sửa'
                                onClick={e => {
                                  e.stopPropagation();
                                  handleEdit(order.id);
                                }}
                              />
                            </Tooltip>
                          )}

                          <Tooltip
                            label='Xem chi tiết'
                            placement='top'
                            hasArrow
                          >
                            <IconButton
                              icon={<Eye size={18} />}
                              size='sm'
                              colorScheme='blue'
                              aria-label='Xem chi tiết'
                              variant='ghost'
                              onClick={e => {
                                e.stopPropagation();
                                handleViewDetail(order.id);
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Empty State */}
            {importOrders.length === 0 && !isLoading && !error && (
              <Box
                textAlign='center'
                py={16}
                px={6}
                borderWidth='1px'
                borderStyle='dashed'
                borderColor='gray.200'
                borderRadius='lg'
                bg='gray.50'
              >
                <VStack spacing={4}>
                  <Box
                    w='16'
                    h='16'
                    borderRadius='full'
                    bg='blue.100'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                  >
                    <Package size={32} color='#3182CE' />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size='md' color='gray.600'>
                      Chưa có đơn nhập hàng nào
                    </Heading>
                    <Text color='gray.500' fontSize='sm'>
                      {searchTerm || statusFilter || supplierFilter
                        ? 'Không tìm thấy đơn nhập hàng phù hợp với bộ lọc hiện tại'
                        : 'Bắt đầu tạo đơn nhập hàng đầu tiên để quản lý kho hàng'}
                    </Text>
                  </VStack>
                  {!searchTerm && !statusFilter && !supplierFilter && (
                    <Button
                      colorScheme='blue'
                      leftIcon={<Plus size={16} />}
                      onClick={() => navigate('/inventory/create')}
                    >
                      Tạo đơn nhập hàng đầu tiên
                    </Button>
                  )}
                  {(searchTerm || statusFilter || supplierFilter) && (
                    <Button variant='outline' onClick={clearFilters}>
                      Xóa bộ lọc
                    </Button>
                  )}
                </VStack>
              </Box>
            )}

            {/* Pagination - Only show if there are items */}
            {importOrders.length > 0 && (
              <Box mt={6}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  pageSize={pageSize}
                  onPageChange={page => handleFilterChange('page', page)}
                  onPageSizeChange={limit => handleFilterChange('limit', limit)}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* Approval Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Phê duyệt đơn nhập hàng</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Bạn có chắc chắn muốn phê duyệt đơn nhập hàng{' '}
                <strong>{selectedOrder?.importCode}</strong>?
              </Text>
              <FormControl>
                <FormLabel>Ghi chú phê duyệt</FormLabel>
                <Input
                  value={approvalNote}
                  onChange={e => setApprovalNote(e.target.value)}
                  placeholder='Nhập ghi chú phê duyệt (tùy chọn)'
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='ghost'
              mr={3}
              onClick={() => setIsApprovalModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              colorScheme='green'
              onClick={handleApprovalConfirmed}
              isLoading={approveMutation.isPending}
            >
              Phê duyệt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Page>
  );
};

export default InventoryList;
