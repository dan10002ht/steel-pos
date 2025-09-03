import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Card,
  CardBody,
  Divider,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  InputGroup,
  InputRightElement,
  Badge,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { Plus, Trash2, Upload } from "lucide-react";
import ProductCreateModal from "./ProductCreateModal";
import ProductSearch from "./ProductSearch";
import { useCreateApi } from "../hooks/useCreateApi";
import { importOrderService } from "../services/importOrderService";

const ImportOrderForm = ({ onNavigateToList }) => {
  const [formData, setFormData] = useState({
    importCode: `IMP${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Date.now()).slice(-4)}`,
    supplier: "",
    importDate: new Date().toISOString().split("T")[0],
    documents: [],
  });

  const [products, setProducts] = useState([
    {
      id: Date.now(),
      productName: "",
      variant: "",
      unit: "",
      quantity: 0,
      unitPrice: 0,
      total: 0,
      productId: null,
    },
  ]);

  const [errors, setErrors] = useState({});
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const toast = useToast();

  // Create import order mutation
  const createMutation = useCreateApi("/import-orders", {
    invalidateQueries: [["import-orders"]],
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đơn nhập hàng đã được tạo và gửi phê duyệt",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to list page
      if (onNavigateToList) {
        onNavigateToList();
      }
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo đơn nhập hàng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  });

  // Remove mock availableProducts - using ProductSearch instead
  // const [availableProducts, setAvailableProducts] = useState([...]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.total, 0);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };

    // Auto-calculate total for this product
    if (field === "quantity" || field === "unitPrice") {
      const quantity =
        field === "quantity" ? value : updatedProducts[index].quantity;
      const unitPrice =
        field === "unitPrice" ? value : updatedProducts[index].unitPrice;
      updatedProducts[index].total = quantity * unitPrice;
    }

    setProducts(updatedProducts);
  };

  const handleProductSelect = (index, selectedProduct) => {
    if (selectedProduct === "__create_new__") {
      setIsProductModalOpen(true);
      return;
    }

    // If selectedProduct is an object (from ProductSearch)
    if (selectedProduct && typeof selectedProduct === "object") {
      const updatedProducts = [...products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        productName: selectedProduct.name,
        unit: selectedProduct.unit,
        productId: selectedProduct.id,
        // Reset variant when product changes
        variant: "",
      };
      setProducts(updatedProducts);
    }
  };

  const handleVariantSelect = (index, variant) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      variant: variant,
    };
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now(),
        productName: "",
        variant: "",
        unit: "",
        quantity: 0,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeProduct = (index) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier.trim()) {
      newErrors.supplier = "Không được bỏ trống nhà cung cấp";
    }

    if (!formData.importDate) {
      newErrors.importDate = "Không được bỏ trống ngày nhập kho";
    }

    // Documents are optional for now
    // if (formData.documents.length === 0) {
    //   newErrors.documents = "Không được bỏ trống chứng từ";
    // }

    // Check if at least one product is selected
    const hasProduct = products.some(
      (product) => product.productName && product.quantity > 0
    );
    if (!hasProduct) {
      newErrors.products = "Không được bỏ trống sản phẩm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductCreated = () => {
    // Close modal
    setIsProductModalOpen(false);
    
    // Show success message
    toast({
      title: "Thành công",
      description: "Sản phẩm đã được tạo thành công",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Transform frontend data to backend format
    const orderData = importOrderService.transformFrontendToBackend({
      supplier: formData.supplier,
      importDate: new Date(formData.importDate),
      notes: "",
      importImages: formData.documents.map(file => file.name), // For now, just use file names
      products: products.filter(product => product.productName && product.quantity > 0)
    });

    createMutation.mutate(orderData);
  };

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Import Order Details Section */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Flex flexDirection={{base: "column", md: "row"}} gap={6}>
                {/* Import Code */}
                <FormControl>
                  <FormLabel fontWeight="bold">Mã nhập kho</FormLabel>
                  <Input value={formData.importCode} isReadOnly bg="gray.50" />
                </FormControl>

                {/* Supplier */}
                <FormControl isInvalid={!!errors.supplier}>
                  <FormLabel fontWeight="bold">Nhà cung cấp *</FormLabel>
                  <Input
                    placeholder="Nhập tên nhà cung cấp"
                    value={formData.supplier}
                    onChange={(e) =>
                      handleInputChange("supplier", e.target.value)
                    }
                  />
                  {errors.supplier && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.supplier}
                    </Text>
                  )}
                </FormControl>

                {/* Import Date */}
                <FormControl isInvalid={!!errors.importDate}>
                  <FormLabel fontWeight="bold">Ngày nhập kho *</FormLabel>
                  <Input
                    type="date"
                    value={formData.importDate}
                    onChange={(e) =>
                      handleInputChange("importDate", e.target.value)
                    }
                  />
                  {errors.importDate && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.importDate}
                    </Text>
                  )}
                </FormControl>
              </Flex>

              {/* Documents */}
              <FormControl isInvalid={!!errors.documents}>
                <FormLabel fontWeight="bold">Chứng từ kèm theo (tùy chọn)</FormLabel>
                <InputGroup>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    display="none"
                    id="file-upload"
                  />
                  <Input
                    placeholder="Chọn file chứng từ..."
                    value={
                      formData.documents.length > 0
                        ? `${formData.documents.length} file đã chọn`
                        : ""
                    }
                    isReadOnly
                    onClick={() => document.getElementById("file-upload").click()}
                  />
                  <InputRightElement>
                    <IconButton
                      icon={<Upload size={16} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById("file-upload").click()}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.documents && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.documents}
                  </Text>
                )}
              </FormControl>

              {/* Selected Files */}
              {formData.documents.length > 0 && (
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Files đã chọn:
                  </Text>
                  {formData.documents.map((file, index) => (
                    <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                      <Text fontSize="sm">{file.name}</Text>
                      <IconButton
                        icon={<Trash2 size={14} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            documents: prev.documents.filter((_, i) => i !== index),
                          }));
                        }}
                      />
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Products Section */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Danh sách sản phẩm</Heading>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme="blue"
                  size="sm"
                  onClick={addProduct}
                >
                  Thêm sản phẩm
                </Button>
              </HStack>

              {errors.products && (
                <Text color="red.500" fontSize="sm">
                  {errors.products}
                </Text>
              )}

              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th minW="200px">Sản phẩm</Th>
                      <Th minW="160px">Phiên bản</Th>
                      <Th minW="100px">Số lượng</Th>
                      <Th minW="120px">Đơn giá</Th>
                      <Th minW="140px">Thành tiền</Th>
                      <Th minW="80px">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {products.map((product, index) => (
                      <Tr key={product.id}>
                        <Td minW="200px">
                          <ProductSearch
                            placeholder="Chọn sản phẩm"
                            value={product.productName}
                            onSelect={(selectedProduct) =>
                              handleProductSelect(index, selectedProduct)
                            }
                            onCreateNew={() => {
                              setIsProductModalOpen(true);
                            }}
                            searchType="import-order"
                          />
                        </Td>
                        <Td minW="160px">
                          <Select
                            placeholder="Chọn phiên bản"
                            value={product.variant}
                            onChange={(e) =>
                              handleVariantSelect(index, e.target.value)
                            }
                            size="sm"
                            isDisabled={!product.productName}
                          >
                            {product.productName && product.productId && (
                              // For now, show a default variant option
                              // In the future, this should fetch variants from the selected product
                              <option value="Default">Default</option>
                            )}
                          </Select>
                        </Td>
                        <Td minW="100px">
                          <NumberInput
                            value={product.quantity}
                            onChange={(value) =>
                              handleProductChange(index, "quantity", parseInt(value) || 0)
                            }
                            min={0}
                            size="sm"
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </Td>
                        <Td minW="120px">
                          <NumberInput
                            value={product.unitPrice}
                            onChange={(value) =>
                              handleProductChange(index, "unitPrice", parseInt(value) || 0)
                            }
                            min={0}
                            size="sm"
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </Td>
                        <Td minW="140px">
                          <Text fontWeight="medium">
                            {formatCurrency(product.total)}
                          </Text>
                        </Td>
                        <Td minW="80px">
                          <IconButton
                            icon={<Trash2 size={16} />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeProduct(index)}
                            isDisabled={products.length === 1}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Total */}
              <Divider />
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  Tổng cộng:
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  {formatCurrency(calculateTotal())}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Submit Button */}
        <HStack justify="flex-end" spacing={4}>
          <Button variant="outline" onClick={onNavigateToList}>
            Hủy
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={createMutation.isPending}
            loadingText="Đang tạo..."
          >
            Tạo đơn nhập hàng
          </Button>
        </HStack>
      </VStack>

      {/* Product Create Modal */}
      <ProductCreateModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </>
  );
};

export default ImportOrderForm;
