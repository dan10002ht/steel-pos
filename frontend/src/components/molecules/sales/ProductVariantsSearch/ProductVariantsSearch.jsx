import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Text,
  HStack,
  Badge,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Tooltip,
} from '@chakra-ui/react';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { useProductVariantsSearch } from '@/hooks/sales/useProductVariantsSearch';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { formatCurrency } from '@/utils/formatters';
import { useInvoiceReservation } from '@/hooks/useInvoiceReservation';

const ProductVariantsSearch = ({ invoice, onUpdate, enabled = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const { updateActualStock, getAvailableStock, getTotalReserved } =
    useInvoiceReservation();

  // Use the custom hook for product variants search
  const {
    searchResults,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    hasResults,
    isEmpty,
  } = useProductVariantsSearch({
    searchTerm,
    limit: 20,
    enabled,
  });

  // Use infinite scroll hook
  const lastElementObserver = useInfiniteScroll(
    loadMore,
    hasMore,
    isLoadingMore
  );

  // Update actual stock in reservation context when search results change
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      searchResults.forEach(variant => {
        updateActualStock(variant.id, variant.stock);
      });
    }
  }, [searchResults, updateActualStock]);

  const handleAddProduct = variant => {
    // Tính số lượng variant này đã có trong invoice hiện tại
    const currentQtyInInvoice = invoice.items
      .filter(item => item.variantId === variant.id)
      .reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Get available stock từ các invoice khác
    const availableFromOthers = getAvailableStock(variant.id, invoice.id);

    // Available thực tế = available từ others - số đã có trong invoice này
    const actualAvailable = availableFromOthers - currentQtyInInvoice;

    // Check if variant is out of stock
    if (actualAvailable <= 0) {
      const totalReserved = getTotalReserved(variant.id, invoice.id);
      toast({
        title: 'Không thể thêm sản phẩm',
        description:
          currentQtyInInvoice > 0
            ? `Đã có ${currentQtyInInvoice} sản phẩm trong hóa đơn, không còn hàng để thêm`
            : totalReserved > 0
              ? `Sản phẩm này đã hết hàng (${totalReserved} đang được giữ trong các hóa đơn khác)`
              : 'Sản phẩm này đã hết hàng',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newItem = {
      id: Date.now(),
      productId: variant.product_id,
      variantId: variant.id,
      productName: variant.product_name,
      variantName: variant.name,
      sku: variant.sku,
      quantity: 1,
      unitPrice: variant.unit_price || variant.price || 0,
      totalPrice: variant.unit_price || variant.price || 0,
      stock: variant.stock,
      unit: variant.unit || variant.product_unit || 'cái',
      productNotes: '',
    };

    const updatedInvoice = {
      ...invoice,
      items: [...invoice.items, newItem],
    };

    // Reservation sẽ được sync từ InvoiceForm khi items thay đổi
    onUpdate(updatedInvoice);
  };

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  return (
    <VStack spacing={4} align='stretch' h='full'>
      {/* Search Header */}
      <Box>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
          Tìm sản phẩm
        </Text>
        <InputGroup>
          <InputLeftElement pointerEvents='none'>
            {isLoading ? <Spinner size='sm' /> : <Search size={20} />}
          </InputLeftElement>
          <Input
            placeholder='Nhập tên sản phẩm hoặc phân loại...'
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </InputGroup>
      </Box>

      {/* Error State */}
      {error && (
        <Alert status='error' borderRadius='md'>
          <AlertIcon />
          <AlertDescription fontSize='sm'>
            Lỗi tìm kiếm: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Product List */}
      <Box flex={1} overflowY='auto'>
        <VStack spacing={3} align='stretch'>
          {/* Loading State */}
          {isLoading && searchTerm.length >= 1 && (
            <Box p={4} textAlign='center'>
              <Spinner size='sm' />
              <Text fontSize='sm' color='gray.500' mt={2}>
                Đang tìm kiếm...
              </Text>
            </Box>
          )}

          {/* Empty State */}
          {isEmpty && (
            <Box p={4} textAlign='center'>
              <Text fontSize='sm' color='gray.500'>
                Không tìm thấy sản phẩm
              </Text>
            </Box>
          )}

          {/* No Search State */}
          {!isLoading && !error && searchTerm.length === 0 && (
            <Box p={4} textAlign='center'>
              <Text fontSize='sm' color='gray.500'>
                Nhập từ khóa để tìm kiếm sản phẩm
              </Text>
            </Box>
          )}

          {/* Search Results */}
          {hasResults &&
            searchResults.map((variant, index) => {
              const isLastElement = index === searchResults.length - 1;
              const availableStock = getAvailableStock(variant.id, invoice.id);
              const totalReserved = getTotalReserved(variant.id, invoice.id);
              const hasReservations = totalReserved > 0;

              return (
                <Card
                  key={`${variant.product_id}-${variant.id}`}
                  ref={isLastElement ? lastElementObserver : null}
                  variant='outline'
                  cursor={availableStock > 0 ? 'pointer' : 'not-allowed'}
                  opacity={availableStock === 0 ? 0.6 : 1}
                  _hover={availableStock > 0 ? { shadow: 'md' } : {}}
                  onClick={() => handleAddProduct(variant)}
                >
                  <CardBody p={4}>
                    <VStack align='stretch' spacing={2}>
                      <HStack justify='space-between'>
                        <Text fontWeight='bold' fontSize='sm'>
                          {variant.product_name} - {variant.name}
                        </Text>
                        <HStack spacing={1}>
                          {hasReservations && (
                            <Tooltip
                              label={`Tồn thực: ${variant.stock} | Đang giữ: ${totalReserved} ở các hóa đơn khác`}
                              placement='top'
                            >
                              <Box>
                                <AlertTriangle size={14} color='orange' />
                              </Box>
                            </Tooltip>
                          )}
                          <Badge
                            colorScheme={
                              availableStock === 0
                                ? 'red'
                                : availableStock <= 5
                                  ? 'orange'
                                  : 'green'
                            }
                            fontSize='xs'
                          >
                            {availableStock > 0
                              ? `Tồn: ${availableStock}`
                              : 'Hết hàng'}
                          </Badge>
                        </HStack>
                      </HStack>

                      <HStack justify='space-between'>
                        <Text fontSize='sm' fontWeight='medium'>
                          {formatCurrency(
                            variant.unit_price || variant.price || 0
                          )}
                        </Text>
                        <Button
                          size='sm'
                          leftIcon={<Package size={14} />}
                          colorScheme='blue'
                          variant='ghost'
                          isDisabled={availableStock === 0}
                        >
                          Thêm
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}

          {/* Load More Loading State */}
          {isLoadingMore && (
            <Box p={4} textAlign='center'>
              <Spinner size='sm' />
              <Text fontSize='sm' color='gray.500' mt={2}>
                Đang tải thêm...
              </Text>
            </Box>
          )}

          {/* No More Results */}
          {!hasMore && hasResults && searchResults.length > 0 && (
            <Box p={3} textAlign='center'>
              <Text fontSize='sm' color='gray.500'>
                Đã hiển thị tất cả kết quả
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default ProductVariantsSearch;
