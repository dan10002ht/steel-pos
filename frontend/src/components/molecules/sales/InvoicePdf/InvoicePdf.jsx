import React, { useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";

const InvoicePdf = ({ invoiceId, invoiceCode, onLoad, onError }) => {
  const toast = useToast();

  // Logging functions
  const logPDFEvent = useCallback((eventType, details = {}) => {
    const logData = {
      timestamp: new Date().toISOString(),
      invoiceId,
      invoiceCode,
      eventType,
      userAgent: navigator.userAgent,
      ...details
    };
    
    console.log('📋 PDF Event:', logData);
    
    // You can also send to your analytics/logging service here
    // Example: analytics.track('pdf_event', logData);
  }, [invoiceId, invoiceCode]);

  // Get authenticated PDF URL
  const getAuthenticatedPDFUrl = () => {
    const token = localStorage.getItem('accessToken');
    return `http://localhost:8080/api/invoices/${invoiceId}/pdf?token=${token}`;
  };

  // Log component mount/unmount
  useEffect(() => {
    logPDFEvent('pdf_component_mounted', {
      source: 'component_mount'
    });

    return () => {
      logPDFEvent('pdf_component_unmounted', {
        source: 'component_unmount'
      });
    };
  }, [logPDFEvent]);

  const handleIframeLoad = () => {
    logPDFEvent('pdf_viewer_loaded', {
      source: 'iframe',
      pdfUrl: getAuthenticatedPDFUrl()
    });
    
    if (onLoad) {
      onLoad();
    }
  };

  const handleIframeError = () => {
    logPDFEvent('pdf_viewer_error', {
      source: 'iframe',
      error: 'Failed to load PDF in iframe'
    });
    
    if (onError) {
      onError();
    }
    
    toast({
      title: "Lỗi tải PDF",
      description: "Không thể hiển thị file PDF",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={4} align="stretch" h="100%">
      <Text fontSize="lg" fontWeight="bold">
        Xem trước PDF
      </Text>
      
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        overflow="hidden"
        bg="white"
        flex="1"
        minH="500px"
        position="relative"
      >
        <Box position="relative" w="100%" h="100%">
          <iframe
            id={`pdf-iframe-${invoiceId}`}
            src={getAuthenticatedPDFUrl()}
            width="100%"
            height="100%"
            style={{
              overflowX: 'hidden',
              border: 'none',
              borderRadius: '6px',
            }}
            title={`PDF Invoice ${invoiceCode || invoiceId}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </Box>
      </Box>

      {/* PDF Instructions */}
      <Box
        bg="blue.50"
        border="1px solid"
        borderColor="blue.200"
        borderRadius="md"
        p={3}
      >
        <VStack spacing={1} align="flex-start">
          <Text fontWeight="medium" color="blue.700" fontSize="sm">
            💡 Hướng dẫn:
          </Text>
          <Text fontSize="xs" color="blue.600">
            • PDF hiển thị trực tiếp trong trang
          </Text>
          <Text fontSize="xs" color="blue.600">
            • Sử dụng nút "In hoá đơn" để in
          </Text>
          <Text fontSize="xs" color="blue.600">
            • Cuộn để xem toàn bộ nội dung
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
};

export default InvoicePdf;
