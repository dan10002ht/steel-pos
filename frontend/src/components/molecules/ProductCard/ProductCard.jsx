import React from "react";
import {
  Box,
  Image,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { ShoppingCart, Eye } from "lucide-react";
import Button from "../../atoms/Button/Button";

const ProductCard = ({
  product,
  onAddToCart,
  onViewDetails,
  isInStock = true,
}) => {
  const toast = useToast();

  const handleAddToCart = () => {
    if (!isInStock) {
      toast({
        title: "Hết hàng",
        description: "Sản phẩm này hiện đã hết hàng",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onAddToCart?.(product);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      <Box position="relative">
        <Image
          src={product.image || "/placeholder-product.jpg"}
          alt={product.name}
          w="full"
          h="200px"
          objectFit="cover"
        />
        {!isInStock && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme="red"
            variant="solid"
          >
            Hết hàng
          </Badge>
        )}
        <Badge
          position="absolute"
          top={2}
          left={2}
          colorScheme="blue"
          variant="solid"
        >
          {product.category}
        </Badge>
      </Box>

      <Box p={4}>
        <VStack align="stretch" spacing={3}>
          <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
            {product.name}
          </Text>

          <Text color="gray.600" fontSize="sm" noOfLines={2}>
            {product.description}
          </Text>

          <HStack justify="space-between" align="center">
            <Text fontWeight="bold" color="blue.600" fontSize="xl">
              {product.price?.toLocaleString("vi-VN")} ₫
            </Text>
            <Text fontSize="sm" color="gray.500">
              Tồn: {product.stock}
            </Text>
          </HStack>

          <HStack spacing={2}>
            <Button
              leftIcon={<ShoppingCart size={16} />}
              onClick={handleAddToCart}
              isDisabled={!isInStock}
              flex={1}
              size="sm"
            >
              Thêm vào giỏ
            </Button>
            <IconButton
              icon={<Eye size={16} />}
              onClick={() => onViewDetails?.(product)}
              variant="outline"
              size="sm"
              aria-label="Xem chi tiết"
            />
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default ProductCard;
