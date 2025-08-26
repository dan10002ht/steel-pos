import React, { useState, useMemo } from "react";
import {
  Box,
  VStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  Edit2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  mockProducts,
  calculateTotalStock,
  calculateTotalSold,
  formatPriceRange,
  formatPrice,
} from "../../features/products/data/mockProducts";
import { useNavigate } from "react-router-dom";

const ProductListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [productToDelete, setProductToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: "red", text: "Hết hàng" };
    if (stock < 10) return { color: "orange", text: "Sắp hết" };
    return { color: "green", text: "Còn hàng" };
  };

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.variants.some((variant) =>
            variant.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    return filtered;
  }, [searchTerm]);

  // Pagination
  const totalItems = filteredProducts.reduce(
    (total, product) => total + product.variants.length,
    0
  );
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Flatten products and variants for pagination
  const flattenedData = useMemo(() => {
    const data = [];
    filteredProducts.forEach((product) => {
      product.variants.forEach((variant, variantIndex) => {
        data.push({
          product,
          variant,
          variantIndex,
          isFirstVariant: variantIndex === 0,
        });
      });
    });
    return data;
  }, [filteredProducts]);

  const paginatedData = flattenedData.slice(startIndex, endIndex);

  const handleDeleteClick = (product, e) => {
    e.stopPropagation();
    setProductToDelete(product);
    onOpen();
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement actual delete functionality
    console.log("Deleting product:", productToDelete?.name);
    onClose();
    setProductToDelete(null);
  };

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={6}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Quản lý sản phẩm
            </Text>
            <Button
              colorScheme="blue"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate("/products/create")}
              size="md"
            >
              Thêm sản phẩm
            </Button>
          </HStack>
        </Box>

        {/* Products Table */}
        <Card shadow="sm">
          <CardHeader>
            <HStack justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold">
                Danh sách sản phẩm ({totalItems} variants từ{" "}
                {filteredProducts.length} sản phẩm)
              </Text>
              <InputGroup size="sm" maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Search size={16} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </HStack>
          </CardHeader>
          <CardBody>
            {paginatedData.length > 0 ? (
              <VStack spacing={4} align="stretch">
                <Box overflowX="auto">
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th fontWeight="bold">Tên sản phẩm</Th>
                        <Th fontWeight="bold">Variants của sản phẩm</Th>
                        <Th fontWeight="bold">Đơn vị</Th>
                        <Th fontWeight="bold">Tồn kho</Th>
                        <Th fontWeight="bold">Đã bán</Th>
                        <Th fontWeight="bold">Giá tiền</Th>
                        <Th fontWeight="bold">Thao tác</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedData.map(
                        ({ product, variant, isFirstVariant }) => (
                          <Tr
                            key={`${product.id}-${variant.id}`}
                            _hover={{ bg: "gray.50" }}
                            cursor="pointer"
                            onClick={() => handleProductClick(product.id)}
                          >
                            <Td>
                              {isFirstVariant && (
                                <Text fontWeight="bold" fontSize="md">
                                  {product.name}
                                </Text>
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="md">{variant.name}</Text>
                            </Td>
                            <Td>
                              <Text color="gray.600">{variant.unit}</Text>
                            </Td>
                            <Td>
                              <Text>{variant.stock}</Text>
                            </Td>
                            <Td>
                              <Text>{variant.sold}</Text>
                            </Td>
                            <Td>
                              <Text color="blue.600">
                                {formatPrice(variant.price)}
                              </Text>
                            </Td>
                            <Td>
                              {isFirstVariant && (
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProductClick(product.id);
                                    }}
                                    title="Xem chi tiết"
                                  >
                                    <Eye size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="orange"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/products/${product.id}/edit`);
                                    }}
                                    title="Chỉnh sửa"
                                  >
                                    <Edit2 size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={(e) =>
                                      handleDeleteClick(product, e)
                                    }
                                    title="Xóa sản phẩm"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </HStack>
                              )}
                            </Td>
                          </Tr>
                        )
                      )}
                    </Tbody>
                  </Table>
                </Box>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <Box borderTop="1px" borderColor="gray.200" pt={6} mt={4}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4}>
                        <Text fontSize="sm" color="gray.600">
                          Hiển thị <strong>{startIndex + 1}</strong>-
                          <strong>{Math.min(endIndex, totalItems)}</strong>{" "}
                          trong <strong>{totalItems}</strong> kết quả
                        </Text>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.500">
                            Hiển thị:
                          </Text>
                          <Select
                            size="sm"
                            w="70px"
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </Select>
                        </HStack>
                      </HStack>

                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          isDisabled={currentPage === 1}
                          leftIcon={<ArrowLeft size={14} />}
                        >
                          Trước
                        </Button>

                        <HStack spacing={1}>
                          {/* First page */}
                          {currentPage > 3 && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentPage(1)}
                              >
                                1
                              </Button>
                              {currentPage > 4 && (
                                <Text color="gray.400" px={2}>
                                  ...
                                </Text>
                              )}
                            </>
                          )}

                          {/* Page numbers around current page */}
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let page;
                              if (totalPages <= 5) {
                                page = i + 1;
                              } else if (currentPage <= 3) {
                                page = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                              } else {
                                page = currentPage - 2 + i;
                              }

                              if (page > 0 && page <= totalPages) {
                                return (
                                  <Button
                                    key={page}
                                    size="sm"
                                    variant={
                                      currentPage === page ? "solid" : "outline"
                                    }
                                    colorScheme={
                                      currentPage === page ? "blue" : "gray"
                                    }
                                    onClick={() => setCurrentPage(page)}
                                  >
                                    {page}
                                  </Button>
                                );
                              }
                              return null;
                            }
                          )}

                          {/* Last page */}
                          {currentPage < totalPages - 2 && (
                            <>
                              {currentPage < totalPages - 3 && (
                                <Text color="gray.400" px={2}>
                                  ...
                                </Text>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentPage(totalPages)}
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </HStack>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          isDisabled={currentPage === totalPages}
                          rightIcon={<ArrowRight size={14} />}
                        >
                          Sau
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                )}
              </VStack>
            ) : searchTerm ? (
              <Text color="gray.500" textAlign="center" py={8}>
                Không tìm thấy sản phẩm nào phù hợp với từ khóa tìm kiếm
              </Text>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Xóa sản phẩm
            </AlertDialogHeader>

            <AlertDialogBody>
              Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}"? Hành
              động này không thể hoàn tác.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Hủy
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Xóa
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ProductListPage;
