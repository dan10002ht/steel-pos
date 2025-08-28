import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Textarea,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
} from "@chakra-ui/react";
import { Save } from "lucide-react";

const InvoiceSummary = ({
  invoice,
  onUpdateInvoice,
  onCreateInvoice,
  isDisabled = false,
}) => {
  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateFinalAmount = () => {
    const subtotal = calculateSubtotal();
    const discount = invoice.discount || 0;
    return subtotal - discount;
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="bold">
        Thông tin hoá đơn
      </Text>

      <HStack justify="space-between">
        <Text>Hình thức thanh toán:</Text>
        <Select
          value={invoice.paymentMethod || ""}
          onChange={(e) => onUpdateInvoice("paymentMethod", e.target.value)}
          maxW="200px"
        >
          <option value="">Chọn hình thức</option>
          <option value="cash">Tiền mặt</option>
          <option value="bank">Chuyển khoản</option>
          <option value="card">Thẻ tín dụng</option>
        </Select>
      </HStack>

      <Box>
        <Text fontSize="sm" color="gray.600" mb={1}>
          Ghi chú (nội bộ)
        </Text>
        <Textarea
          value={invoice.notes || ""}
          onChange={(e) => onUpdateInvoice("notes", e.target.value)}
          placeholder="Nhập ghi chú nếu cần..."
          rows={3}
        />
      </Box>

      <Divider />

      {/* Payment Summary */}
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <Text>Thành tiền:</Text>
          <Text>{calculateSubtotal().toLocaleString("vi-VN")} VNĐ</Text>
        </HStack>

        <HStack justify="space-between">
          <Text>Giảm giá:</Text>
          <NumberInput
            value={invoice.discount || 0}
            min={0}
            max={calculateSubtotal()}
            onChange={(value) => onUpdateInvoice("discount", parseInt(value))}
            maxW="150px"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>

        <Divider />

        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg">
            Tổng cộng:
          </Text>
          <Text fontWeight="bold" fontSize="lg" color="blue.500">
            {calculateFinalAmount().toLocaleString("vi-VN")} VNĐ
          </Text>
        </HStack>
      </VStack>

      <Button
        leftIcon={<Save size={16} />}
        colorScheme="blue"
        size="lg"
        onClick={onCreateInvoice}
        isDisabled={isDisabled}
      >
        Tạo hoá đơn
      </Button>
    </VStack>
  );
};

export default InvoiceSummary;

