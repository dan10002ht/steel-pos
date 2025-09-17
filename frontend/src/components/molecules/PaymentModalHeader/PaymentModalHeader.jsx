import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react';

const PaymentModalHeader = ({ invoice }) => {
  if (!invoice) return null;

  return (
    <VStack align="stretch" spacing={2}>
      <Text fontSize="lg" fontWeight="bold">
        Thanh toán hóa đơn
      </Text>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600">
          Mã hóa đơn: {invoice.invoice_code}
        </Text>
        <Badge colorScheme="blue" fontSize="xs">
          {invoice.status}
        </Badge>
      </HStack>
    </VStack>
  );
};

export default PaymentModalHeader;
