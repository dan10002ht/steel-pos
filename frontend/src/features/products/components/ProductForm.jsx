import React from "react";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  Button,
  Card,
  CardBody,
  CardHeader,
  Text,
  Divider,
} from "@chakra-ui/react";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import VariantForm from "./VariantForm";

const ProductForm = ({
  product = null,
  onSubmit,
  isLoading = false,
  title = "Tạo sản phẩm mới",
  submitText = "Tạo sản phẩm",
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: product?.name || "",
    unit: product?.unit || "",
    notes: product?.notes || "",
    variants: product?.variants || [
      {
        id: "1",
        name: "",
        sku: "",
        stock: 0,
        price: 0,
        unit: "",
        sold: 0,
      },
    ],
  });

  const [errors, setErrors] = React.useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: Date.now().toString(),
          name: "",
          sku: "",
          stock: 0,
          price: 0,
          unit: formData.unit || "",
          sold: 0,
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate product name
    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    // Validate unit
    if (!formData.unit.trim()) {
      newErrors.unit = "Đơn vị là bắt buộc";
    }

    // Validate variants
    const variantErrors = [];
    formData.variants.forEach((variant, index) => {
      const variantError = {};

      if (!variant.name.trim()) {
        variantError.name = "Tên variant là bắt buộc";
      }

      if (!variant.sku.trim()) {
        variantError.sku = "SKU là bắt buộc";
      }

      if (variant.stock < 0) {
        variantError.stock = "Số lượng tồn kho không được âm";
      }

      if (variant.price <= 0) {
        variantError.price = "Giá phải lớn hơn 0";
      }

      if (!variant.unit.trim()) {
        variantError.unit = "Đơn vị variant là bắt buộc";
      }

      if (Object.keys(variantError).length > 0) {
        variantErrors[index] = variantError;
      }
    });

    if (variantErrors.length > 0) {
      newErrors.variants = variantErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const productData = {
        ...formData,
        id: product?.id || Date.now().toString(),
        createdAt: product?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSubmit(productData);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {title}
          </Text>
          <Button
            leftIcon={<ArrowLeft size={16} />}
            variant="outline"
            onClick={() => navigate("/products")}
          >
            Quay lại
          </Button>
        </HStack>

        {/* Product Information */}
        <Card shadow="sm">
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">
              Thông tin sản phẩm
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Tên sản phẩm</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên sản phẩm"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <HStack spacing={4}>
                <FormControl isInvalid={!!errors.unit} isRequired>
                  <FormLabel>Đơn vị chung</FormLabel>
                  <Input
                    value={formData.unit}
                    onChange={(e) => handleInputChange("unit", e.target.value)}
                    placeholder="VD: cái, kg, m"
                  />
                  <FormErrorMessage>{errors.unit}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Ghi chú</FormLabel>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Ghi chú về sản phẩm (tùy chọn)"
                    rows={3}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Variants */}
        <Card shadow="sm">
          <CardHeader>
            <HStack justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold">
                Variants của sản phẩm
              </Text>
              <Button
                leftIcon={<Plus size={16} />}
                colorScheme="blue"
                variant="outline"
                onClick={addVariant}
                size="sm"
              >
                Thêm variant
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {formData.variants.map((variant, index) => (
                <Box key={variant.id}>
                  <VariantForm
                    variant={variant}
                    index={index}
                    errors={errors.variants?.[index] || {}}
                    onChange={(field, value) =>
                      handleVariantChange(index, field, value)
                    }
                    onRemove={() => removeVariant(index)}
                    canRemove={formData.variants.length > 1}
                    defaultUnit={formData.unit}
                    isReadOnly={false}
                  />
                  {index < formData.variants.length - 1 && <Divider my={4} />}
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Submit Button */}
        <HStack justify="flex-end" spacing={4}>
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            isDisabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            leftIcon={<Save size={16} />}
            isLoading={isLoading}
            loadingText="Đang lưu..."
          >
            {submitText}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProductForm;
