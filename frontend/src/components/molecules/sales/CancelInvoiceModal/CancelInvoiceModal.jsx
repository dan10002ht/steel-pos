import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useEditApi } from '@/hooks/useEditApi';

const CancelInvoiceModal = ({ isOpen, onClose, invoice, onSuccess }) => {
  const [reason, setReason] = useState('');

  const cancelInvoiceMutation = useEditApi(`/invoices/${invoice?.id}/cancel`, {
    onSuccess: () => {
      onSuccess?.();
      onClose();
      setReason('');
    },
    onError: (error) => {
      console.error('Error cancelling invoice:', error);
    },
  });

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    cancelInvoiceMutation.mutate({ data: { reason: reason.trim() } });
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Hủy hóa đơn</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="warning">
              <AlertIcon />
              <AlertTitle>Xác nhận hủy hóa đơn!</AlertTitle>
              <AlertDescription>
                Hành động này sẽ hủy hóa đơn và khôi phục lại số lượng hàng tồn kho.
                Bạn có chắc chắn muốn tiếp tục?
              </AlertDescription>
            </Alert>

            <Text>
              <strong>Mã hóa đơn:</strong> {invoice?.invoice_code}
            </Text>
            <Text>
              <strong>Khách hàng:</strong> {invoice?.customer_name}
            </Text>
            <Text>
              <strong>Tổng tiền:</strong> {invoice?.total_amount?.toLocaleString('vi-VN')} VNĐ
            </Text>

            <FormControl isRequired>
              <FormLabel>Lý do hủy hóa đơn</FormLabel>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do hủy hóa đơn..."
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Hủy
          </Button>
          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isLoading={cancelInvoiceMutation.isPending}
            loadingText="Đang hủy..."
            isDisabled={!reason.trim()}
          >
            Xác nhận hủy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CancelInvoiceModal;
