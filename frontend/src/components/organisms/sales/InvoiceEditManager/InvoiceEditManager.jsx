import React from "react";
import {
  Box,
  Grid,
  GridItem,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import ProductVariantsSearch from "@/components/molecules/sales/ProductVariantsSearch";
import InvoiceForm from "@/components/organisms/sales/InvoiceForm";
import InvoiceAuditLog from "@/components/molecules/sales/InvoiceAuditLog";
import { useAuditLog } from "@/hooks/useAuditLog";

const InvoiceEditManager = ({ 
  invoice, 
  onUpdate, 
  onInvoiceUpdated,
  isEditMode = true 
}) => {
  // Fetch audit logs
  const {
    data: auditLogs,
    isLoading: auditLogsLoading,
    error: auditLogsError,
  } = useAuditLog(invoice?.id, {
    enabled: isEditMode && !!invoice?.id,
  });

  if (!invoice) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">Đang tải dữ liệu hóa đơn...</Text>
      </Box>
    );
  }

  if (auditLogsLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (auditLogsError) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Không thể tải lịch sử thay đổi</AlertTitle>
        <AlertDescription>
          {auditLogsError.message || "Có lỗi xảy ra khi tải audit log"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={6} h="calc(100vh - 200px)">
      {/* Left Panel - Product Search + Audit Log */}
      <GridItem colSpan={{ base: 12, lg: 5 }}>
        <VStack spacing={6} align="stretch" h="full">
          {/* Product Search */}
          <Box flex="0 0 auto">
            <ProductVariantsSearch
              invoice={invoice}
              onUpdate={onUpdate}
            />
          </Box>

          {/* Audit Log */}
          <Box flex="1" minH="0">
            <InvoiceAuditLog
              invoiceId={invoice?.id}
              auditLogs={auditLogs || []}
            />
          </Box>
        </VStack>
      </GridItem>

      {/* Right Panel - Invoice Form */}
      <GridItem colSpan={{ base: 12, lg: 7 }}>
        <InvoiceForm
          invoice={invoice}
          onUpdate={onUpdate}
          onInvoiceCreated={onInvoiceUpdated}
          isEditMode={isEditMode}
        />
      </GridItem>
    </Grid>
  );
};

export default InvoiceEditManager;
