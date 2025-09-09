import React from "react";
import { HStack, Box, Text, Badge } from "@chakra-ui/react";
import { formatCurrency, formatDate } from "../../../utils/formatters";

const InvoiceListItem = ({ invoice, onClick }) => {
  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      paid: { colorScheme: 'green', text: 'Đã thanh toán' },
      partial: { colorScheme: 'yellow', text: 'Thanh toán một phần' },
      unpaid: { colorScheme: 'red', text: 'Chưa thanh toán' }
    };
    
    const config = statusMap[status] || statusMap.unpaid;
    
    return (
      <Badge
        colorScheme={config.colorScheme}
        variant="subtle"
        fontSize="xs"
      >
        {config.text}
      </Badge>
    );
  };

  return (
    <HStack
      p={3}
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      _hover={{ bg: "gray.50" }}
      cursor="pointer"
      onClick={onClick}
    >
      <Box flex="1">
        <Text fontWeight="semibold">
          {invoice.invoice_code}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {formatDate(invoice.created_at)}
        </Text>
      </Box>
      <Box textAlign="right">
        <Text fontWeight="semibold" color="blue.600">
          {formatCurrency(invoice.total_amount)}
        </Text>
        {getPaymentStatusBadge(invoice.payment_status)}
      </Box>
    </HStack>
  );
};

export default InvoiceListItem;
