import React, { useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
  Input,
} from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { useInvoiceReservation } from '@/hooks/useInvoiceReservation';

const InvoiceItemList = ({ items, invoiceId, onUpdateItem, onRemoveItem }) => {
  const { getAvailableStock, getTotalReserved } = useInvoiceReservation();

  // Pre-compute tổng qty theo variant (tính 1 lần thay vì N lần trong loop)
  const totalQtyByVariant = useMemo(() => {
    const map = {};
    items.forEach(item => {
      if (item.variantId) {
        map[item.variantId] = (map[item.variantId] || 0) + (item.quantity || 0);
      }
    });
    return map;
  }, [items]);

  const handleUpdateItem = useCallback(
    (itemId, field, value) => {
      onUpdateItem(itemId, field, value);
    },
    [onUpdateItem]
  );

  const handleRemoveItem = useCallback(
    itemId => {
      onRemoveItem(itemId);
    },
    [onRemoveItem]
  );

  if (items.length === 0) {
    return (
      <Box textAlign='center' py={8}>
        <Text color='gray.500'>
          Chưa có sản phẩm nào. Vui lòng tìm kiếm và thêm sản phẩm từ bên
          trái.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align='stretch'>
      {items.map(item => {
        // Available từ các invoice khác
        const availableFromOthers = getAvailableStock(
          item.variantId,
          invoiceId
        );

        // Tính qty từ other items = tổng - item hiện tại (O(1) thay vì O(N))
        const qtyFromOtherItems =
          (totalQtyByVariant[item.variantId] || 0) - (item.quantity || 0);

        // Max cho item này
        const maxForThisItem = Math.max(
          0,
          availableFromOthers - qtyFromOtherItems
        );

        const totalReserved = getTotalReserved(item.variantId, invoiceId);
        const isLowStock = maxForThisItem <= 5 && maxForThisItem > 0;
        const hasReservations = totalReserved > 0;

        return (
          <Box
            key={item.id}
            p={4}
            border='1px'
            borderColor={isLowStock ? 'orange.200' : 'gray.200'}
            borderRadius='md'
            bg={isLowStock ? 'orange.50' : 'transparent'}
          >
            <VStack spacing={3} align='stretch'>
              <HStack justify='space-between'>
                <VStack align='flex-start' spacing={1}>
                  <HStack align='center'>
                    <Text fontWeight='bold'>{item.productName}</Text>
                    <Text color='gray.600' fontStyle='italic'>
                      ({item.variantName})
                    </Text>
                  </HStack>
                </VStack>
                <IconButton
                  size='sm'
                  icon={<Trash2 size={16} />}
                  onClick={() => handleRemoveItem(item.id)}
                  colorScheme='red'
                  variant='ghost'
                />
              </HStack>

              {isLowStock && (
                <Alert status='warning' size='sm' borderRadius='md'>
                  <AlertIcon />
                  <AlertDescription fontSize='xs'>
                    Sắp hết hàng! Chỉ còn {maxForThisItem} sản phẩm khả dụng
                    {hasReservations &&
                      ` (${totalReserved} đang giữ ở tabs khác)`}
                  </AlertDescription>
                </Alert>
              )}

              <HStack spacing={4} align='stretch'>
                <Box>
                  <Text fontSize='sm' color='gray.600' mb={1}>
                    Số lượng
                  </Text>
                  <NumberInput
                    value={item.quantity || ''}
                    min={1}
                    max={maxForThisItem}
                    onChange={value => {
                      const numberValue = parseInt(value);
                      handleUpdateItem(
                        item.id,
                        'quantity',
                        Math.min(numberValue, maxForThisItem)
                      );
                    }}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <HStack spacing={2} mt={1}>
                    <Text fontSize='xs' color='gray.500'>
                      Khả dụng: {maxForThisItem}
                    </Text>
                    {item.stock !== maxForThisItem && (
                      <Text
                        fontSize='xs'
                        color='orange.600'
                        fontWeight='medium'
                      >
                        (Tồn thực: {item.stock})
                      </Text>
                    )}
                  </HStack>
                </Box>

                <Box flex={1}>
                  <Text fontSize='sm' color='gray.600' mb={1}>
                    Đơn giá (VNĐ)
                  </Text>
                  <NumberInput
                    value={item.unitPrice}
                    min={0}
                    onChange={value =>
                      handleUpdateItem(item.id, 'unitPrice', parseInt(value))
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                </Box>

                <Box flex={1}>
                  <Text fontSize='sm' color='gray.600' mb={1}>
                    Thành tiền
                  </Text>
                  <Text fontWeight='bold' fontSize='lg'>
                    {formatCurrency(item.totalPrice || 0)}
                  </Text>
                </Box>
              </HStack>

              <Box>
                <Text fontSize='sm' color='gray.600' mb={1}>
                  Ghi chú
                </Text>
                <Input
                  size='sm'
                  placeholder='Nhập ghi chú cho sản phẩm...'
                  value={item.productNotes || ''}
                  onChange={e =>
                    handleUpdateItem(item.id, 'productNotes', e.target.value)
                  }
                />
              </Box>
            </VStack>
          </Box>
        );
      })}
    </VStack>
  );
};

export default React.memo(InvoiceItemList);
