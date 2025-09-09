import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { Trash2 } from "lucide-react";

const InvoiceItemList = ({ items, onUpdateItem, onRemoveItem }) => {
  const toast = useToast();

  const handleUpdateItem = (itemId, field, value) => {
    onUpdateItem(itemId, field, value);
  };

  const handleRemoveItem = (itemId) => {
    onRemoveItem(itemId);
  };

  if (items.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">
          Chưa có sản phẩm nào. Vui lòng tìm kiếm và thêm sản phẩm từ bên trái.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      {items.map((item) => (
        <Box
          key={item.id}
          p={4}
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
        >
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <VStack align="flex-start" spacing={1}>
                <Text fontWeight="bold">{item.productName}</Text>
                <Text fontSize="sm" color="gray.600">
                  {item.variantName}
                </Text>
              </VStack>
              <IconButton
                size="sm"
                icon={<Trash2 size={16} />}
                onClick={() => handleRemoveItem(item.id)}
                colorScheme="red"
                variant="ghost"
              />
            </HStack>

            <HStack spacing={4}>
              <Box flex={1}>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Số lượng
                </Text>
                <NumberInput
                  value={item.quantity}
                  min={1}
                  max={item.stock}
                  onChange={(value) =>
                    handleUpdateItem(item.id, "quantity", parseInt(value))
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500">
                  Tồn kho: {item.stock}
                </Text>
              </Box>

              <Box flex={1}>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Đơn giá (VNĐ)
                </Text>
                <NumberInput
                  value={item.unitPrice}
                  min={0}
                  onChange={(value) =>
                    handleUpdateItem(item.id, "unitPrice", parseInt(value))
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>

              <Box flex={1}>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Thành tiền
                </Text>
                <Text fontWeight="bold" fontSize="lg">
                  {item.totalPrice.toLocaleString("vi-VN")} VNĐ
                </Text>
              </Box>
            </HStack>
          </VStack>
        </Box>
      ))}
    </VStack>
  );
};

export default InvoiceItemList;


