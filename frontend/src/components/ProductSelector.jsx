import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  Select,
  HStack,
  Button,
  Text,
  VStack,
  Box,
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import ProductCreateModal from "./ProductCreateModal";

const ProductSelector = ({
  products,
  selectedProduct,
  onProductChange,
  onProductCreated,
  label = "Sản phẩm",
  placeholder = "Chọn sản phẩm",
  isRequired = true,
}) => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleProductChange = (e) => {
    const value = e.target.value;
    if (value === "__create_new__") {
      setIsProductModalOpen(true);
    } else {
      onProductChange(value);
    }
  };

  const handleProductCreated = (newProduct) => {
    onProductCreated(newProduct);
    setIsProductModalOpen(false);
  };

  return (
    <>
      <FormControl isRequired={isRequired}>
        <FormLabel fontSize="sm">{label}</FormLabel>
        <Select
          placeholder={placeholder}
          value={selectedProduct}
          onChange={handleProductChange}
          size="sm"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
          <option value="__create_new__">+ Tạo mới sản phẩm</option>
        </Select>
      </FormControl>

      <ProductCreateModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </>
  );
};

export default ProductSelector;
