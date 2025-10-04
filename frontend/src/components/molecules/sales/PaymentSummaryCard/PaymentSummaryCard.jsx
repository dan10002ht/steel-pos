import React from "react";
import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Divider,
} from "@chakra-ui/react";
import { formatCurrency } from "@/utils";

const PaymentSummaryCard = ({ invoice }) => {
  if (!invoice) {
    return null;
  }

  return (
    <Card>
      <CardBody>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          Tổng kết thanh toán
        </Text>
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between">
            <Text>Thành tiền:</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </HStack>
          {invoice.discount_amount > 0 && (
            <HStack justify="space-between">
              <Text>Giảm giá:</Text>
              <Text color="red.500">
                -{formatCurrency(invoice.discount_amount)}
              </Text>
            </HStack>
          )}
          {invoice.tax_amount > 0 && (
            <HStack justify="space-between">
              <Text>Thuế ({invoice.tax_percentage}%):</Text>
              <Text>{formatCurrency(invoice.tax_amount)}</Text>
            </HStack>
          )}
          <Divider />
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="lg">
              Tổng cộng:
            </Text>
            <Text fontWeight="bold" fontSize="lg" color="blue.500">
              {formatCurrency(invoice.total_amount)}
            </Text>
          </HStack>
          {invoice.paid_amount > 0 && (
            <HStack justify="space-between">
              <Text>Đã thanh toán:</Text>
              <Text color="green.500">
                {formatCurrency(invoice.paid_amount)}
              </Text>
            </HStack>
          )}
          {invoice.payment_status === "partial" && (
            <HStack justify="space-between">
              <Text>Còn lại:</Text>
              <Text color="orange.500" fontWeight="bold">
                {formatCurrency(invoice.total_amount - invoice.paid_amount)}
              </Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PaymentSummaryCard;











