import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import ProductForm from "../../features/products/components/ProductForm";
import { useCreateProduct } from "../../features/products/hooks/useProduct";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const createProductMutation = useCreateProduct({
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Sản phẩm đã được tạo thành công.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/products");
    },
    onError: (error) => {
      toast({
        title: "Lỗi!",
        description: error.message || "Không thể tạo sản phẩm. Vui lòng thử lại.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = async (productData) => {
    try {
      await createProductMutation.mutateAsync(productData);
    } catch (error) {
      // Error is handled by onError callback
      console.error("Error creating product:", error);
    }
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      isLoading={createProductMutation.isPending}
      title="Tạo sản phẩm mới"
      submitText="Tạo sản phẩm"
    />
  );
};

export default CreateProductPage;
