import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Flex,
  Spacer,
  Text,
  useToast,
  Card,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Check,
  MoreVertical,
  Download,
  Printer,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Page from "../../components/organisms/Page";

const InventoryList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState("importDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const toast = useToast();

  // Mock data
  const [importOrders, setImportOrders] = useState([
    {
      id: 1,
      importCode: "0001",
      supplier: "Công ty Thép ABC",
      importDate: "2024-01-15",
      totalValue: 150000000,
      productCount: 250,
      status: "pending",
      products: [
        { name: "Ống phi", variant: "Phi 12", quantity: 100, unit: "m" },
        { name: "Thép hộp", variant: "40x40", quantity: 150, unit: "m" },
      ],
    },
    {
      id: 2,
      importCode: "0002",
      supplier: "Công ty Thép XYZ",
      importDate: "2024-01-14",
      totalValue: 89000000,
      productCount: 180,
      status: "approved",
      products: [
        { name: "Thép tấm", variant: "3mm", quantity: 80, unit: "m²" },
        { name: "Ống phi", variant: "Phi 16", quantity: 100, unit: "m" },
      ],
    },
    {
      id: 3,
      importCode: "0003",
      supplier: "Công ty Thép DEF",
      importDate: "2024-01-13",
      totalValue: 220000000,
      productCount: 320,
      status: "pending",
      products: [
        { name: "Thép hộp", variant: "50x50", quantity: 200, unit: "m" },
        { name: "Thép tấm", variant: "5mm", quantity: 120, unit: "m²" },
      ],
    },
  ]);

  const suppliers = [
    "Công ty Thép ABC",
    "Công ty Thép XYZ",
    "Công ty Thép DEF",
    "Công ty Thép GHI",
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return <Badge colorScheme="green">Đã phê duyệt</Badge>;
    }
    return <Badge colorScheme="orange">Chờ phê duyệt</Badge>;
  };

  const handleApproval = (order) => {
    setSelectedOrder(order);
    setIsApprovalModalOpen(true);
  };

  const handleApprovalConfirmed = (orderId, approvalNote) => {
    // Update order status
    setImportOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: "approved", approvalNote }
          : order
      )
    );
  };

  const handleDelete = (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn nhập hàng này?")) {
      setImportOrders((prev) => prev.filter((order) => order.id !== orderId));
      toast({
        title: "Thành công",
        description: "Đơn nhập hàng đã được xóa",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (orderId) => {
    // Navigate to edit page or open edit modal
    toast({
      title: "Thông báo",
      description: "Chức năng chỉnh sửa sẽ được implement sau",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Filter and sort data
  const filteredData = importOrders
    .filter((order) => {
      const matchesSearch =
        order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.importCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesSupplier =
        !supplierFilter || order.supplier === supplierFilter;

      // Date range filter
      const orderDate = new Date(order.importDate);
      const matchesDateRange =
        (!dateRange.startDate || orderDate >= new Date(dateRange.startDate)) &&
        (!dateRange.endDate || orderDate <= new Date(dateRange.endDate));

      return (
        matchesSearch && matchesStatus && matchesSupplier && matchesDateRange
      );
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case "supplier":
          aValue = a.supplier;
          bValue = b.supplier;
          break;
        case "importDate":
          aValue = new Date(a.importDate);
          bValue = new Date(b.importDate);
          break;
        case "totalValue":
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case "productCount":
          aValue = a.productCount;
          bValue = b.productCount;
          break;
        case "importCode":
          aValue = a.importCode;
          bValue = b.importCode;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.importDate;
          bValue = b.importDate;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <Page
      title="Quản lý kho"
      subtitle="Danh sách đơn nhập hàng và quản lý tồn kho"
      primaryActions={[
        {
          label: "Tạo đơn nhập hàng",
          onClick: () => navigate("/inventory/create"),
          colorScheme: "blue",
          leftIcon: <Plus size={16} />,
        },
      ]}
      secondaryActions={[
        {
          label: "Xuất báo cáo",
          onClick: () => {
            toast({
              title: "Thông báo",
              description: "Chức năng xuất báo cáo sẽ được implement sau",
              status: "info",
              duration: 3000,
              isClosable: true,
            });
          },
          variant: "outline",
          leftIcon: <Download size={16} />,
        },
      ]}
    >
      <Box w="1400px" maxW="100%" mx="auto">
        {/* Filters Section */}
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Desktop: Row layout */}
              <HStack
                spacing={3}
                align="flex-end"
                display={{ base: "none", md: "flex" }}
                wrap="wrap"
              >
                {/* Search Input */}
                <FormControl flex="1">
                  <FormLabel fontSize="sm">Tìm kiếm</FormLabel>
                  <InputGroup size="sm">
                    <Input
                      placeholder="Tìm kiếm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <InputRightElement>
                      <Search size={16} color="gray.500" />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Status Filter */}
                <FormControl w="fit-content">
                  <FormLabel fontSize="sm">Trạng thái</FormLabel>
                  <Select
                    placeholder="Tất cả"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="sm"
                    w="120px"
                  >
                    <option value="pending">Chờ phê duyệt</option>
                    <option value="approved">Đã phê duyệt</option>
                  </Select>
                </FormControl>

                {/* Supplier Filter */}
                <FormControl w="fit-content">
                  <FormLabel fontSize="sm">Nhà cung cấp</FormLabel>
                  <Select
                    placeholder="Tất cả"
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    size="sm"
                    w="150px"
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Date Range Filter */}
                <FormControl w="fit-content">
                  <FormLabel fontSize="sm">Từ ngày</FormLabel>
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                    size="sm"
                    w="130px"
                  />
                </FormControl>

                <FormControl w="fit-content">
                  <FormLabel fontSize="sm">Đến ngày</FormLabel>
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    size="sm"
                    w="130px"
                  />
                </FormControl>

                {/* Sort Field */}
                <FormControl w="fit-content">
                  <FormLabel fontSize="sm">Sắp xếp theo</FormLabel>
                  <Select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    size="sm"
                    w="120px"
                  >
                    <option value="importDate">Ngày nhập kho</option>
                    <option value="importCode">Mã đơn</option>
                    <option value="supplier">Nhà cung cấp</option>
                    <option value="totalValue">Tổng giá trị</option>
                    <option value="productCount">Số lượng SP</option>
                    <option value="status">Trạng thái</option>
                  </Select>
                </FormControl>

                {/* Sort Direction */}
                <FormControl w="fit-content">
                  <FormLabel fontSize="sm">Thứ tự</FormLabel>
                  <Select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value)}
                    size="sm"
                    w="80px"
                  >
                    <option value="desc">Giảm dần</option>
                    <option value="asc">Tăng dần</option>
                  </Select>
                </FormControl>

                {/* Clear Filters Button */}
                <Button
                  size="sm"
                  variant="outline"
                  w="fit-content"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setSupplierFilter("");
                    setDateRange({ startDate: "", endDate: "" });
                    setSortField("importDate");
                    setSortDirection("desc");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </HStack>

              {/* Mobile: Column layout */}
              <VStack
                spacing={3}
                align="stretch"
                display={{ base: "flex", md: "none" }}
              >
                {/* Search Input */}
                <FormControl>
                  <FormLabel fontSize="sm">Tìm kiếm</FormLabel>
                  <InputGroup size="sm">
                    <Input
                      placeholder="Tìm kiếm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <InputRightElement>
                      <Search size={16} color="gray.500" />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Status Filter */}
                <FormControl>
                  <FormLabel fontSize="sm">Trạng thái</FormLabel>
                  <Select
                    placeholder="Tất cả"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="sm"
                  >
                    <option value="pending">Chờ phê duyệt</option>
                    <option value="approved">Đã phê duyệt</option>
                  </Select>
                </FormControl>

                {/* Supplier Filter */}
                <FormControl>
                  <FormLabel fontSize="sm">Nhà cung cấp</FormLabel>
                  <Select
                    placeholder="Tất cả"
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    size="sm"
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Date Range Filter */}
                <HStack spacing={2}>
                  <FormControl>
                    <FormLabel fontSize="sm">Từ ngày</FormLabel>
                    <Input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, startDate: e.target.value })
                      }
                      size="sm"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Đến ngày</FormLabel>
                    <Input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, endDate: e.target.value })
                      }
                      size="sm"
                    />
                  </FormControl>
                </HStack>

                {/* Sort Controls */}
                <HStack spacing={2}>
                  <FormControl>
                    <FormLabel fontSize="sm">Sắp xếp theo</FormLabel>
                    <Select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                      size="sm"
                    >
                      <option value="importDate">Ngày nhập kho</option>
                      <option value="importCode">Mã đơn</option>
                      <option value="supplier">Nhà cung cấp</option>
                      <option value="totalValue">Tổng giá trị</option>
                      <option value="productCount">Số lượng SP</option>
                      <option value="status">Trạng thái</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Thứ tự</FormLabel>
                    <Select
                      value={sortDirection}
                      onChange={(e) => setSortDirection(e.target.value)}
                      size="sm"
                    >
                      <option value="desc">Giảm dần</option>
                      <option value="asc">Tăng dần</option>
                    </Select>
                  </FormControl>
                </HStack>

                {/* Clear Filters Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setSupplierFilter("");
                    setDateRange({ startDate: "", endDate: "" });
                    setSortField("importDate");
                    setSortDirection("desc");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Mã đơn</Th>
                    <Th>Nhà cung cấp</Th>
                    <Th>Ngày nhập kho</Th>
                    <Th isNumeric>Tổng giá trị</Th>
                    <Th isNumeric>SL SP</Th>
                    <Th>Trạng thái</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedData.map((order) => (
                    <Tr key={order.id}>
                      <Td>{order.importCode}</Td>
                      <Td>{order.supplier}</Td>
                      <Td>{formatDate(order.importDate)}</Td>
                      <Td isNumeric>{formatCurrency(order.totalValue)}</Td>
                      <Td isNumeric>{order.productCount}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            order.status === "approved" ? "green" : "orange"
                          }
                        >
                          {order.status === "approved"
                            ? "Đã phê duyệt"
                            : "Chờ phê duyệt"}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          {order.status === "pending" && (
                            <IconButton
                              icon={<Check size={18} />}
                              size="sm"
                              colorScheme="green"
                              aria-label="Phê duyệt"
                              onClick={() => handleApproval(order)}
                            />
                          )}
                          <IconButton
                            icon={<Edit size={18} />}
                            size="sm"
                            aria-label="Sửa"
                            onClick={() => handleEdit(order.id)}
                          />
                          <IconButton
                            icon={<Trash2 size={18} />}
                            size="sm"
                            colorScheme="red"
                            aria-label="Xóa"
                            onClick={() => handleDelete(order.id)}
                          />
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<MoreVertical size={18} />}
                              size="sm"
                              variant="ghost"
                              aria-label="More actions"
                            />
                            <MenuList>
                              <MenuItem icon={<Download size={16} />}>
                                Xuất Excel
                              </MenuItem>
                              <MenuItem icon={<Printer size={16} />}>
                                In phiếu
                              </MenuItem>
                              <MenuDivider />
                              <MenuItem>Xem chi tiết</MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Pagination */}
            <Flex justify="space-between" align="center" mt={6}>
              <HStack spacing={4}>
                <Text fontSize="sm" color="gray.600">
                  Hiển thị {startIndex + 1} -{" "}
                  {Math.min(startIndex + pageSize, filteredData.length)} trên{" "}
                  {filteredData.length} mục
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    Hiển thị:
                  </Text>
                  <Select
                    size="sm"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    w="70px"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Select>
                  <Text fontSize="sm" color="gray.600">
                    mục/trang
                  </Text>
                </HStack>
              </HStack>

              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(1)}
                  isDisabled={currentPage === 1}
                >
                  Đầu
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  Trước
                </Button>
                <HStack spacing={1}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <Text>...</Text>
                        )}
                        <Button
                          size="sm"
                          variant={currentPage === page ? "solid" : "outline"}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </HStack>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                >
                  Sau
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(totalPages)}
                  isDisabled={currentPage === totalPages}
                >
                  Cuối
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </Box>
    </Page>
  );
};

export default InventoryList;
