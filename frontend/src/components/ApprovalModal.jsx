import React, { useState } from "react";
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
  Input,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";

const ApprovalModal = ({ isOpen, onClose, order, onApproved }) => {
  const [approvalNote, setApprovalNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!approvalNote.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập ghi chú phê duyệt",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onApproved(order.id, approvalNote);

      toast({
        title: "Thành công",
        description: "Đơn nhập hàng đã được phê duyệt",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi phê duyệt",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setApprovalNote("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Phê duyệt đơn nhập hàng</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              <strong>Mã đơn:</strong> {order?.importCode}
            </Text>
            <Text>
              <strong>Nhà cung cấp:</strong> {order?.supplier}
            </Text>
            <Text>
              <strong>Tổng giá trị:</strong>{" "}
              {order && formatCurrency(order.totalValue)}
            </Text>
            <Text>
              <strong>Số lượng sản phẩm:</strong> {order?.productCount}
            </Text>
            <FormControl>
              <FormLabel>Ghi chú phê duyệt *</FormLabel>
              <Input
                placeholder="Nhập ghi chú phê duyệt..."
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            isDisabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Đang phê duyệt..."
          >
            Phê duyệt
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApprovalModal;
