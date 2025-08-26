import React, { useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from "@chakra-ui/react";
import { Search, MoreVertical, Eye, Edit, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InventoryList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data - sẽ được thay thế bằng API calls
  const inventoryItems = [
    {
      id: 1,
      productName: "Thép hộp 40x40",
      sku: "TH4040",
      category: "Thép hộp",
      currentStock: 1500,
      unit: "m",
      minStock: 100,
      maxStock: 2000,
      unitPrice: 25000,
      status: "in_stock",
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      productName: "Thép tấm 3mm",
      sku: "TT3MM",
      category: "Thép tấm",
      currentStock: 500,
      unit: "kg",
      minStock: 200,
      maxStock: 1000,
      unitPrice: 18000,
      status: "low_stock",
      lastUpdated: "2024-01-14",
    },
    {
      id: 3,
      productName: "Thép ống 50mm",
      sku: "TO50MM",
      category: "Thép ống",
      currentStock: 0,
      unit: "m",
      minStock: 50,
      maxStock: 500,
      unitPrice: 35000,
      status: "out_of_stock",
      lastUpdated: "2024-01-13",
    },
    {
      id: 4,
      productName: "Thép góc 50x50",
      sku: "TG5050",
      category: "Thép góc",
      currentStock: 800,
      unit: "m",
      minStock: 100,
      maxStock: 1500,
      unitPrice: 22000,
      status: "in_stock",
      lastUpdated: "2024-01-12",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "in_stock":
        return "green";
      case "low_stock":
        return "orange";
      case "out_of_stock":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "in_stock":
        return "Còn hàng";
      case "low_stock":
        return "Sắp hết";
      case "out_of_stock":
        return "Hết hàng";
      default:
        return "Không xác định";
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleViewDetails = (id) => {
    navigate(`/products/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/products/${id}/edit`);
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Danh sách tồn kho
          </Heading>
          <Text color="gray.600">
            Quản lý và theo dõi tình trạng tồn kho của tất cả sản phẩm
          </Text>
        </Box>

        {/* Filters and Search */}
        <Card shadow="sm">
          <CardBody>
            <HStack spacing={4} justify="space-between">
              <HStack spacing={4}>
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <Search size={16} />
                  </InputLeftElement>
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Menu>
                  <MenuButton as={Button} variant="outline" size="md">
                    Trạng thái: {filterStatus === "all" ? "Tất cả" : getStatusText(filterStatus)}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => setFilterStatus("all")}>Tất cả</MenuItem>
                    <MenuItem onClick={() => setFilterStatus("in_stock")}>Còn hàng</MenuItem>
                    <MenuItem onClick={() => setFilterStatus("low_stock")}>Sắp hết</MenuItem>
                    <MenuItem onClick={() => setFilterStatus("out_of_stock")}>Hết hàng</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
              <Button
                leftIcon={<Package size={16} />}
                colorScheme="blue"
                onClick={() => navigate("/inventory/create")}
              >
                Tạo đơn nhập
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Inventory Table */}
        <Card shadow="sm">
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Sản phẩm</Th>
                    <Th>SKU</Th>
                    <Th>Danh mục</Th>
                    <Th isNumeric>Tồn kho</Th>
                    <Th isNumeric>Giá đơn vị</Th>
                    <Th>Trạng thái</Th>
                    <Th>Cập nhật</Th>
                    <Th width="50px"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredItems.map((item) => (
                    <Tr key={item.id}>
                      <Td>
                        <VStack align="flex-start" spacing={0}>
                          <Text fontWeight="medium">{item.productName}</Text>
                          <Text fontSize="sm" color="gray.600">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontFamily="mono" fontSize="sm">
                          {item.sku}
                        </Text>
                      </Td>
                      <Td>{item.category}</Td>
                      <Td isNumeric>
                        <Text fontWeight="medium">
                          {item.currentStock.toLocaleString()} {item.unit}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Text fontWeight="medium">
                          {formatCurrency(item.unitPrice)}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {item.lastUpdated}
                        </Text>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<MoreVertical size={16} />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<Eye size={16} />}
                              onClick={() => handleViewDetails(item.id)}
                            >
                              Xem chi tiết
                            </MenuItem>
                            <MenuItem
                              icon={<Edit size={16} />}
                              onClick={() => handleEdit(item.id)}
                            >
                              Chỉnh sửa
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default InventoryList;
