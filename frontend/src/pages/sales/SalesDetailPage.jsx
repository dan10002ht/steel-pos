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
import { Printer, Mail, Edit, X, CreditCard, User, Clock, AlertCircle, CheckCircle, XCircle, Plus, Minus } from "lucide-react";
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
import PaymentModal from "../../components/molecules/sales/PaymentModal/PaymentModal";
import InvoicePdf from "../../components/molecules/sales/InvoicePdf/InvoicePdf";
import { useCreateApi } from "../../hooks/useCreateApi";
import { useInvoicePayments } from "../../hooks/sales/useInvoicePayments";

const SalesDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Fetch invoice data from API
  const { data: invoiceData, error, isPending: isLoading, refetch } = useFetchApi(
    ['invoice', id],
    `/invoices/${id}`,
    {
      enabled: !!id,
    }
  );
  const invoice = invoiceData || {};

  // Payment hook
  const { mutate: createPayment, isPending: isPaymentLoading, error: paymentError } = useCreateApi('/invoice-payments', {
    invalidateQueries: ['invoice', 'invoices', 'invoice-payments', 'audit-logs']
  });

  // Payment history hook
  const { payments, isLoading: isPaymentsLoading, error: paymentsError } = useInvoicePayments(id);

  // Audit logs hook
  const { data: auditLogsData, isLoading: isAuditLogsLoading, error: auditLogsError } = useFetchApi(
    ['audit-logs', 'invoice', id],
    `/invoices/${id}/audit-logs`,
    {
      enabled: !!id,
    }
  );
  const auditLogs = auditLogsData || [];


  const handleCancelInvoice = useCallback(() => {
    setCancelModalOpen(true);
  }, []);

  const handleCancelSuccess = useCallback(() => {
    // Refresh data after successful cancellation
    window.location.reload();
  }, []);

  const handlePayment = useCallback(() => {
    setPaymentModalOpen(true);
  }, []);

  const handlePaymentSubmit = useCallback(async (paymentData) => {
    try {
      await createPayment({
        url: `/invoice-payments/${invoice.id}`,
        data: paymentData,
      });
      setPaymentModalOpen(false);
      refetch(); // Refresh data after successful payment
    } catch (error) {
      console.error('Payment error:', error);
    }
  }, [createPayment, invoice.id, refetch]);

  const handlePaymentClose = useCallback(() => {
    setPaymentModalOpen(false);
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
        // Payment action - only show if invoice is not fully paid
        invoice.payment_status !== 'paid' && invoice.status !== 'cancelled' && {
          label: "Trả tiền",
          icon: <CreditCard size={16} />,
          onClick: handlePayment,
          colorScheme: "green",
        },
        // Cancel action - only show if invoice is confirmed
        invoice.status === 'confirmed' && {
          label: "Hủy hóa đơn",
          icon: <X size={16} />,
          onClick: handleCancelInvoice,
          colorScheme: "red",
        },
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

                  <Divider />

                  {/* Payment History */}
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Lịch sử thanh toán
                    </Text>
                    {isPaymentsLoading ? (
                      <Text color="gray.500">Đang tải lịch sử thanh toán...</Text>
                    ) : paymentsError ? (
                      <Text color="red.500">Lỗi tải lịch sử thanh toán: {paymentsError.message}</Text>
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
                                    {payment.payment_method === 'cash' && 'Tiền mặt'}
                                    {payment.payment_method === 'card' && 'Thẻ'}
                                    {payment.payment_method === 'bank_transfer' && 'Chuyển khoản'}
                                    {payment.payment_method === 'credit' && 'Ghi nợ'}
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
                  </Box>

                  <Divider />

                  {/* Audit Logs */}
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Lịch sử hoạt động
                    </Text>
                    {isAuditLogsLoading ? (
                      <Text color="gray.500">Đang tải lịch sử hoạt động...</Text>
                    ) : auditLogsError ? (
                      <Text color="red.500">Lỗi tải lịch sử hoạt động: {auditLogsError.message}</Text>
                    ) : auditLogs && auditLogs.length > 0 ? (
                      <VStack spacing={3} align="stretch">
                        {auditLogs.map((log) => (
                          <Box key={log.id} p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
                            <HStack justify="space-between" align="start" mb={2}>
                              <HStack spacing={3}>
                                {log.action === 'created' && <CheckCircle size={16} color="green" />}
                                {log.action === 'updated' && <Edit size={16} color="blue" />}
                                {log.action === 'cancelled' && <XCircle size={16} color="red" />}
                                {log.action === 'payment_created' && <Plus size={16} color="green" />}
                                {log.action === 'payment_updated' && <Edit size={16} color="blue" />}
                                {log.action === 'payment_deleted' && <Minus size={16} color="red" />}
                                {!['created', 'updated', 'cancelled', 'payment_created', 'payment_updated', 'payment_deleted'].includes(log.action) && 
                                  <AlertCircle size={16} color="gray" />}
                                <Text fontWeight="bold" fontSize="sm">
                                  {log.display_text || `${log.user_name || log.created_by_name || 'Hệ thống'} thực hiện ${log.action} vào ${new Date(log.created_at).toLocaleString("vi-VN")}`}
                                </Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Clock size={14} color="gray" />
                                <Text fontSize="sm" color="gray.600">
                                  {new Date(log.created_at).toLocaleString("vi-VN")}
                                </Text>
                              </HStack>
                            </HStack>

                            {log.changes_summary && (
                              <Text fontSize="sm" color="gray.700" mb={2}>
                                {log.changes_summary}
                              </Text>
                            )}

                            {log.action === 'payment_created' && log.new_data && (
                              <Box p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                                <Text fontSize="sm" fontWeight="medium" color="green.700">
                                  Thanh toán: {formatCurrency(log.new_data.amount || 0)} - {log.new_data.payment_method === 'cash' && 'Tiền mặt'}
                                  {log.new_data.payment_method === 'card' && 'Thẻ'}
                                  {log.new_data.payment_method === 'bank_transfer' && 'Chuyển khoản'}
                                  {log.new_data.payment_method === 'credit' && 'Ghi nợ'}
                                </Text>
                                {log.new_data.notes && (
                                  <Text fontSize="xs" color="green.600" mt={1}>
                                    Ghi chú: {log.new_data.notes}
                                  </Text>
                                )}
                              </Box>
                            )}

                            {log.action === 'cancelled' && log.new_data && (
                              <Box p={2} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                                <Text fontSize="sm" fontWeight="medium" color="red.700">
                                  Lý do hủy: {log.new_data.cancellation_reason || 'Không có lý do'}
                                </Text>
                              </Box>
                            )}

                            {log.notes && (
                              <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                {log.notes}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text color="gray.500">Chưa có lịch sử hoạt động</Text>
                    )}
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

        {/* Payment Modal */}
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={handlePaymentClose}
          invoice={invoice}
          onSubmit={handlePaymentSubmit}
          isLoading={isPaymentLoading}
          error={paymentError}
        />
    </Page>
  );
};

export default SalesDetailPage;


