import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Image,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { X, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFetchApi } from '../../hooks/useFetchApi';
import InvoiceAuditLog from '../../components/molecules/sales/InvoiceAuditLog/InvoiceAuditLog';
import Page from '../../components/organisms/Page/Page';
import CancelInvoiceModal from '../../components/molecules/sales/CancelInvoiceModal/CancelInvoiceModal';
import PaymentModal from '../../components/molecules/sales/PaymentModal/PaymentModal';
import PaymentImageUploadModal from '../../components/molecules/sales/PaymentImageUploadModal/PaymentImageUploadModal';
import PaymentImagePreviewModal from '../../components/molecules/sales/PaymentImagePreviewModal/PaymentImagePreviewModal';
import InvoicePdf from '../../components/molecules/sales/InvoicePdf/InvoicePdf';
import { useCreateApi } from '../../hooks/useCreateApi';
import { useInvoicePayments } from '../../hooks/sales/useInvoicePayments';
import CustomerInfoCard from '../../components/molecules/sales/CustomerInfoCard';
import InvoiceInfoCard from '../../components/molecules/sales/InvoiceInfoCard';
import InvoiceItemsTable from '../../components/molecules/sales/InvoiceItemsTable';
import PaymentSummaryCard from '../../components/molecules/sales/PaymentSummaryCard';
import PaymentHistoryTable from '../../components/molecules/sales/PaymentHistoryTable';
import {
  getPaymentStatusColor,
  getPaymentStatusWithRemaining,
} from '@/utils/statusHelpers';

const SalesDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentImageUploadModalOpen, setPaymentImageUploadModalOpen] =
    useState(false);
  const [paymentImagePreviewModalOpen, setPaymentImagePreviewModalOpen] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);

  // Invoice images preview modal
  const {
    isOpen: isInvoiceImageOpen,
    onOpen: onInvoiceImageOpen,
    onClose: onInvoiceImageClose,
  } = useDisclosure();
  const [selectedInvoiceImageIndex, setSelectedInvoiceImageIndex] = useState(0);

  // Fetch invoice data from API
  const {
    data: invoiceData,
    error,
    isPending: isLoading,
    refetch,
  } = useFetchApi(['invoice', id], `/invoices/${id}`, {
    enabled: !!id,
  });
  const invoice = invoiceData || {};

  // Payment hook
  const {
    mutate: createPayment,
    isPending: isPaymentLoading,
    error: paymentError,
  } = useCreateApi('/invoice-payments', {
    invalidateQueries: [
      'invoice',
      'invoices',
      'invoice-payments',
      'audit-logs',
    ],
  });

  // Payment history hook
  const {
    payments,
    isLoading: isPaymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useInvoicePayments(id);

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

  const handlePaymentSubmit = useCallback(
    async paymentData => {
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
    },
    [createPayment, invoice.id, refetch]
  );

  const handlePaymentClose = useCallback(() => {
    setPaymentModalOpen(false);
  }, []);

  const handleUploadPaymentImage = useCallback(payment => {
    setSelectedPayment(payment);
    setPaymentImageUploadModalOpen(true);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    refetchPayments();
    refetch();
  }, [refetchPayments, refetch]);

  const handlePreviewPaymentImages = useCallback((images, initialIndex) => {
    setPreviewImages(images);
    setPreviewInitialIndex(initialIndex);
    setPaymentImagePreviewModalOpen(true);
  }, []);

  // Parse invoice images
  const invoiceImages = React.useMemo(() => {
    if (!invoice.invoice_images) return [];
    try {
      const parsed = JSON.parse(invoice.invoice_images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [invoice.invoice_images]);

  const handleInvoiceImageClick = useCallback(
    index => {
      setSelectedInvoiceImageIndex(index);
      onInvoiceImageOpen();
    },
    [onInvoiceImageOpen]
  );

  const handlePrevInvoiceImage = useCallback(() => {
    setSelectedInvoiceImageIndex(prev =>
      prev > 0 ? prev - 1 : invoiceImages.length - 1
    );
  }, [invoiceImages.length]);

  const handleNextInvoiceImage = useCallback(() => {
    setSelectedInvoiceImageIndex(prev =>
      prev < invoiceImages.length - 1 ? prev + 1 : 0
    );
  }, [invoiceImages.length]);

  // Keyboard navigation for invoice images
  React.useEffect(() => {
    const handleKeyDown = e => {
      if (!isInvoiceImageOpen) return;

      if (e.key === 'ArrowLeft') {
        handlePrevInvoiceImage();
      } else if (e.key === 'ArrowRight') {
        handleNextInvoiceImage();
      } else if (e.key === 'Escape') {
        onInvoiceImageClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isInvoiceImageOpen,
    handlePrevInvoiceImage,
    handleNextInvoiceImage,
    onInvoiceImageClose,
  ]);

  // Show not found state
  if (!isLoading && !error && !invoice) {
    return (
      <Page
        title='Chi tiết hoá đơn'
        subtitle='Hoá đơn không tồn tại'
        onBack={() => navigate('/sales/list')}
        error={{ message: `Hoá đơn với ID ${id} không tồn tại trong hệ thống` }}
      />
    );
  }

  return (
    <Page
      title={
        <HStack align='center'>
          <Text>Chi tiết hoá đơn</Text>
          <Badge
            colorScheme={getPaymentStatusColor(
              invoice.payment_status,
              invoice.status
            )}
            fontSize='xs'
            px={3}
            py={1}
          >
            {getPaymentStatusWithRemaining(invoice)}
          </Badge>
        </HStack>
      }
      subtitle={`Mã hoá đơn: ${invoice?.invoice_code}`}
      onBack={() => navigate('/sales/list')}
      isLoading={isLoading}
      error={error}
      primaryActions={[
        // Payment action - only show if invoice is not fully paid
        invoice.payment_status !== 'paid' &&
          invoice.status !== 'cancelled' && {
            label: 'Trả tiền',
            icon: <CreditCard size={16} />,
            onClick: handlePayment,
            colorScheme: 'green',
          },
        // Cancel action - only show if invoice is confirmed
        invoice.status === 'confirmed' && {
          label: 'Hủy hóa đơn',
          icon: <X size={16} />,
          onClick: handleCancelInvoice,
          colorScheme: 'red',
        },
      ].filter(Boolean)}
    >
      <Grid templateColumns='repeat(12, 1fr)' gap={6}>
        {/* Invoice Information */}
        <GridItem colSpan={{ base: 12, lg: 6 }}>
          <VStack spacing={6} align='stretch'>
            {/* Customer Information */}
            <CustomerInfoCard customer={invoice} />

            {/* Invoice Information */}

            {/* Invoice Images */}
            {invoiceImages.length > 0 && (
              <Card>
                <CardHeader>
                  <Heading size='sm'>Hình ảnh hóa đơn</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
                    {invoiceImages.map((imageUrl, index) => (
                      <Box
                        key={index}
                        position='relative'
                        cursor='pointer'
                        onClick={() => handleInvoiceImageClick(index)}
                        _hover={{
                          transform: 'scale(1.05)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Hình ảnh hóa đơn ${index + 1}`}
                          boxSize='120px'
                          objectFit='cover'
                          borderRadius='md'
                          border='1px solid'
                          borderColor='gray.200'
                          loading='lazy'
                        />
                        <Text
                          fontSize='xs'
                          color='gray.500'
                          mt={1}
                          textAlign='center'
                          noOfLines={1}
                        >
                          Hình {index + 1}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>
            )}

            {/* Invoice Items */}
            <InvoiceItemsTable items={invoice.items} />

            {/* Payment Summary */}
            <PaymentSummaryCard invoice={invoice} />

            {/* Payment History */}
            <PaymentHistoryTable
              payments={payments}
              isLoading={isPaymentsLoading}
              error={paymentsError}
              onUploadImage={handleUploadPaymentImage}
              onPreviewImages={handlePreviewPaymentImages}
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
                <Text fontWeight='medium' color='gray.600' mb={2}>
                  Ghi chú
                </Text>
                <Text>{invoice.notes}</Text>
              </Box>
            )}
          </VStack>
        </GridItem>

        {/* PDF Viewer */}
        <GridItem colSpan={{ base: 12, lg: 6 }}>
          <InvoicePdf invoiceId={id} invoiceCode={invoice.invoice_code} />
        </GridItem>
      </Grid>

      {/* Cancellation Info */}
      {invoice.status === 'cancelled' && (
        <Alert status='error' mt={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Hóa đơn đã bị hủy</AlertTitle>
            <AlertDescription>
              {invoice.cancellation_reason && (
                <Text>Lý do: {invoice.cancellation_reason}</Text>
              )}
              <Text fontSize='sm'>
                Hủy lúc:{' '}
                {invoice.cancelled_at &&
                  new Date(invoice.cancelled_at).toLocaleString('vi-VN')}
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

      {/* Payment Image Upload Modal */}
      <PaymentImageUploadModal
        isOpen={paymentImageUploadModalOpen}
        onClose={() => setPaymentImageUploadModalOpen(false)}
        payment={selectedPayment}
        onSuccess={handleUploadSuccess}
      />

      {/* Payment Image Preview Modal */}
      <PaymentImagePreviewModal
        isOpen={paymentImagePreviewModalOpen}
        onClose={() => setPaymentImagePreviewModalOpen(false)}
        images={previewImages}
        initialIndex={previewInitialIndex}
      />

      {/* Invoice Image Preview Modal */}
      <Modal
        isOpen={isInvoiceImageOpen}
        onClose={onInvoiceImageClose}
        size='full'
        isCentered
      >
        <ModalOverlay bg='blackAlpha.900' />
        <ModalContent bg='transparent' boxShadow='none'>
          <ModalCloseButton
            color='white'
            bg='blackAlpha.600'
            _hover={{ bg: 'blackAlpha.800' }}
            size='lg'
            zIndex={3}
            top={4}
            right={4}
          />

          {/* Image counter */}
          {invoiceImages.length > 1 && (
            <Box
              position='absolute'
              top={4}
              left='50%'
              transform='translateX(-50%)'
              bg='blackAlpha.600'
              color='white'
              px={4}
              py={2}
              borderRadius='md'
              fontSize='sm'
              fontWeight='medium'
              zIndex={3}
            >
              {selectedInvoiceImageIndex + 1} / {invoiceImages.length}
            </Box>
          )}

          <ModalBody
            p={0}
            display='flex'
            justifyContent='center'
            alignItems='center'
            position='relative'
          >
            {/* Previous button */}
            {invoiceImages.length > 1 && (
              <IconButton
                icon={<ChevronLeft size={32} />}
                position='absolute'
                left={4}
                top='50%'
                transform='translateY(-50%)'
                onClick={handlePrevInvoiceImage}
                colorScheme='whiteAlpha'
                bg='blackAlpha.600'
                _hover={{ bg: 'blackAlpha.800' }}
                size='lg'
                borderRadius='full'
                zIndex={2}
                aria-label='Previous image'
              />
            )}

            {/* Image */}
            {invoiceImages[selectedInvoiceImageIndex] && (
              <Image
                src={invoiceImages[selectedInvoiceImageIndex]}
                alt={`Hình ảnh hóa đơn ${selectedInvoiceImageIndex + 1}`}
                maxH='90vh'
                maxW='90vw'
                objectFit='contain'
                borderRadius='md'
              />
            )}

            {/* Next button */}
            {invoiceImages.length > 1 && (
              <IconButton
                icon={<ChevronRight size={32} />}
                position='absolute'
                right={4}
                top='50%'
                transform='translateY(-50%)'
                onClick={handleNextInvoiceImage}
                colorScheme='whiteAlpha'
                bg='blackAlpha.600'
                _hover={{ bg: 'blackAlpha.800' }}
                size='lg'
                borderRadius='full'
                zIndex={2}
                aria-label='Next image'
              />
            )}

            {/* Bottom navigation hint */}
            {invoiceImages.length > 1 && (
              <Box
                position='absolute'
                bottom={4}
                left='50%'
                transform='translateX(-50%)'
                bg='blackAlpha.600'
                color='white'
                px={4}
                py={2}
                borderRadius='md'
                fontSize='xs'
                zIndex={3}
              >
                Dùng phím ← → để chuyển ảnh
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Page>
  );
};

export default SalesDetailPage;
