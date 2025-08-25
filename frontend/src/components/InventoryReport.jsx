import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Badge,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { Search, Download, Printer } from "lucide-react";
import inventoryService from "../services/inventoryService";

const InventoryReport = () => {
  const [inventory, setInventory] = useState({});
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const toast = useToast();

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterAndSortInventory();
  }, [inventory, searchTerm, categoryFilter, sortBy, sortOrder]);

  const loadInventory = () => {
    try {
      const inventoryData = inventoryService.getAllInventory();
      setInventory(inventoryData);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu tồn kho",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filterAndSortInventory = () => {
    let items = [];

    // Flatten inventory data
    Object.entries(inventory).forEach(([productId, variants]) => {
      Object.entries(variants).forEach(([variant, data]) => {
        items.push({
          productId,
          productName: getProductName(productId),
          variant,
          quantity: data.quantity,
          unit: data.unit,
          category: getProductCategory(productId),
        });
      });
    });

    // Apply search filter
    if (searchTerm) {
      items = items.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.variant.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      items = items.filter((item) => item.category === categoryFilter);
    }

    // Apply sorting
    items.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "quantity") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInventory(items);
  };

  const getProductName = (productId) => {
    // Mock product names - in real app, this would come from API
    const productNames = {
      product_1: "Thép ống",
      product_2: "Tấm thép",
    };
    return productNames[productId] || "Sản phẩm không xác định";
  };

  const getProductCategory = (productId) => {
    // Mock categories - in real app, this would come from API
    const categories = {
      product_1: "Thép ống",
      product_2: "Tấm thép",
    };
    return categories[productId] || "Khác";
  };

  const getCategories = () => {
    const categories = new Set();
    Object.keys(inventory).forEach((productId) => {
      categories.add(getProductCategory(productId));
    });
    return Array.from(categories);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getStatusBadge = (quantity) => {
    if (quantity === 0) {
      return <Badge colorScheme="red">Hết hàng</Badge>;
    } else if (quantity < 10) {
      return <Badge colorScheme="orange">Sắp hết</Badge>;
    } else {
      return <Badge colorScheme="green">Còn hàng</Badge>;
    }
  };

  const handleExport = () => {
    // Mock export functionality
    toast({
      title: "Xuất báo cáo",
      description: "Đang xuất báo cáo tồn kho...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handlePrint = () => {
    // Mock print functionality
    window.print();
  };

  const totalItems = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const lowStockItems = filteredInventory.filter(
    (item) => item.quantity < 10
  ).length;
  const outOfStockItems = filteredInventory.filter(
    (item) => item.quantity === 0
  ).length;

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Báo cáo tồn kho</Heading>
          <HStack spacing={3}>
            <Button
              leftIcon={<Download size={16} />}
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              Xuất Excel
            </Button>
            <Button
              leftIcon={<Printer size={16} />}
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              In báo cáo
            </Button>
          </HStack>
        </Flex>

        {/* Summary Cards */}
        <HStack spacing={4}>
          <Card flex="1">
            <CardBody>
              <VStack spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  Tổng sản phẩm
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {totalItems}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card flex="1">
            <CardBody>
              <VStack spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  Tổng số lượng
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {totalQuantity.toLocaleString()}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card flex="1">
            <CardBody>
              <VStack spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  Sắp hết hàng
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {lowStockItems}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card flex="1">
            <CardBody>
              <VStack spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  Hết hàng
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {outOfStockItems}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </HStack>

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <InputGroup flex="1">
                <InputLeftElement>
                  <Search size={16} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="Tất cả danh mục"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                w="200px"
              >
                {getCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th
                    cursor="pointer"
                    onClick={() => handleSort("productName")}
                  >
                    Tên sản phẩm
                    {sortBy === "productName" && (
                      <Text as="span" ml={1}>
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </Text>
                    )}
                  </Th>
                  <Th cursor="pointer" onClick={() => handleSort("variant")}>
                    Phân loại
                    {sortBy === "variant" && (
                      <Text as="span" ml={1}>
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </Text>
                    )}
                  </Th>
                  <Th cursor="pointer" onClick={() => handleSort("category")}>
                    Danh mục
                    {sortBy === "category" && (
                      <Text as="span" ml={1}>
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </Text>
                    )}
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => handleSort("quantity")}
                    textAlign="right"
                  >
                    Tồn kho
                    {sortBy === "quantity" && (
                      <Text as="span" ml={1}>
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </Text>
                    )}
                  </Th>
                  <Th textAlign="center">Trạng thái</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredInventory.map((item, index) => (
                  <Tr key={`${item.productId}-${item.variant}`}>
                    <Td fontWeight="medium">{item.productName}</Td>
                    <Td>{item.variant}</Td>
                    <Td>{item.category}</Td>
                    <Td textAlign="right">
                      {item.quantity.toLocaleString()} {item.unit}
                    </Td>
                    <Td textAlign="center">{getStatusBadge(item.quantity)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {filteredInventory.length === 0 && (
              <Text textAlign="center" py={8} color="gray.500">
                Không tìm thấy sản phẩm nào
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default InventoryReport;
