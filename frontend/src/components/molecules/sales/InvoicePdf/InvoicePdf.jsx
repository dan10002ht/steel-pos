import React, { useEffect, useCallback } from 'react';
import { Box, VStack, Text, useToast } from '@chakra-ui/react';

const InvoicePdf = ({ invoiceId, invoiceCode, onLoad, onError }) => {
  const toast = useToast();

  // Logging functions
  const logPDFEvent = useCallback(
    (eventType, details = {}) => {
      const logData = {
        timestamp: new Date().toISOString(),
        invoiceId,
        invoiceCode,
        eventType,
        userAgent: navigator.userAgent,
        ...details,
      };

      console.log('📋 PDF Event:', logData);

      // You can also send to your analytics/logging service here
      // Example: analytics.track('pdf_event', logData);
    },
    [invoiceId, invoiceCode]
  );

  // Get authenticated PDF URL
  const getAuthenticatedPDFUrl = () => {
    const token = localStorage.getItem('accessToken');
    return `http://${import.meta.env.VITE_API_URL}/api/invoices/${invoiceId}/pdf?token=${token}`;
  };

  // Log component mount/unmount
  useEffect(() => {
    logPDFEvent('pdf_component_mounted', {
      source: 'component_mount',
    });

    return () => {
      logPDFEvent('pdf_component_unmounted', {
        source: 'component_unmount',
      });
    };
  }, [logPDFEvent]);

  const handleIframeLoad = () => {
    logPDFEvent('pdf_viewer_loaded', {
      source: 'iframe',
      pdfUrl: getAuthenticatedPDFUrl(),
    });

    if (onLoad) {
      onLoad();
    }
  };

  const handleIframeError = () => {
    logPDFEvent('pdf_viewer_error', {
      source: 'iframe',
      error: 'Failed to load PDF in iframe',
    });

    if (onError) {
      onError();
    }

    toast({
      title: 'Lỗi tải PDF',
      description: 'Không thể hiển thị file PDF',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={4} align='stretch' h='100%'>
      <Box
        border='1px solid'
        borderColor='gray.200'
        borderRadius='md'
        overflow='hidden'
        bg='white'
        flex='1'
        minH='500px'
        position='relative'
      >
        <Box position='relative' w='100%' h='100%'>
          <iframe
            id={`pdf-iframe-${invoiceId}`}
            src={getAuthenticatedPDFUrl()}
            width='100%'
            height='100%'
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
    </VStack>
  );
};

export default InvoicePdf;
