import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { Package } from "lucide-react";
import {
  formatCurrencyRange,
  calculateTotalStock,
} from "../../../features/products/data/mockProducts";

const ProductCard = ({ product, onClick, ...props }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const totalStock = calculateTotalStock(product);
  const priceRange = formatCurrencyRange(product);

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: "red", text: "Hết hàng" };
    if (stock < 10) return { color: "orange", text: "Sắp hết" };
    return { color: "green", text: "Còn hàng" };
  };

  const stockStatus = getStockStatus(totalStock);

  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      cursor={onClick ? "pointer" : "default"}
      _hover={onClick ? { shadow: "md", transform: "translateY(-2px)" } : {}}
      transition="all 0.2s"
      onClick={onClick}
      {...props}
    >
      <VStack spacing={3} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" spacing={1} flex={1}>
            <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
              {product.name}
            </Text>
            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
              {product.category}
            </Badge>
          </VStack>
          <Icon as={Package} color="blue.500" boxSize={5} />
        </HStack>

        {/* Variants Info */}
        <Box>
          <Text fontSize="sm" color="gray.600" mb={2}>
            {product.variants.length} variants
          </Text>
          <VStack spacing={1} align="stretch">
            {product.variants.slice(0, 2).map((variant) => (
              <HStack key={variant.id} justify="space-between" fontSize="xs">
                <Text color="gray.500">{variant.name}</Text>
                <Text fontWeight="medium">
                  {variant.stock} {variant.unit}
                </Text>
              </HStack>
            ))}
            {product.variants.length > 2 && (
              <Text fontSize="xs" color="gray.400" textAlign="center">
                +{product.variants.length - 2} variants khác
              </Text>
            )}
          </VStack>
        </Box>

        {/* Footer */}
        <HStack justify="space-between" align="center">
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium">
              {priceRange}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Tổng: {totalStock} {product.unit}
            </Text>
          </VStack>
          <Badge colorScheme={stockStatus.color} variant="subtle">
            {stockStatus.text}
          </Badge>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProductCard;
