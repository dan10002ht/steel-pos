import React from "react";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Text,
  Badge,
} from "@chakra-ui/react";
import { Trash2 } from "lucide-react";

const VariantForm = ({
  variant,
  index,
  errors = {},
  onChange,
  onRemove,
  canRemove = true,
  defaultUnit = "",
  isReadOnly = false,
}) => {
  // Check if variant is marked for deletion
  const isDeleted = variant.isDeleted;
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <Box
      border="1px"
      borderColor={isDeleted ? "red.200" : "gray.200"}
      borderRadius="md"
      p={4}
      bg={isDeleted ? "red.50" : "gray.50"}
      position="relative"
      opacity={isDeleted ? 0.6 : 1}
    >
      {/* Variant Header */}
      <HStack justify="space-between" align="center" mb={4}>
        <HStack spacing={2}>
          <Badge colorScheme="blue" variant="subtle">
            Variant {index + 1}
          </Badge>
          {index === 0 && (
            <Badge colorScheme="green" variant="subtle">
              Mặc định
            </Badge>
          )}
          {isDeleted && (
            <Badge colorScheme="red" variant="subtle">
              Sẽ xóa
            </Badge>
          )}
        </HStack>
        {canRemove && !isReadOnly && (
          <Button
            size="sm"
            variant="ghost"
            colorScheme={isDeleted ? "green" : "red"}
            onClick={onRemove}
            leftIcon={<Trash2 size={14} />}
          >
            {isDeleted ? "Khôi phục" : "Xóa"}
          </Button>
        )}
      </HStack>

      <VStack spacing={4} align="stretch">
        {/* Variant Name and SKU */}
        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.name} isRequired>
            <FormLabel>Tên variant</FormLabel>
            <Input
              value={variant.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: Đỏ, XL, 100g"
              isReadOnly={isReadOnly || isDeleted}
              bg={isReadOnly || isDeleted ? "gray.50" : "white"}
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.sku} isRequired>
            <FormLabel>Mã SKU</FormLabel>
            <Input
              value={variant.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
              placeholder="Mã sản phẩm"
              isReadOnly={isReadOnly || isDeleted}
              bg={isReadOnly || isDeleted ? "gray.50" : "white"}
              fontFamily={isReadOnly || isDeleted ? "mono" : "inherit"}
            />
            <FormErrorMessage>{errors.sku}</FormErrorMessage>
          </FormControl>
        </HStack>

        {/* Stock and Price */}
        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.stock} isRequired>
            <FormLabel>Số lượng tồn kho</FormLabel>
            {isReadOnly || isDeleted ? (
              <Input value={variant.stock} isReadOnly bg="gray.50" />
            ) : (
              <NumberInput
                value={variant.stock}
                onChange={(value) => handleChange("stock", Number(value))}
                min={0}
                precision={0}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            )}
            <FormErrorMessage>{errors.stock}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.price} isRequired>
            <FormLabel>Giá tiền (VNĐ)</FormLabel>
            {isReadOnly || isDeleted ? (
              <Input
                value={variant.price}
                isReadOnly
                bg="gray.50"
                color="blue.600"
                fontWeight="medium"
              />
            ) : (
              <NumberInput
                value={variant.price}
                onChange={(value) => handleChange("price", Number(value))}
                min={0}
                precision={0}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            )}
            <FormErrorMessage>{errors.price}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.unit} isRequired>
            <FormLabel>Đơn vị</FormLabel>
            <Input
              value={variant.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
              placeholder={defaultUnit || "VD: cái, kg, m"}
              isReadOnly={isReadOnly || isDeleted}
              bg={isReadOnly || isDeleted ? "gray.50" : "white"}
            />
            <FormErrorMessage>{errors.unit}</FormErrorMessage>
          </FormControl>
        </HStack>

        {/* Sold Quantity - Only show in read-only mode */}
        {isReadOnly && (
          <FormControl>
            <FormLabel>Số lượng đã bán</FormLabel>
            <Input value={variant.sold || 0} isReadOnly bg="gray.50" />
          </FormControl>
        )}
      </VStack>
    </Box>
  );
};

export default VariantForm;
