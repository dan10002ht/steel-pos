import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Divider,
} from '@chakra-ui/react';
import { formatCurrency } from '@/utils/formatters';

const InvoiceSummary = ({ invoice }) => {
  if (!invoice) return null;

  const remainingAmount = invoice.total_amount - invoice.paid_amount;

  return (
    <Box p={4} bg="gray.50" borderRadius="md">
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">Tổng tiền hóa đơn:</Text>
          <Text fontWeight="medium">{formatCurrency(invoice.total_amount)}</Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">Đã thanh toán:</Text>
          <Text fontWeight="medium" color="green.600">
            {formatCurrency(invoice.paid_amount)}
          </Text>
        </HStack>
        <Divider />
        <HStack justify="space-between">
          <Text fontSize="md" fontWeight="bold" color="red.600">
            Còn lại:
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="red.600">
            {formatCurrency(remainingAmount)}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default InvoiceSummary;
