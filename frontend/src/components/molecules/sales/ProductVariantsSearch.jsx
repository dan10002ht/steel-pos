import React, { useState } from "react";
import {
  Box,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Text,
  HStack,
  Badge,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { Search, Package } from "lucide-react";
import { useProductVariantsSearch } from "../../../hooks/sales/useProductVariantsSearch";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { formatCurrency } from "../../../utils/formatters";

const ProductVariantsSearch = ({ invoice, onUpdate, enabled = true }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  // Use the custom hook for product variants search
  const {
    searchResults,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    hasResults,
    isEmpty
  } = useProductVariantsSearch({
    searchTerm,
    limit: 20,
    enabled
  });

  // Use infinite scroll hook
  const lastElementObserver = useInfiniteScroll(loadMore, hasMore, isLoadingMore);

  const handleAddProduct = (variant) => {
    // Check if variant is out of stock
    if (variant.stock === 0) {
      toast({
        title: "Không thể thêm sản phẩm",
        description: "Sản phẩm này đã hết hàng",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if variant already exists in invoice
    const existingItem = invoice.items.find(item => item.variantId === variant.id);
    if (existingItem) {
      toast({
        title: "Sản phẩm đã tồn tại",
        description: "Sản phẩm này đã có trong hoá đơn",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newItem = {
      id: Date.now(),
      productId: variant.product_id,
      variantId: variant.id,
      productName: variant.product_name,
      variantName: variant.name,
      sku: variant.sku,
      quantity: 1,
      unitPrice: variant.unit_price || variant.price || 0,
      totalPrice: variant.unit_price || variant.price || 0,
      stock: variant.stock,
      unit: variant.unit || variant.product_unit || 'cái'
    };

    const updatedInvoice = {
      ...invoice,
      items: [...invoice.items, newItem],
    };

    onUpdate(updatedInvoice);

    toast({
      title: "Đã thêm sản phẩm",
      description: `${variant.product_name} - ${variant.name} đã được thêm vào hoá đơn`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <VStack spacing={4} align="stretch" h="full">
      {/* Search Header */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Tìm sản phẩm
        </Text>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            {isLoading ? <Spinner size="sm" /> : <Search size={20} />}
          </InputLeftElement>
          <Input
            placeholder="Nhập tên sản phẩm hoặc phân loại..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </InputGroup>
      </Box>

      {/* Error State */}
      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            Lỗi tìm kiếm: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Product List */}
      <Box flex={1} overflowY="auto">
        <VStack spacing={3} align="stretch">
          {/* Loading State */}
          {isLoading && searchTerm.length >= 1 && (
            <Box p={4} textAlign="center">
              <Spinner size="sm" />
              <Text fontSize="sm" color="gray.500" mt={2}>
                Đang tìm kiếm...
              </Text>
            </Box>
          )}

          {/* Empty State */}
          {isEmpty && (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                Không tìm thấy sản phẩm
              </Text>
            </Box>
          )}

          {/* No Search State */}
          {!isLoading && !error && searchTerm.length === 0 && (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                Nhập từ khóa để tìm kiếm sản phẩm
              </Text>
            </Box>
          )}

          {/* Search Results */}
          {hasResults && searchResults.map((variant, index) => {
            const isLastElement = index === searchResults.length - 1;
            return (
              <Card
                key={`${variant.product_id}-${variant.id}`}
                ref={isLastElement ? lastElementObserver : null}
                variant="outline"
                cursor={variant.stock > 0 ? "pointer" : "not-allowed"}
                opacity={variant.stock === 0 ? 0.6 : 1}
                _hover={variant.stock > 0 ? { shadow: "md" } : {}}
                onClick={() => handleAddProduct(variant)}
              >
                <CardBody p={4}>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="sm">
                        {variant.product_name} - {variant.name}
                      </Text>
                      <Badge
                        colorScheme={variant.stock > 0 ? "green" : "red"}
                        fontSize="xs"
                      >
                        {variant.stock > 0 ? `Tồn: ${variant.stock}` : "Hết hàng"}
                      </Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="medium">
                        {formatCurrency(variant.unit_price || variant.price || 0)}
                      </Text>
                      <Button
                        size="sm"
                        leftIcon={<Package size={14} />}
                        colorScheme="blue"
                        variant="ghost"
                        isDisabled={variant.stock === 0}
                      >
                        Thêm
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}

          {/* Load More Loading State */}
          {isLoadingMore && (
            <Box p={4} textAlign="center">
              <Spinner size="sm" />
              <Text fontSize="sm" color="gray.500" mt={2}>
                Đang tải thêm...
              </Text>
            </Box>
          )}

          {/* No More Results */}
          {!hasMore && hasResults && searchResults.length > 0 && (
            <Box p={3} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                Đã hiển thị tất cả kết quả
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default ProductVariantsSearch;
