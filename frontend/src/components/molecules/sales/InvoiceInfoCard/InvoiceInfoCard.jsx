import React from "react";
import {
  Box,
  Card,
  CardBody,
  Text,
  Grid,
  Badge,
} from "@chakra-ui/react";
import { 
  getInvoiceStatusColor, 
  getInvoiceStatusText, 
  getPaymentStatusColor, 
  getPaymentStatusText 
} from "@/utils/statusHelpers";

const InvoiceInfoCard = ({ invoice }) => {
  if (!invoice) {
    return null;
  }

  return (
    <Card>
      <CardBody>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Thông tin hoá đơn
        </Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
          <Box>
            <Text fontWeight="medium" color="gray.600">
              Mã hoá đơn
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              {invoice.invoice_code}
            </Text>
          </Box>
          <Box>
            <Text fontWeight="medium" color="gray.600">
              Ngày tạo
            </Text>
            <Text>
              {new Date(invoice.created_at).toLocaleDateString("vi-VN")}
            </Text>
          </Box>
          <Box>
            <Text fontWeight="medium" color="gray.600">
              Trạng thái hoá đơn
            </Text>
            <Badge colorScheme={getInvoiceStatusColor(invoice.status)}>
              {getInvoiceStatusText(invoice.status)}
            </Badge>
          </Box>
          <Box>
            <Text fontWeight="medium" color="gray.600">
              Trạng thái thanh toán
            </Text>
            <Badge colorScheme={getPaymentStatusColor(invoice.payment_status)}>
              {getPaymentStatusText(invoice.payment_status)}
            </Badge>
          </Box>
        </Grid>
      </CardBody>
    </Card>
  );
};

export default InvoiceInfoCard;


