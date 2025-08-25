import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

const ProductCreateModal = ({ isOpen, onClose, onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    unitPrice: 0,
    variants: [""],
  });

  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleVariantChange = (index, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = value;
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, ""],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Phân loại không được để trống";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "Đơn vị không được để trống";
    }

    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = "Đơn giá phải lớn hơn 0";
    }

    // Check if at least one variant is filled
    const hasValidVariant = formData.variants.some(
      (variant) => variant.trim() !== ""
    );
    if (!hasValidVariant) {
      newErrors.variants = "Phải có ít nhất một phân loại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newProduct = {
        id: Date.now(),
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        unitPrice: formData.unitPrice,
        variants: formData.variants.filter((v) => v.trim() !== ""),
      };

      onProductCreated(newProduct);

      toast({
        title: "Thành công",
        description: "Sản phẩm đã được tạo",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: "",
        category: "",
        unit: "",
        unitPrice: 0,
        variants: [""],
      });
      setErrors({});
      onClose();
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

  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
      unit: "",
      unitPrice: 0,
      variants: [""],
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tạo mới sản phẩm</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Product Name */}
            <FormControl isInvalid={!!errors.name}>
              <FormLabel fontWeight="bold">Tên sản phẩm *</FormLabel>
              <Input
                placeholder="Nhập tên sản phẩm"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              {errors.name && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.name}
                </Text>
              )}
            </FormControl>

            {/* Category */}
            <FormControl isInvalid={!!errors.category}>
              <FormLabel fontWeight="bold">Phân loại *</FormLabel>
              <Input
                placeholder="Nhập phân loại sản phẩm"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              />
              {errors.category && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.category}
                </Text>
              )}
            </FormControl>

            {/* Unit */}
            <FormControl isInvalid={!!errors.unit}>
              <FormLabel fontWeight="bold">Đơn vị *</FormLabel>
              <Select
                placeholder="Chọn đơn vị"
                value={formData.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
              >
                <option value="m">Mét (m)</option>
                <option value="m²">Mét vuông (m²)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="cái">Cái</option>
                <option value="bộ">Bộ</option>
                <option value="cuộn">Cuộn</option>
              </Select>
              {errors.unit && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.unit}
                </Text>
              )}
            </FormControl>

            {/* Unit Price */}
            <FormControl isInvalid={!!errors.unitPrice}>
              <FormLabel fontWeight="bold">Đơn giá *</FormLabel>
              <NumberInput
                value={formData.unitPrice}
                onChange={(value) =>
                  handleInputChange("unitPrice", parseInt(value) || 0)
                }
                min={0}
              >
                <NumberInputField placeholder="Nhập đơn giá" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.unitPrice && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.unitPrice}
                </Text>
              )}
            </FormControl>

            {/* Variants */}
            <FormControl isInvalid={!!errors.variants}>
              <FormLabel fontWeight="bold">Phân loại chi tiết *</FormLabel>
              <VStack spacing={2} align="stretch">
                {formData.variants.map((variant, index) => (
                  <HStack key={index}>
                    <Input
                      placeholder={`Phân loại ${index + 1}`}
                      value={variant}
                      onChange={(e) =>
                        handleVariantChange(index, e.target.value)
                      }
                    />
                    {formData.variants.length > 1 && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeVariant(index)}
                      >
                        Xóa
                      </Button>
                    )}
                  </HStack>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addVariant}
                  alignSelf="flex-start"
                >
                  + Thêm phân loại
                </Button>
              </VStack>
              {errors.variants && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.variants}
                </Text>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Hủy
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Tạo sản phẩm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductCreateModal;
