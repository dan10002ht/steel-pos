import React from "react";
import {
  Box,
  Card,
  CardBody,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from "@chakra-ui/react";
import { formatCurrency } from '@/utils/formatters';

const PaymentHistoryTable = ({ 
  payments = [], 
  isLoading = false, 
  error = null 
}) => {
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Tiền mặt';
      case 'card':
        return 'Thẻ';
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'credit':
        return 'Ghi nợ';
      default:
        return method;
    }
  };

  return (
    <Card>
      <CardBody>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Lịch sử thanh toán
        </Text>
        {isLoading ? (
          <Text color="gray.500">Đang tải lịch sử thanh toán...</Text>
        ) : error ? (
          <Text color="red.500">Lỗi tải lịch sử thanh toán: {error.message}</Text>
        ) : payments && payments.length > 0 ? (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Ngày thanh toán</Th>
                  <Th>Phương thức</Th>
                  <Th isNumeric>Số tiền</Th>
                  <Th>Ghi chú</Th>
                </Tr>
              </Thead>
              <Tbody>
                {payments.map((payment) => (
                  <Tr key={payment.id}>
                    <Td>
                      {new Date(payment.payment_date).toLocaleString("vi-VN")}
                    </Td>
                    <Td>
                      <Badge colorScheme="blue">
                        {getPaymentMethodText(payment.payment_method)}
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold" color="green.500">
                      {formatCurrency(payment.amount)}
                    </Td>
                    <Td>{payment.notes || '-'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Text color="gray.500">Chưa có lịch sử thanh toán</Text>
        )}
      </CardBody>
    </Card>
  );
};

export default PaymentHistoryTable;









