import React, { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { Printer, Download, ArrowLeft } from "lucide-react";
import { useFetchApi } from "../../hooks/useFetchApi";
import Page from "../../components/organisms/Page/Page";

const InvoicePrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch invoice data for title
  const { data: invoiceData, error, isPending: isLoading } = useFetchApi(
    ['invoice', id],
    `/invoices/${id}`,
    {
      enabled: !!id,
    }
  );

  const invoice = invoiceData || {};

  // Logging functions
  const logPrintEvent = useCallback((eventType, details = {}) => {
    const logData = {
      timestamp: new Date().toISOString(),
      invoiceId: id,
      invoiceCode: invoice.invoice_code,
      eventType,
      userAgent: navigator.userAgent,
      ...details
    };
    
    console.log('📄 Print Event:', logData);
    
    // You can also send to your analytics/logging service here
    // Example: analytics.track('invoice_print_event', logData);
  }, [id, invoice.invoice_code]);

  const logPDFEvent = useCallback((eventType, details = {}) => {
    const logData = {
      timestamp: new Date().toISOString(),
      invoiceId: id,
      invoiceCode: invoice.invoice_code,
      eventType,
      userAgent: navigator.userAgent,
      ...details
    };
    
    console.log('📋 PDF Event:', logData);
    
    // You can also send to your analytics/logging service here
    // Example: analytics.track('pdf_event', logData);
  }, [id, invoice.invoice_code]);

  // Log page visit
  useEffect(() => {
    logPDFEvent('page_visited', {
      source: 'component_mount'
    });

    return () => {
      logPDFEvent('page_left', {
        source: 'component_unmount'
      });
    };
  }, [id, invoice.invoice_code, logPDFEvent]);

  // Add event listeners for print events
  useEffect(() => {
    const handleBeforePrint = () => {
      logPrintEvent('beforeprint', {
        source: 'window_beforeprint'
      });
    };

    const handleAfterPrint = () => {
      logPrintEvent('afterprint', {
        source: 'window_afterprint'
      });
    };

    const handlePrintDialog = () => {
      logPrintEvent('print_dialog_opened', {
        source: 'keyboard_shortcut'
      });
    };

    // Listen for print events
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Listen for Ctrl+P / Cmd+P
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        handlePrintDialog();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id, invoice.invoice_code, logPrintEvent]);

  const handlePrint = () => {
    logPrintEvent('print_button_clicked', {
      source: 'print_button'
    });
    // Open PDF in new window for printing
    const token = localStorage.getItem('accessToken');
    const printUrl = `http://localhost:8080/api/invoices/${id}/pdf?token=${token}`;
    const printWindow = window.open(printUrl, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        logPrintEvent('print_window_opened', {
          source: 'print_button',
          printUrl: printUrl
        });
        printWindow.print();
      };
      
      printWindow.onerror = () => {
        logPrintEvent('print_window_error', {
          source: 'print_button',
          error: 'Failed to open print window'
        });
      };
    } else {
      logPrintEvent('print_window_blocked', {
        source: 'print_button',
        error: 'Print window was blocked by popup blocker'
      });
    }
  };

  const handleDownload = async () => {
    logPDFEvent('download_started', {
      source: 'download_button'
    });
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/invoices/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_code || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      logPDFEvent('download_completed', {
        source: 'download_button',
        fileSize: blob.size,
        fileName: `invoice-${invoice.invoice_code || id}.pdf`
      });
      
      toast({
        title: "Tải PDF thành công",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      logPDFEvent('download_failed', {
        source: 'download_button',
        error: error.message
      });
      
      toast({
        title: "Lỗi tải PDF",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Get authenticated PDF URL
  const getAuthenticatedPDFUrl = () => {
    const token = localStorage.getItem('accessToken');
    return `http://localhost:8080/api/invoices/${id}/pdf?token=${token}`;
  };

  // Show not found state
  if (!isLoading && !error && !invoice.invoice_code) {
    return (
      <Page
        title="In hoá đơn"
        subtitle="Hoá đơn không tồn tại"
        onBack={() => navigate(-1)}
        error={{ message: `Hoá đơn với ID ${id} không tồn tại trong hệ thống` }}
      />
    );
  }

  return (
    <Page
      title="In hoá đơn"
      subtitle={invoice.invoice_code ? `Mã hoá đơn: ${invoice.invoice_code}` : "Đang tải..."}
      onBack={() => navigate(-1)}
      isLoading={isLoading}
      error={error}
      primaryActions={[
        {
          label: "In",
          icon: <Printer size={16} />,
          onClick: handlePrint,
        },
        {
          label: "Tải PDF",
          icon: <Download size={16} />,
          onClick: handleDownload,
        },
      ]}
    >
      <VStack spacing={4} align="stretch">
        {/* PDF Viewer */}
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          overflow="hidden"
          bg="white"
          minH="600px"
        >
          {isLoading ? (
            <VStack spacing={4} align="center" justify="center" minH="600px">
              <Spinner size="xl" color="blue.500" />
              <Text color="gray.500">Đang tải PDF...</Text>
            </VStack>
          ) : error ? (
            <VStack spacing={4} align="center" justify="center" minH="600px" p={6}>
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Không thể tải PDF!</AlertTitle>
                  <AlertDescription>
                    {error.message || "Đã xảy ra lỗi khi tải file PDF"}
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
                 ) : (
                   <Box position="relative" w="100%" h="600px">
                     <iframe
                       id="pdf-iframe"
                       src={getAuthenticatedPDFUrl()}
                       width="100%"
                       height="100%"
                       style={{
                         overflowX: 'hidden',
                         border: 'none',
                         borderRadius: '6px',
                       }}
                       title={`PDF Invoice ${invoice.invoice_code || id}`}
                       onLoad={() => {
                         logPDFEvent('pdf_viewer_loaded', {
                           source: 'iframe',
                           pdfUrl: getAuthenticatedPDFUrl()
                         });
                       }}
                       onError={() => {
                         logPDFEvent('pdf_viewer_error', {
                           source: 'iframe',
                           error: 'Failed to load PDF in iframe'
                         });
                         
                         toast({
                           title: "Lỗi tải PDF",
                           description: "Không thể hiển thị file PDF",
                           status: "error",
                           duration: 5000,
                           isClosable: true,
                         });
                       }}
                     />
                   </Box>
                 )}
        </Box>

        {/* Print Instructions */}
        <Box
          bg="blue.50"
          border="1px solid"
          borderColor="blue.200"
          borderRadius="md"
          p={4}
        >
          <VStack spacing={2} align="flex-start">
            <Text fontWeight="medium" color="blue.700">
              💡 Hướng dẫn in hoá đơn:
            </Text>
            <Text fontSize="sm" color="blue.600">
              • Nhấn nút "In" để mở cửa sổ in mới
            </Text>
            <Text fontSize="sm" color="blue.600">
              • Chọn máy in và cài đặt phù hợp (A5, Portrait)
            </Text>
            <Text fontSize="sm" color="blue.600">
              • Nhấn "Tải PDF" để tải file về máy tính
            </Text>
            <Text fontSize="sm" color="blue.600">
              • PDF hiển thị trong iframe để preview
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Page>
  );
};

export default InvoicePrintPage;
