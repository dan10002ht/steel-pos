import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import MainLayout from "../../components/Layout/MainLayout";
import ProductForm from "../../features/products/components/ProductForm";
import productService from "../../features/products/services/productService";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (productData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await productService.createProduct(productData);

      toast({
        title: "Thành công!",
        description: "Sản phẩm đã được tạo thành công.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/products");
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể tạo sản phẩm. Vui lòng thử lại.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      title="Tạo sản phẩm mới"
      submitText="Tạo sản phẩm"
    />
  );
};

export default CreateProductPage;
