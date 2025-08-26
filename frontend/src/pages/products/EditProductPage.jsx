import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  Icon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Edit, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../../features/products/components/ProductForm";
import productService from "../../features/products/services/productService";

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const productData = await productService.getProduct(id);
        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Handle form submission
  const handleSubmit = async (productData) => {
    try {
      setIsSubmitting(true);
      await productService.updateProduct(id, productData);

      toast({
        title: "Cập nhật thành công",
        description: `Sản phẩm "${productData.name}" đã được cập nhật.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/products");
    } catch (err) {
      console.error("Error updating product:", err);
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật sản phẩm. Vui lòng thử lại.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack justify="space-between" align="center" mb={6}>
            <HStack spacing={4}>
              <Button
                leftIcon={<ArrowLeft size={16} />}
                variant="ghost"
                onClick={() => navigate("/products")}
                size="sm"
              >
                Quay lại
              </Button>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Chỉnh sửa sản phẩm
              </Text>
            </HStack>
          </HStack>
        </Box>

        <Card shadow="sm">
          <CardBody>
            <VStack spacing={4} py={12}>
              <Spinner size="lg" color="blue.500" />
              <Text color="gray.500">Đang tải thông tin sản phẩm...</Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack justify="space-between" align="center" mb={6}>
            <HStack spacing={4}>
              <Button
                leftIcon={<ArrowLeft size={16} />}
                variant="ghost"
                onClick={() => navigate("/products")}
                size="sm"
              >
                Quay lại
              </Button>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Chỉnh sửa sản phẩm
              </Text>
            </HStack>
          </HStack>
        </Box>

        <Card shadow="sm">
          <CardBody>
            <Alert status="error">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Lỗi tải dữ liệu</Text>
                <Text>{error}</Text>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
              </VStack>
            </Alert>
          </CardBody>
        </Card>
      </VStack>
    );
  }

  if (!product) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack justify="space-between" align="center" mb={6}>
            <HStack spacing={4}>
              <Button
                leftIcon={<ArrowLeft size={16} />}
                variant="ghost"
                onClick={() => navigate("/products")}
                size="sm"
              >
                Quay lại
              </Button>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Chỉnh sửa sản phẩm
              </Text>
            </HStack>
          </HStack>
        </Box>

        <Card shadow="sm">
          <CardBody>
            <Alert status="warning">
              <AlertIcon />
              <Text>Không tìm thấy sản phẩm với ID: {id}</Text>
            </Alert>
          </CardBody>
        </Card>
      </VStack>
    );
  }

  return (
    <ProductForm
      product={product}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      title="Chỉnh sửa sản phẩm"
      submitText="Cập nhật sản phẩm"
    />
  );
};

export default EditProductPage;
