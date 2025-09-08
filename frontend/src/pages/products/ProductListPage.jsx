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
} from '@chakra-ui/react';
import {
  Eye,
  Edit,
  Plus,
  Upload,
  Download,
  Trash2,
  Package,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Page from '../../components/organisms/Page';
import SearchInput from '../../components/atoms/SearchInput';
import FilterDropdown from '../../components/atoms/FilterDropdown';
import Pagination from '../../components/atoms/Pagination';
import { useFetchApi } from '../../hooks/useFetchApi';
import { useDeleteApi } from '../../hooks/useDeleteApi';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/formatters';

const ProductListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter options
  const categoryOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Thép hộp', label: 'Thép hộp' },
    { value: 'Thép tấm', label: 'Thép tấm' },
    { value: 'Thép ống', label: 'Thép ống' },
  ];

  // Fetch products from API with debounced search and pagination
  const { data, isLoading, error, refetch } = useFetchApi(
    [
      'products',
      'search',
      {
        search: debouncedSearchTerm,
        category: filterCategory,
        page: currentPage,
        limit: pageSize,
      },
    ],
    debouncedSearchTerm
      ? `/products/search?q=${debouncedSearchTerm}&page=${currentPage}&limit=${pageSize}`
      : `/products?page=${currentPage}&limit=${pageSize}`,
    {
      enabled: true,
    }
  );

  // Delete product mutation
  const deleteProductMutation = useDeleteApi('/products', {
    invalidateQueries: [['products']],
    onSuccess: () => {
      refetch();
    },
  });

  // Use products data or empty array if not available
  const productsList = data?.products || data?.data?.products || [];
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
  }, [debouncedSearchTerm, filterCategory]);

  // Filter products by category (search is handled by API)
  const filteredProducts = productsList.filter(product => {
    const matchesCategory =
      filterCategory === 'all' || product.category?.name === filterCategory;
    return matchesCategory;
  });

  // Create paginated data with variants as separate rows
  const paginatedData = filteredProducts.flatMap(product => {
    if (!product.variants || product.variants.length === 0) {
      // If no variants, create a placeholder row
      return [
        {
          product,
          variant: {
            id: 0,
            name: 'Không có variant',
            unit: product.unit,
            stock: 0,
            sold: 0,
            price: 0,
          },
          isFirstVariant: true,
        },
      ];
    }

    return product.variants.map((variant, index) => ({
      product,
      variant,
      isFirstVariant: index === 0,
    }));
  });

  const handleProductClick = id => {
    navigate(`/products/${id}`);
  };

  const handleDeleteClick = async (product, e) => {
    e.stopPropagation();
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)
    ) {
      try {
        await deleteProductMutation.mutateAsync(product.id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <Page
      title='Sản phẩm'
      subtitle='Quản lý danh mục sản phẩm trong hệ thống'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Sản phẩm', href: '/products' },
      ]}
      primaryActions={[
        {
          label: 'Thêm sản phẩm',
          onClick: () => navigate('/products/create'),
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
                placeholder='Tìm kiếm sản phẩm...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <FilterDropdown
                label='Danh mục'
                options={categoryOptions}
                value={filterCategory}
                onChange={setFilterCategory}
                placeholder='Tất cả'
              />
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Products Table */}
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
                    'Không thể tải danh sách sản phẩm. Vui lòng thử lại.'}
                </AlertDescription>
              </Box>
            </Alert>
          ) : paginatedData.length === 0 ? (
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
                <Package size={48} />
              </Box>
              <VStack spacing={2} textAlign='center'>
                <Text fontSize='xl' fontWeight='semibold' color='gray.700'>
                  Chưa có sản phẩm nào
                </Text>
                <Text fontSize='md' color='gray.500' maxW='400px'>
                  {searchTerm || filterCategory !== 'all'
                    ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại'
                    : 'Bắt đầu bằng cách thêm sản phẩm đầu tiên vào hệ thống'}
                </Text>
                {!searchTerm && filterCategory === 'all' && (
                  <Button
                    leftIcon={<Plus size={16} />}
                    colorScheme='blue'
                    onClick={() => navigate('/products/create')}
                    mt={4}
                  >
                    Thêm sản phẩm đầu tiên
                  </Button>
                )}
              </VStack>
            </VStack>
          ) : (
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th fontWeight='bold'>Tên sản phẩm</Th>
                    <Th fontWeight='bold'>Variants của sản phẩm</Th>
                    <Th fontWeight='bold'>Đơn vị</Th>
                    <Th fontWeight='bold'>Tồn kho</Th>
                    <Th fontWeight='bold'>Đã bán</Th>
                    <Th fontWeight='bold'>Giá tiền</Th>
                    <Th fontWeight='bold'>Thao tác</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedData.map(({ product, variant, isFirstVariant }) => (
                    <Tr
                      key={`${product.id}-${variant.id}`}
                      _hover={{ bg: 'gray.50' }}
                      cursor='pointer'
                      onClick={() => handleProductClick(product.id)}
                    >
                      <Td>
                        {isFirstVariant && (
                          <Text fontWeight='bold' fontSize='md'>
                            {product.name}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Text fontSize='md'>{variant.name}</Text>
                      </Td>
                      <Td>
                        <Text color='gray.600'>{variant.unit}</Text>
                      </Td>
                      <Td>
                        <Text>{variant.stock}</Text>
                      </Td>
                      <Td>
                        <Text>{variant.sold}</Text>
                      </Td>
                      <Td>
                        <Text color='blue.600'>
                          {formatCurrency(variant.price)}
                        </Text>
                      </Td>
                      <Td>
                        {isFirstVariant && (
                          <HStack spacing={2}>
                            <Button
                              size='sm'
                              variant='ghost'
                              colorScheme='blue'
                              onClick={e => {
                                e.stopPropagation();
                                handleProductClick(product.id);
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
                                navigate(`/products/${product.id}/edit`);
                              }}
                              title='Chỉnh sửa'
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              size='sm'
                              variant='ghost'
                              colorScheme='red'
                              onClick={e => handleDeleteClick(product, e)}
                              title='Xóa sản phẩm'
                            >
                              <Trash2 size={16} />
                            </Button>
                          </HStack>
                        )}
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

export default ProductListPage;
