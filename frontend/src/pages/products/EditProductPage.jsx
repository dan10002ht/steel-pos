import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetchApi } from "../../hooks/useFetchApi";
import { useEditApi } from "../../hooks/useEditApi";
import ProductForm from "../../features/products/components/ProductForm";
import Page from "../../components/organisms/Page";
import { Spinner, VStack, Text, Alert, AlertIcon, AlertTitle, AlertDescription, Box, useToast } from "@chakra-ui/react";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch product data for editing
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useFetchApi(
    ["product", id],
    `/products/${id}`,
    {
      enabled: !!id,
    }
  );

  // Edit product mutation
  const editProductMutation = useEditApi("/products", {
    invalidateQueries: [["products"], ["product", id]], // Invalidate specific product detail
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Sản phẩm đã được cập nhật thành công.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Navigate to product detail page on success
      navigate(`/products/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Lỗi!",
        description: error.message || "Không thể cập nhật sản phẩm. Vui lòng thử lại.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = async (formData) => {
    try {
      await editProductMutation.mutateAsync({
        id: parseInt(id),
        data: formData,
      });
      // Navigation is handled in onSuccess callback
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  if (isLoadingProduct) {
    return (
      <Page
        title="Chỉnh sửa sản phẩm"
        subtitle="Đang tải thông tin sản phẩm..."
      >
        <VStack spacing={4} align="center" justify="center" minH="400px">
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">Đang tải dữ liệu...</Text>
        </VStack>
      </Page>
    );
  }

  if (productError) {
    return (
      <Page
        title="Chỉnh sửa sản phẩm"
        subtitle="Không thể tải thông tin sản phẩm"
      >
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Lỗi!</AlertTitle>
            <AlertDescription>
              {productError.message || "Không thể tải thông tin sản phẩm. Vui lòng thử lại."}
            </AlertDescription>
          </Box>
        </Alert>
      </Page>
    );
  }

  if (!product) {
    return (
      <Page
        title="Chỉnh sửa sản phẩm"
        subtitle="Không tìm thấy sản phẩm"
      >
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Cảnh báo!</AlertTitle>
            <AlertDescription>
              Không tìm thấy sản phẩm với ID này.
            </AlertDescription>
          </Box>
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title="Chỉnh sửa sản phẩm"
      subtitle={`Cập nhật thông tin cho ${product.name}`}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Sản phẩm", href: "/products" },
        { label: product.name, href: `/products/${id}` },
        { label: "Chỉnh sửa", href: `/products/${id}/edit` },
      ]}
    >
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        isLoading={editProductMutation.isPending}
        title="Chỉnh sửa sản phẩm"
        submitText="Cập nhật sản phẩm"
      />
    </Page>
  );
};

export default EditProductPage;
