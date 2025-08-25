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

const ImportOrderForm = ({ onNavigateToList }) => {
  const [formData, setFormData] = useState({
    importCode: "0001",
    supplier: "",
    importDate: new Date().toISOString().split("T")[0],
    documents: [],
  });

  const [products, setProducts] = useState([
    {
      id: 1,
      productName: "Ống phi",
      variant: "Phi 12",
      unit: "m",
      quantity: 18,
      unitPrice: 50000,
      total: 900000,
    },
    {
      id: 2,
      productName: "",
      variant: "",
      unit: "",
      quantity: 0,
      unitPrice: 0,
      total: 0,
    },
    {
      id: 3,
      productName: "",
      variant: "",
      unit: "",
      quantity: 0,
      unitPrice: 0,
      total: 0,
    },
    {
      id: 4,
      productName: "",
      variant: "",
      unit: "",
      quantity: 0,
      unitPrice: 0,
      total: 0,
    },
  ]);

  const [errors, setErrors] = useState({});
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const toast = useToast();

  // Mock product data
  const [availableProducts, setAvailableProducts] = useState([
    {
      id: 1,
      name: "Ống phi",
      variants: ["Phi 12", "Phi 16", "Phi 20"],
      unit: "m",
    },
    {
      id: 2,
      name: "Thép hộp",
      variants: ["40x40", "50x50", "60x60"],
      unit: "m",
    },
    { id: 3, name: "Thép tấm", variants: ["3mm", "5mm", "8mm"], unit: "m²" },
  ]);

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

  const handleProductSelect = (index, productName) => {
    if (productName === "__create_new__") {
      setIsProductModalOpen(true);
      return;
    }

    const product = availableProducts.find((p) => p.name === productName);
    if (product) {
      const updatedProducts = [...products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        productName: product.name,
        unit: product.unit,
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

    if (formData.documents.length === 0) {
      newErrors.documents = "Không được bỏ trống chứng từ";
    }

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

  const handleProductCreated = (newProduct) => {
    setAvailableProducts((prev) => [...prev, newProduct]);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      toast({
        title: "Thành công",
        description: "Đơn nhập hàng đã được tạo và gửi phê duyệt",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="1200px" mx="auto">
      {/* Header Section */}
      <HStack justify="space-between" mb={6}>
        <Heading size="lg" color="gray.700">
          Tạo mới nhập kho
        </Heading>
        <Button
          colorScheme="blue"
          leftIcon={<Plus size={20} />}
          onClick={onNavigateToList}
        >
          Xem danh sách
        </Button>
      </HStack>

      <VStack spacing={6} align="stretch">
        {/* Import Order Details Section */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={6}>
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
              </HStack>

              {/* Documents */}
              <FormControl isInvalid={!!errors.documents}>
                <FormLabel fontWeight="bold">Chứng từ kèm theo *</FormLabel>
                <InputGroup>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    display="none"
                    id="file-upload"
                  />
                  <Input
                    placeholder="Chọn file chứng từ"
                    value={formData.documents.map((f) => f.name).join(", ")}
                    isReadOnly
                  />
                  <InputRightElement>
                    <IconButton
                      as="label"
                      htmlFor="file-upload"
                      icon={<Upload size={20} />}
                      variant="ghost"
                      colorScheme="blue"
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.documents && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.documents}
                  </Text>
                )}
                {formData.documents.length > 0 && (
                  <VStack align="start" mt={2}>
                    {formData.documents.map((file, index) => (
                      <Text key={index} fontSize="sm" color="gray.600">
                        📎 {file.name}
                      </Text>
                    ))}
                  </VStack>
                )}
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Products Section */}
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="gray.700">
                Sản phẩm
              </Heading>
              <Button
                leftIcon={<Plus size={16} />}
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={addProduct}
              >
                Thêm sản phẩm
              </Button>
            </HStack>

            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Tên sản phẩm</Th>
                    <Th>Số lượng</Th>
                    <Th>Đơn giá</Th>
                    <Th>Thành tiền</Th>
                    <Th width="50px"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.map((product, index) => (
                    <Tr key={product.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Select
                            placeholder="Chọn sản phẩm"
                            value={product.productName}
                            onChange={(e) =>
                              handleProductSelect(index, e.target.value)
                            }
                            size="sm"
                          >
                            {availableProducts.map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.name}
                              </option>
                            ))}
                            <option value="__create_new__">
                              + Tạo mới sản phẩm
                            </option>
                          </Select>
                          {product.productName && (
                            <>
                              <Select
                                placeholder="Chọn phân loại"
                                value={product.variant}
                                onChange={(e) =>
                                  handleVariantSelect(index, e.target.value)
                                }
                                size="sm"
                              >
                                {availableProducts
                                  .find((p) => p.name === product.productName)
                                  ?.variants.map((variant) => (
                                    <option key={variant} value={variant}>
                                      {variant}
                                    </option>
                                  ))}
                              </Select>
                              <Text fontSize="xs" color="gray.500">
                                Phân loại: {product.variant} | Đơn vị:{" "}
                                {product.unit}
                              </Text>
                            </>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <NumberInput
                          value={product.quantity}
                          onChange={(value) =>
                            handleProductChange(
                              index,
                              "quantity",
                              parseInt(value) || 0
                            )
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
                      <Td>
                        <NumberInput
                          value={product.unitPrice}
                          onChange={(value) =>
                            handleProductChange(
                              index,
                              "unitPrice",
                              parseInt(value) || 0
                            )
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
                      <Td>
                        <Text fontWeight="bold">
                          {formatCurrency(product.total)}
                        </Text>
                      </Td>
                      <Td>
                        {products.length > 1 && (
                          <IconButton
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeProduct(index)}
                          />
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {errors.products && (
              <Text color="red.500" fontSize="sm" mt={2}>
                {errors.products}
              </Text>
            )}
          </CardBody>
        </Card>

        {/* Summary Section */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  Tổng giá trị:
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="blue.600">
                  {formatCurrency(calculateTotal())}
                </Text>
              </HStack>

              <Divider />

              <HStack justify="center" spacing={4}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleSubmit}
                  leftIcon={<Plus size={20} />}
                >
                  Gửi phê duyệt
                </Button>
                <Button variant="outline" size="lg">
                  Lưu nháp
                </Button>
                <Button variant="ghost" size="lg">
                  Hủy
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Product Create Modal */}
      <ProductCreateModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </Box>
  );
};

export default ImportOrderForm;
