import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  VStack,
  Box,
  HStack,
  Text,
  Card,
  CardBody,
  Divider,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
  GridItem,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { Printer, Mail, Edit, X } from "lucide-react";
import { useFetchApi } from "../../hooks/useFetchApi";
import { formatCurrency } from "../../utils/formatters";
import { 
  getInvoiceStatusColor, 
  getInvoiceStatusText, 
  getPaymentStatusColor, 
  getPaymentStatusText 
} from "../../utils/statusHelpers";
import Page from "../../components/organisms/Page/Page";
import CancelInvoiceModal from "../../components/molecules/sales/CancelInvoiceModal/CancelInvoiceModal";
import InvoicePdf from "../../components/molecules/sales/InvoicePdf/InvoicePdf";

const SalesDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Fetch invoice data from API
  const { data: invoiceData, error, isPending: isLoading } = useFetchApi(
    ['invoice', id],
    `/invoices/${id}`,
    {
      enabled: !!id,
    }
  );
  const invoice = invoiceData || {};

  const handlePrint = () => {
    // TODO: Implement print functionality
    window.print();
  };

  const handleCancelInvoice = useCallback(() => {
    setCancelModalOpen(true);
  }, []);

  const handleCancelSuccess = useCallback(() => {
    // Refresh data after successful cancellation
    window.location.reload();
  }, []);


  // Show not found state
  if (!isLoading && !error && !invoice) {
    return (
      <Page
        title="Chi tiết hoá đơn"
        subtitle="Hoá đơn không tồn tại"
        onBack={() => navigate("/sales/list")}
        error={{ message: `Hoá đơn với ID ${id} không tồn tại trong hệ thống` }}
      />
    );
  }

  return (
    <Page
      title="Chi tiết hoá đơn"
      subtitle={`Mã hoá đơn: ${invoice?.invoice_code}`}
      onBack={() => navigate("/sales/list")}
      isLoading={isLoading}
      error={error}
      primaryActions={[
       invoice.status === 'confirmed' &&{
          label: "Hủy hóa đơn",
          icon: <X size={16} />,
          onClick: handleCancelInvoice,
          colorScheme: "red",
        } ,
      ].filter(Boolean)}
    >

        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Invoice Information */}
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  {/* Customer Information */}
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Thông tin khách hàng
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">
                          Họ và tên
                        </Text>
                        <Text>{invoice.customer_name}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">
                          Số điện thoại
                        </Text>
                        <Text>{invoice.customer_phone}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="medium" color="gray.600">
                          Địa chỉ
                        </Text>
                        <Text>{invoice.customer_address || "Không có địa chỉ"}</Text>
                      </Box>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Invoice Information */}
                  <Box>
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
                  </Box>

                  <Divider />

                  {/* Invoice Items */}
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Danh sách sản phẩm
                    </Text>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Sản phẩm</Th>
                            <Th>Phân loại</Th>
                            <Th isNumeric>Số lượng</Th>
                            <Th isNumeric>Đơn giá</Th>
                            <Th isNumeric>Thành tiền</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {invoice.items && invoice.items.length > 0 ? (
                            invoice.items.map((item) => (
                              <Tr key={item.id}>
                                <Td fontWeight="medium">{item.product_name}</Td>
                                <Td>{item.variant_name}</Td>
                                <Td isNumeric>{item.quantity}</Td>
                                <Td isNumeric>
                                  {formatCurrency(item.unit_price)}
                                </Td>
                                <Td isNumeric fontWeight="bold">
                                  {formatCurrency(item.total_price)}
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Tr>
                              <Td colSpan={5} textAlign="center" py={8}>
                                <Text color="gray.500">Không có sản phẩm nào</Text>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Payment Summary */}
                  <Box>
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
                  </Box>

                  {invoice.notes && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontWeight="medium" color="gray.600" mb={2}>
                          Ghi chú
                        </Text>
                        <Text>{invoice.notes}</Text>
                      </Box>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* PDF Viewer */}
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <InvoicePdf
              invoiceId={id}
              invoiceCode={invoice.invoice_code}
            />
          </GridItem>
        </Grid>

        {/* Cancellation Info */}
        {invoice.status === 'cancelled' && (
          <Alert status="error" mt={6}>
            <AlertIcon />
            <Box>
              <AlertTitle>Hóa đơn đã bị hủy</AlertTitle>
              <AlertDescription>
                {invoice.cancellation_reason && (
                  <Text>Lý do: {invoice.cancellation_reason}</Text>
                )}
                <Text fontSize="sm">
                  Hủy lúc: {invoice.cancelled_at && new Date(invoice.cancelled_at).toLocaleString('vi-VN')}
                </Text>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Cancel Invoice Modal */}
        <CancelInvoiceModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          invoice={invoice}
          onSuccess={handleCancelSuccess}
        />
    </Page>
  );
};

export default SalesDetailPage;


