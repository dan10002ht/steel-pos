import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Card,
  CardBody,
  Select,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Search, Eye, Edit, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SalesStats from "../../components/sales/SalesStats";

const SalesListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  // Mock data - sẽ được thay thế bằng API calls
  const mockInvoices = [
    {
      id: 1,
      code: "#20240115001",
      customerName: "Nguyễn Văn A",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      date: "2024-01-15",
      itemCount: 3,
      totalAmount: 1500000,
      paymentStatus: "paid",
    },
    {
      id: 2,
      code: "#20240115002",
      customerName: "Trần Thị B",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      date: "2024-01-15",
      itemCount: 2,
      totalAmount: 800000,
      paymentStatus: "pending",
    },
    {
      id: 3,
      code: "#20240114001",
      customerName: "Lê Văn C",
      phone: "0555666777",
      address: "789 Đường DEF, Quận 3, TP.HCM",
      date: "2024-01-14",
      itemCount: 5,
      totalAmount: 2500000,
      paymentStatus: "paid",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "green";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "pending":
        return "Chờ thanh toán";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/sales/detail/${id}`);
  };

  const handleEdit = (id) => {
    // TODO: Implement edit functionality
    toast({
      title: "Chức năng đang phát triển",
      description: "Tính năng chỉnh sửa sẽ được cập nhật sau",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDelete = (id) => {
    // TODO: Implement delete functionality
    toast({
      title: "Chức năng đang phát triển",
      description: "Tính năng xóa sẽ được cập nhật sau",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredInvoices = mockInvoices.filter((invoice) => {
    // Search filter
    const matchesSearch =
      invoice.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.phone.includes(searchTerm);

    // Status filter
    const matchesStatus =
      !statusFilter || invoice.paymentStatus === statusFilter;

    // Date filter
    const matchesDate =
      (!dateFrom || invoice.date >= dateFrom) &&
      (!dateTo || invoice.date <= dateTo);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Danh sách bán hàng
          </Text>
          <Text color="gray.600">
            Quản lý và theo dõi tất cả hoá đơn bán hàng
          </Text>
        </Box>

        {/* Sales Stats */}
        <Card mb={6}>
          <CardBody>
            <SalesStats invoices={mockInvoices} />
          </CardBody>
        </Card>

        {/* Search and Actions */}
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <InputGroup maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <Search size={20} />
                </InputLeftElement>
                <Input
                  placeholder="Tìm kiếm theo mã hoá đơn, tên khách hàng, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Button
                leftIcon={<Plus size={16} />}
                colorScheme="blue"
                onClick={() => navigate("/sales/create")}
              >
                Tạo hoá đơn mới
              </Button>
            </HStack>

            {/* Filters */}
            <HStack spacing={4} mb={4}>
              <FormControl maxW="200px">
                <FormLabel fontSize="sm">Trạng thái</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  placeholder="Tất cả"
                >
                  <option value="paid">Đã thanh toán</option>
                  <option value="pending">Chờ thanh toán</option>
                  <option value="cancelled">Đã hủy</option>
                </Select>
              </FormControl>

              <FormControl maxW="200px">
                <FormLabel fontSize="sm">Từ ngày</FormLabel>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </FormControl>

              <FormControl maxW="200px">
                <FormLabel fontSize="sm">Đến ngày</FormLabel>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </FormControl>
            </HStack>

            {/* Table */}
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Mã hoá đơn</Th>
                    <Th>Tên khách hàng</Th>
                    <Th>Số điện thoại</Th>
                    <Th>Địa chỉ</Th>
                    <Th>Ngày mua hàng</Th>
                    <Th>Số lượng SP</Th>
                    <Th>Tổng tiền</Th>
                    <Th>Trạng thái</Th>
                    <Th>Hành động</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredInvoices.map((invoice) => (
                    <Tr key={invoice.id}>
                      <Td fontWeight="medium">{invoice.code}</Td>
                      <Td>{invoice.customerName}</Td>
                      <Td>{invoice.phone}</Td>
                      <Td maxW="200px" isTruncated>
                        {invoice.address}
                      </Td>
                      <Td>{invoice.date}</Td>
                      <Td>{invoice.itemCount}</Td>
                      <Td fontWeight="medium">
                        {invoice.totalAmount.toLocaleString("vi-VN")} VNĐ
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(invoice.paymentStatus)}
                        >
                          {getStatusText(invoice.paymentStatus)}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            size="sm"
                            icon={<Eye size={16} />}
                            onClick={() => handleViewDetail(invoice.id)}
                            colorScheme="blue"
                            variant="ghost"
                            title="Xem chi tiết"
                          />
                          <IconButton
                            size="sm"
                            icon={<Edit size={16} />}
                            onClick={() => handleEdit(invoice.id)}
                            colorScheme="orange"
                            variant="ghost"
                            title="Chỉnh sửa"
                          />
                          <IconButton
                            size="sm"
                            icon={<Trash2 size={16} />}
                            onClick={() => handleDelete(invoice.id)}
                            colorScheme="red"
                            variant="ghost"
                            title="Xóa"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default SalesListPage;
