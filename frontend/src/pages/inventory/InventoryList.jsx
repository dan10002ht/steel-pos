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
import Pagination from "../../components/atoms/Pagination";
import { useFetchApi } from "../../hooks/useFetchApi";
import { useEditApi } from "../../hooks/useEditApi";
import { useDeleteApi } from "../../hooks/useDeleteApi";
import { importOrderService } from "../../services/importOrderService";
import { useDebounce } from "../../hooks/useDebounce";

const InventoryList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [approvalNote, setApprovalNote] = useState("");
  const toast = useToast();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (currentPage) queryParams.append("page", currentPage);
  if (pageSize) queryParams.append("limit", pageSize);
  if (statusFilter) queryParams.append("status", statusFilter);
  if (supplierFilter) queryParams.append("supplier_name", supplierFilter);
  if (debouncedSearchTerm) queryParams.append("search", debouncedSearchTerm);

  const queryString = queryParams.toString();
  const apiUrl = `/import-orders${queryString ? `?${queryString}` : ""}`;

  // Fetch import orders
  const {
    data: importOrdersData,
    error
  } = useFetchApi(
    ["import-orders", { page: currentPage, limit: pageSize, status: statusFilter, supplierName: supplierFilter, search: debouncedSearchTerm }],
    apiUrl
  );

  // Approve import order mutation
  const approveMutation = useEditApi("/import-orders", {
    method: "POST",
    invalidateQueries: [["import-orders"]],
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đơn nhập hàng đã được phê duyệt",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsApprovalModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể phê duyệt đơn nhập hàng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  });

  // Delete import order mutation
  const deleteMutation = useDeleteApi("/import-orders", {
    invalidateQueries: [["import-orders"]],
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đơn nhập hàng đã được xóa",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa đơn nhập hàng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  });

  // Transform data from API response
  const importOrders = importOrdersData?.import_orders?.map(order => 
    importOrderService.transformBackendToFrontend(order)
  ) || [];
  const totalCount = importOrdersData?.total || 0;

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
    setApprovalNote("");
    setIsApprovalModalOpen(true);
  };

  const handleApprovalConfirmed = () => {
    if (!selectedOrder) return;

    approveMutation.mutate({
      id: selectedOrder.id,
      data: { approval_note: approvalNote }
    });
  };

  const handleDelete = (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn nhập hàng này?")) {
      deleteMutation.mutate(orderId);
    }
  };

  const handleEdit = (orderId) => {
    // Navigate to edit page
    navigate(`/inventory/edit/${orderId}`);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        setCurrentPage(1);
        break;
      case 'status':
        setStatusFilter(value);
        setCurrentPage(1);
        break;
      case 'supplier':
        setSupplierFilter(value);
        setCurrentPage(1);
        break;
      case 'page':
        setCurrentPage(value);
        break;
      case 'limit':
        setPageSize(value);
        setCurrentPage(1);
        break;
      default:
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSupplierFilter("");
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách đơn nhập hàng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [error, toast]);

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
      <Box w="100%" maxW="100%" mx="auto">
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
                      onChange={(e) => handleFilterChange('search', e.target.value)}
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
                    onChange={(e) => handleFilterChange('status', e.target.value)}
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
                    onChange={(e) => handleFilterChange('supplier', e.target.value)}
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

                {/* Clear Filters Button */}
                <Button
                  size="sm"
                  variant="outline"
                  w="fit-content"
                  onClick={clearFilters}
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
                      onChange={(e) => handleFilterChange('search', e.target.value)}
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
                    onChange={(e) => handleFilterChange('status', e.target.value)}
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
                    onChange={(e) => handleFilterChange('supplier', e.target.value)}
                    size="sm"
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Clear Filters Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearFilters}
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
                  {importOrders.map((order) => (
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
                              isLoading={approveMutation.isPending}
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
                            isLoading={deleteMutation.isPending}
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
            <Box mt={6}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={pageSize}
                onPageChange={(page) => handleFilterChange('page', page)}
                onPageSizeChange={(limit) => handleFilterChange('limit', limit)}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </Box>
          </CardBody>
        </Card>
      </Box>

      {/* Approval Modal */}
      <Modal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Phê duyệt đơn nhập hàng</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Bạn có chắc chắn muốn phê duyệt đơn nhập hàng{" "}
                <strong>{selectedOrder?.importCode}</strong>?
              </Text>
              <FormControl>
                <FormLabel>Ghi chú phê duyệt</FormLabel>
                <Input
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Nhập ghi chú phê duyệt (tùy chọn)"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsApprovalModalOpen(false)}>
              Hủy
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleApprovalConfirmed}
              isLoading={approveMutation.isPending}
            >
              Phê duyệt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Page>
  );
};

export default InventoryList;
