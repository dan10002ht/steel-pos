import React from 'react';
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
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { useInvoiceReservation } from '@/hooks/useInvoiceReservation';

const InvoiceItemList = ({ items, invoiceId, onUpdateItem, onRemoveItem }) => {
  const { getAvailableStock, getTotalReserved } = useInvoiceReservation();
  const handleUpdateItem = (itemId, field, value) => {
    onUpdateItem(itemId, field, value);
  };

  const handleRemoveItem = itemId => {
    onRemoveItem(itemId);
  };

  if (items.length === 0) {
    return (
      <Box textAlign='center' py={8}>
        <Text color='gray.500'>
          Chưa có sản phẩm nào. Vui lòng tìm kiếm và thêm sản phẩm từ bên trái.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align='stretch'>
      {items.map(item => {
        const availableStock = getAvailableStock(item.variantId, invoiceId);
        const totalReserved = getTotalReserved(item.variantId, invoiceId);
        const isLowStock = availableStock <= 5 && availableStock > 0;
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
                  <HStack>
                    <Text fontWeight='bold'>{item.productName}</Text>
                    {hasReservations && (
                      <Badge colorScheme='orange' fontSize='xs'>
                        <HStack spacing={1}>
                          <AlertTriangle size={10} />
                        </HStack>
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize='sm' color='gray.600'>
                    {item.variantName}
                  </Text>
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
                    Sắp hết hàng! Chỉ còn {availableStock} sản phẩm khả dụng
                    {hasReservations &&
                      ` (${totalReserved} đang giữ ở tabs khác)`}
                  </AlertDescription>
                </Alert>
              )}

              <HStack spacing={4} align='stretch'>
                <Box flex={1}>
                  <Text fontSize='sm' color='gray.600' mb={1}>
                    Số lượng
                  </Text>
                  <NumberInput
                    value={item.quantity}
                    min={1}
                    max={availableStock}
                    onChange={value => {
                      const numberValue = parseInt(value);
                      handleUpdateItem(
                        item.id,
                        'quantity',
                        Math.min(numberValue, availableStock)
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
                      Khả dụng: {availableStock}
                    </Text>
                    {item.stock !== availableStock && (
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
            </VStack>
          </Box>
        );
      })}
    </VStack>
  );
};

export default InvoiceItemList;
