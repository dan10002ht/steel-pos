import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  VStack,
  Box,
  Text,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { X, CreditCard } from "lucide-react";
import { useFetchApi } from "../../hooks/useFetchApi";
import InvoiceAuditLog from "../../components/molecules/sales/InvoiceAuditLog/InvoiceAuditLog";
import Page from "../../components/organisms/Page/Page";
import CancelInvoiceModal from "../../components/molecules/sales/CancelInvoiceModal/CancelInvoiceModal";
import PaymentModal from "../../components/molecules/sales/PaymentModal/PaymentModal";
import InvoicePdf from "../../components/molecules/sales/InvoicePdf/InvoicePdf";
import { useCreateApi } from "../../hooks/useCreateApi";
import { useInvoicePayments } from "../../hooks/sales/useInvoicePayments";

// Atomic Components
import CustomerInfoCard from "../../components/molecules/sales/CustomerInfoCard";
import InvoiceInfoCard from "../../components/molecules/sales/InvoiceInfoCard";
import InvoiceItemsTable from "../../components/molecules/sales/InvoiceItemsTable";
import PaymentSummaryCard from "../../components/molecules/sales/PaymentSummaryCard";
import PaymentHistoryTable from "../../components/molecules/sales/PaymentHistoryTable";

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
  const { data: auditLogsData } = useFetchApi(
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
          <VStack spacing={6} align="stretch">
            {/* Customer Information */}
            <CustomerInfoCard customer={invoice} />

            {/* Invoice Information */}
            <InvoiceInfoCard invoice={invoice} />

            {/* Invoice Items */}
            <InvoiceItemsTable items={invoice.items} />

            {/* Payment Summary */}
            <PaymentSummaryCard invoice={invoice} />

            {/* Payment History */}
            <PaymentHistoryTable 
              payments={payments}
              isLoading={isPaymentsLoading}
              error={paymentsError}
            />

            {/* Audit Logs */}
            <InvoiceAuditLog 
              invoiceId={id}
              auditLogs={auditLogs}
              showDetailedLog={false}
            />

            {/* Notes */}
            {invoice.notes && (
              <Box>
                <Text fontWeight="medium" color="gray.600" mb={2}>
                  Ghi chú
                </Text>
                <Text>{invoice.notes}</Text>
              </Box>
            )}
          </VStack>
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