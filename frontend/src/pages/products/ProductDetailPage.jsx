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
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  Eye,
  ArrowLeft,
  Edit2,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import MainLayout from "../../components/Layout/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
import productService from "../../features/products/services/productService";
import {
  formatPrice,
  calculateTotalStock,
  calculateTotalSold,
} from "../../features/products/data/mockProducts";
import ProductDetailForm from "../../features/products/components/ProductDetailForm";

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <MainLayout>
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
                  Chi tiết sản phẩm
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
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
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
                  Chi tiết sản phẩm
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
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
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
                  Chi tiết sản phẩm
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
      </MainLayout>
    );
  }

  const totalStock = calculateTotalStock(product);
  const totalSold = calculateTotalSold(product);
  const totalValue =
    product.variants?.reduce(
      (sum, variant) => sum + (variant.stock || 0) * (variant.price || 0),
      0
    ) || 0;

  return (
    <MainLayout>
      <VStack spacing={6} align="stretch">
        {/* Header */}
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
                {product.name}
              </Text>
            </HStack>
            <Button
              colorScheme="blue"
              leftIcon={<Edit2 size={16} />}
              onClick={() => navigate(`/products/${id}/edit`)}
              size="md"
            >
              Chỉnh sửa
            </Button>
          </HStack>
        </Box>

        {/* Product Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Tổng tồn kho</StatLabel>
                <StatNumber fontSize="2xl" color="blue.600">
                  {totalStock}
                </StatNumber>
                <StatHelpText>
                  <Package
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  {product.unit}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Đã bán</StatLabel>
                <StatNumber fontSize="2xl" color="green.600">
                  {totalSold}
                </StatNumber>
                <StatHelpText>
                  <TrendingUp
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  Tổng cộng
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Giá trị tồn kho</StatLabel>
                <StatNumber fontSize="2xl" color="orange.600">
                  {formatPrice(totalValue)}
                </StatNumber>
                <StatHelpText>
                  <DollarSign
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  VNĐ
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Product Detail Form */}
        <ProductDetailForm product={product} />
      </VStack>
    </MainLayout>
  );
};

export default ProductDetailPage;
