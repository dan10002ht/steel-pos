import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Grid,
  GridItem,
  Box,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { formatCurrency } from "@/utils";

const InvoiceComparisonModal = ({ isOpen, onClose, auditLog }) => {
  if (!auditLog || !auditLog.old_data || !auditLog.new_data) {
    return null;
  }

  const oldData = auditLog.old_data;
  const newData = auditLog.new_data;

  const renderFieldComparison = (field, label, formatter = null) => {
    const oldValue = oldData[field];
    const newValue = newData[field];
    
    if (oldValue === newValue) return null;

    const displayOldValue = formatter ? formatter(oldValue) : oldValue;
    const displayNewValue = formatter ? formatter(newValue) : newValue;

    return (
      <HStack justify="space-between" key={field}>
        <Text fontWeight="medium" fontSize="sm">
          {label}:
        </Text>
        <HStack spacing={2}>
          <Badge colorScheme="red" variant="outline">
            {displayOldValue || "Trống"}
          </Badge>
          <Text>→</Text>
          <Badge colorScheme="green" variant="outline">
            {displayNewValue || "Trống"}
          </Badge>
        </HStack>
      </HStack>
    );
  };

  const renderItemsComparison = () => {
    const oldItems = oldData.items || [];
    const newItems = newData.items || [];

    if (oldItems.length === 0 && newItems.length === 0) return null;

    return (
      <Box>
        <Text fontWeight="bold" mb={3}>
          Thay đổi sản phẩm:
        </Text>
        <VStack spacing={2} align="stretch">
          {oldItems.map((oldItem, index) => {
            const newItem = newItems.find(item => item.product_id === oldItem.product_id);
            
            if (!newItem) {
              // Item bị xóa
              return (
                <Box key={index} p={2} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium">
                      {oldItem.product_name} - {oldItem.variant_name}
                    </Text>
                    <Badge colorScheme="red">Đã xóa</Badge>
                  </HStack>
                </Box>
              );
            }

            // So sánh các trường của item
            const changes = [];
            if (oldItem.quantity !== newItem.quantity) {
              changes.push(`Số lượng: ${oldItem.quantity} → ${newItem.quantity}`);
            }
            if (oldItem.unit_price !== newItem.unit_price) {
              changes.push(`Đơn giá: ${formatCurrency(oldItem.unit_price)} → ${formatCurrency(newItem.unit_price)}`);
            }

            if (changes.length === 0) return null;

            return (
              <Box key={index} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                <Text fontSize="sm" fontWeight="medium" mb={1}>
                  {oldItem.product_name} - {oldItem.variant_name}
                </Text>
                <VStack spacing={1} align="stretch">
                  {changes.map((change, changeIndex) => (
                    <Text key={changeIndex} fontSize="xs" color="blue.700">
                      {change}
                    </Text>
                  ))}
                </VStack>
              </Box>
            );
          })}

          {newItems.map((newItem, index) => {
            const oldItem = oldItems.find(item => item.product_id === newItem.product_id);
            
            if (!oldItem) {
              // Item mới được thêm
              return (
                <Box key={index} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium">
                      {newItem.product_name} - {newItem.variant_name}
                    </Text>
                    <Badge colorScheme="green">Mới thêm</Badge>
                  </HStack>
                </Box>
              );
            }
            return null;
          })}
        </VStack>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack>
            <Text>So sánh thay đổi hóa đơn</Text>
            <Badge colorScheme="blue">
              {new Date(auditLog.created_at).toLocaleString('vi-VN')}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* Thông tin cơ bản */}
            <GridItem colSpan={2}>
              <Card>
                <CardHeader>
                  <Text fontWeight="bold">Thay đổi thông tin cơ bản</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {renderFieldComparison('customer_name', 'Tên khách hàng')}
                    {renderFieldComparison('customer_phone', 'Số điện thoại')}
                    {renderFieldComparison('customer_address', 'Địa chỉ')}
                    {renderFieldComparison('discount_amount', 'Giảm giá', formatCurrency)}
                    {renderFieldComparison('payment_method', 'Phương thức thanh toán')}
                    {renderFieldComparison('paid_amount', 'Số tiền đã trả', formatCurrency)}
                    {renderFieldComparison('notes', 'Ghi chú')}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            {/* Thay đổi sản phẩm */}
            <GridItem colSpan={2}>
              {renderItemsComparison()}
            </GridItem>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvoiceComparisonModal;
