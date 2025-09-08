import React from "react";
import {
  Box,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  Divider,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { ArrowLeft, Edit, Package, Tag, Hash, DollarSign, Box as BoxIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchApi } from "../../hooks/useFetchApi";
import Page from "../../components/organisms/Page";
import { formatCurrency, formatNumber, formatDateTime } from "../../utils/formatters";

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch product detail
  const {
    data: product,
    isLoading,
    error,
  } = useFetchApi(
    ["product", id],
    `/products/${id}`,
    {
      enabled: !!id,
    }
  );

  if (isLoading) {
    return (
      <Page
        title="Chi tiết sản phẩm"
        subtitle="Đang tải thông tin sản phẩm..."
      >
        <VStack spacing={4} align="center" justify="center" minH="400px">
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">Đang tải dữ liệu...</Text>
        </VStack>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        title="Chi tiết sản phẩm"
        subtitle="Không thể tải thông tin sản phẩm"
      >
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Lỗi!</AlertTitle>
            <AlertDescription>
              {error.message || "Không thể tải thông tin sản phẩm. Vui lòng thử lại."}
            </AlertDescription>
          </Box>
        </Alert>
      </Page>
    );
  }

  if (!product) {
    return (
      <Page
        title="Chi tiết sản phẩm"
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

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  const avgPrice = product.variants?.length > 0 
    ? product.variants.reduce((sum, v) => sum + v.price, 0) / product.variants.length 
    : 0;

  return (
    <Page
      title="Chi tiết sản phẩm"
      subtitle={`Thông tin chi tiết về ${product.name}`}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Sản phẩm", href: "/products" },
        { label: product.name, href: `/products/${id}` },
      ]}
      primaryActions={[
        {
          label: "Chỉnh sửa",
          onClick: () => navigate(`/products/${id}/edit`),
          colorScheme: "blue",
          leftIcon: <Edit size={16} />,
        },
      ]}
      secondaryActions={[
        {
          label: "Quay lại",
          onClick: () => navigate("/products"),
          variant: "outline",
          leftIcon: <ArrowLeft size={16} />,
        },
      ]}
    >
      <VStack spacing={6} align="stretch">
        {/* Product Overview */}
        <Card shadow="sm">
          <CardHeader>
            <HStack justify="space-between" align="center">
              <HStack spacing={3}>
                <Box
                  p={2}
                  borderRadius="md"
                  bg="blue.50"
                  color="blue.600"
                >
                  <Package size={24} />
                </Box>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">
                    {product.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    ID: {product.id}
                  </Text>
                </VStack>
              </HStack>
              <Badge 
                colorScheme={product.is_active ? "green" : "gray"}
                fontSize="sm"
                px={3}
                py={1}
              >
                {product.is_active ? "Hoạt động" : "Không hoạt động"}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
              <GridItem>
                <VStack align="flex-start" spacing={2}>
                  <HStack spacing={2} color="gray.600">
                    <Tag size={16} />
                    <Text fontSize="sm" fontWeight="medium">Danh mục</Text>
                  </HStack>
                  <Text fontSize="md">
                    {product.category?.name || "Chưa phân loại"}
                  </Text>
                </VStack>
              </GridItem>
              
              <GridItem>
                <VStack align="flex-start" spacing={2}>
                  <HStack spacing={2} color="gray.600">
                    <BoxIcon size={16} />
                    <Text fontSize="sm" fontWeight="medium">Đơn vị</Text>
                  </HStack>
                  <Text fontSize="md">{product.unit}</Text>
                </VStack>
              </GridItem>
              
              <GridItem>
                <VStack align="flex-start" spacing={2}>
                  <HStack spacing={2} color="gray.600">
                    <Hash size={16} />
                    <Text fontSize="sm" fontWeight="medium">Tổng tồn kho</Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="semibold">
                    {formatNumber(totalStock)} {product.unit}
                  </Text>
                </VStack>
              </GridItem>
              
              <GridItem>
                <VStack align="flex-start" spacing={2}>
                  <HStack spacing={2} color="gray.600">
                    <DollarSign size={16} />
                    <Text fontSize="sm" fontWeight="medium">Giá trung bình</Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="semibold" color="blue.600">
                    {formatCurrency(avgPrice)}
                  </Text>
                </VStack>
              </GridItem>
            </Grid>
            
            {product.notes && (
              <>
                <Divider my={4} />
                <VStack align="flex-start" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Ghi chú
                  </Text>
                  <Text fontSize="md" whiteSpace="pre-wrap">
                    {product.notes}
                  </Text>
                </VStack>
              </>
            )}
          </CardBody>
        </Card>

        {/* Variants Table */}
        <Card shadow="sm">
          <CardHeader>
            <HStack justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold">
                Variants của sản phẩm
              </Text>
              <Badge colorScheme="blue" fontSize="sm">
                {product.variants?.length || 0} variants
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            {!product.variants || product.variants.length === 0 ? (
              <VStack spacing={4} align="center" justify="center" minH="200px" py={8}>
                <Box
                  p={4}
                  borderRadius="full"
                  bg="gray.50"
                  color="gray.400"
                >
                  <Package size={32} />
                </Box>
                <VStack spacing={2} textAlign="center">
                  <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                    Chưa có variants
                  </Text>
                  <Text fontSize="md" color="gray.500">
                    Sản phẩm này chưa có variants nào được tạo.
                  </Text>
                </VStack>
              </VStack>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Tên variant</Th>
                      <Th>SKU</Th>
                      <Th isNumeric>Tồn kho</Th>
                      <Th isNumeric>Đã bán</Th>
                      <Th isNumeric>Giá</Th>
                      <Th>Đơn vị</Th>
                      <Th>Trạng thái</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {product.variants.map((variant) => (
                      <Tr key={variant.id}>
                        <Td>
                          <Text fontWeight="medium">{variant.name}</Text>
                        </Td>
                        <Td>
                          <Text fontFamily="mono" fontSize="sm" color="gray.600">
                            {variant.sku}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="medium">
                            {formatNumber(variant.stock)}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Text color="gray.600">
                            {formatNumber(variant.sold)}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="medium" color="blue.600">
                            {formatCurrency(variant.price)}
                          </Text>
                        </Td>
                        <Td>
                          <Text color="gray.600">{variant.unit}</Text>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={variant.is_active ? "green" : "gray"}
                            fontSize="xs"
                          >
                            {variant.is_active ? "Hoạt động" : "Không hoạt động"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Product Metadata */}
        <Card shadow="sm">
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">
              Thông tin hệ thống
            </Text>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Ngày tạo</Text>
                <Text fontSize="md">{formatDateTime(product.created_at)}</Text>
              </VStack>
              
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Cập nhật lần cuối</Text>
                <Text fontSize="md">{formatDateTime(product.updated_at)}</Text>
              </VStack>
              
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Người tạo</Text>
                <Text fontSize="md">User ID: {product.created_by}</Text>
              </VStack>
            </Grid>
          </CardBody>
        </Card>
      </VStack>
    </Page>
  );
};

export default ProductDetailPage;
