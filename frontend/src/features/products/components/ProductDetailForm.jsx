import React from "react";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  Divider,
} from "@chakra-ui/react";
import VariantForm from "./VariantForm";

const ProductDetailForm = ({ product }) => {
  if (!product) return null;

  return (
    <VStack spacing={6} align="stretch">
      {/* Product Information */}
      <Card shadow="sm">
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">
            Thông tin sản phẩm
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontWeight="bold" color="gray.700">
                Tên sản phẩm
              </FormLabel>
              <Input value={product.name} isReadOnly bg="gray.50" />
            </FormControl>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="bold" color="gray.700">
                  Đơn vị chung
                </FormLabel>
                <Input value={product.unit} isReadOnly bg="gray.50" />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="gray.700">
                  Ghi chú
                </FormLabel>
                <Textarea
                  value={product.notes || ""}
                  isReadOnly
                  bg="gray.50"
                  rows={3}
                />
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="bold" color="gray.700">
                  Ngày tạo
                </FormLabel>
                <Input
                  value={new Date(product.createdAt).toLocaleDateString(
                    "vi-VN"
                  )}
                  isReadOnly
                  bg="gray.50"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="gray.700">
                  Cập nhật lần cuối
                </FormLabel>
                <Input
                  value={new Date(product.updatedAt).toLocaleDateString(
                    "vi-VN"
                  )}
                  isReadOnly
                  bg="gray.50"
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
              Variants của sản phẩm ({product.variants?.length || 0})
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {product.variants?.map((variant, index) => (
              <Box key={variant.id}>
                <VariantForm
                  variant={variant}
                  index={index}
                  onChange={() => {}} // No-op for read-only
                  onRemove={() => {}} // No-op for read-only
                  canRemove={false}
                  defaultUnit={product.unit}
                  isReadOnly={true}
                />
                {index < product.variants.length - 1 && <Divider my={4} />}
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ProductDetailForm;
