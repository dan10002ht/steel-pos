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
} from "@chakra-ui/react";
import { Search, Package } from "lucide-react";

const ProductSearch = ({ invoice, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  // Mock data - sẽ được thay thế bằng API calls
  const mockProducts = [
    {
      id: 1,
      name: "Thép hộp 40x40",
      variantName: "Độ dày 2mm",
      stock: 500,
      unitPrice: 15000,
    },
    {
      id: 2,
      name: "Thép tấm 3mm",
      variantName: "Kích thước 1.2m x 2.4m",
      stock: 0,
      unitPrice: 80000,
    },
    {
      id: 3,
      name: "Thép ống 50mm",
      variantName: "Độ dày 3mm",
      stock: 200,
      unitPrice: 25000,
    },
    {
      id: 4,
      name: "Thép hộp 60x60",
      variantName: "Độ dày 2.5mm",
      stock: 150,
      unitPrice: 22000,
    },
  ];

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.variantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product) => {
    if (product.stock === 0) {
      toast({
        title: "Không thể thêm sản phẩm",
        description: "Sản phẩm này đã hết hàng",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Kiểm tra xem sản phẩm đã có trong hoá đơn chưa
    const existingItem = invoice.items.find(item => item.productId === product.id);
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
      productId: product.id,
      productName: product.name,
      variantName: product.variantName,
      quantity: 1,
      unitPrice: product.unitPrice || 0,
      totalPrice: (product.unitPrice || 0) * 1,
      stock: product.stock,
    };

    const updatedInvoice = {
      ...invoice,
      items: [...invoice.items, newItem],
    };

    onUpdate(updatedInvoice);

    toast({
      title: "Đã thêm sản phẩm",
      description: `${product.name} đã được thêm vào hoá đơn`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
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
            <Search size={20} />
          </InputLeftElement>
          <Input
            placeholder="Nhập tên sản phẩm hoặc phân loại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Box>

      {/* Product List */}
      <Box flex={1} overflowY="auto">
        <VStack spacing={3} align="stretch">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              variant="outline"
              cursor={product.stock > 0 ? "pointer" : "not-allowed"}
              opacity={product.stock === 0 ? 0.6 : 1}
              _hover={product.stock > 0 ? { shadow: "md" } : {}}
              onClick={() => handleAddProduct(product)}
            >
              <CardBody p={4}>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="sm">
                      {product.name}
                    </Text>
                    <Badge
                      colorScheme={product.stock > 0 ? "green" : "red"}
                      fontSize="xs"
                    >
                      {product.stock > 0 ? `Tồn: ${product.stock}` : "Hết hàng"}
                    </Badge>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.600">
                    {product.variantName}
                  </Text>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium">
                      {product.unitPrice.toLocaleString("vi-VN")} VNĐ
                    </Text>
                    <Button
                      size="sm"
                      leftIcon={<Package size={14} />}
                      colorScheme="blue"
                      variant="ghost"
                      isDisabled={product.stock === 0}
                    >
                      Thêm
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};

export default ProductSearch;


