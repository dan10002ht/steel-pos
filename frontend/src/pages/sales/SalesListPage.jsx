import React, { useState } from "react";
import {
  HStack,
  VStack,
  Box,
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
  Card,
  CardBody,
  Select,
  FormControl,
  FormLabel,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
} from "@chakra-ui/react";
import { Search, Eye, Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Page from "../../components/organisms/Page/Page";
import SalesStats from "../../components/sales/SalesStats";
import { useFetchApi } from "../../hooks/useFetchApi";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/atoms/Pagination";
import { formatCurrency } from "../../utils/formatters";
import { 
  getInvoiceStatusColor, 
  getInvoiceStatusText, 
  getPaymentStatusColor, 
  getPaymentStatusWithRemaining 
} from "../../utils/statusHelpers";

const SalesListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const navigate = useNavigate();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch invoices from API
  const { data: invoicesData, error, isPending: isLoading } = useFetchApi(
    [
      'invoices',
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
      paymentStatusFilter,
      dateFrom,
      dateTo
    ],
    `/invoices?page=${currentPage}&limit=${pageSize}&search=${debouncedSearchTerm}&status=${statusFilter}&payment_status=${paymentStatusFilter}`,
    {
      enabled: true,
    }
  );




  const handleViewDetail = (id) => {
    navigate(`/sales/detail/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/sales/edit/${id}`);
  };



  // Extract data from API response
  const invoices = invoicesData?.invoices || [];
  const totalCount = invoicesData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Show loading state
  if (isLoading) {
    return (
      <Page
        title="Danh sách bán hàng"
        subtitle="Quản lý và theo dõi tất cả hoá đơn bán hàng"
      >
        <Flex justify="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      </Page>
    );
  }

  // Show error state
  if (error) {
    return (
      <Page
        title="Danh sách bán hàng"
        subtitle="Quản lý và theo dõi tất cả hoá đơn bán hàng"
      >
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi tải dữ liệu!</AlertTitle>
          <AlertDescription>
            {error.message || "Không thể tải danh sách hoá đơn"}
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title="Danh sách bán hàng"
      subtitle="Quản lý và theo dõi tất cả hoá đơn bán hàng"
      primaryActions={[
        {
          label: "Tạo hoá đơn mới",
          icon: <Plus size={16} />,
          onClick: () => navigate("/sales/create"),
          colorScheme: "blue"
        }
      ]}
    >
      {/* Sales Stats */}
    
          <SalesStats invoices={invoices} />
      
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
          </HStack>

            {/* Filters */}
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={4}
              wrap="wrap"
              mb={4}
            >
              <FormControl minW={{ base: "100%", sm: "200px" }} maxW={{ base: "100%", md: "200px" }}>
                <FormLabel fontSize="sm">Trạng thái hoá đơn</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  placeholder="Tất cả"
                >
                  <option value="draft">Nháp</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="cancelled">Đã hủy</option>
                </Select>
              </FormControl>

              <FormControl minW={{ base: "100%", sm: "200px" }} maxW={{ base: "100%", md: "200px" }}>
                <FormLabel fontSize="sm">Trạng thái thanh toán</FormLabel>
                <Select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  placeholder="Tất cả"
                >
                  <option value="pending">Chờ thanh toán</option>
                  <option value="partial">Còn lại</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </Select>
              </FormControl>

              <FormControl minW={{ base: "100%", sm: "200px" }} maxW={{ base: "100%", md: "200px" }}>
                <FormLabel fontSize="sm">Từ ngày</FormLabel>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </FormControl>

              <FormControl minW={{ base: "100%", sm: "200px" }} maxW={{ base: "100%", md: "200px" }}>
                <FormLabel fontSize="sm">Đến ngày</FormLabel>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </FormControl>
            </Flex>

            {/* Table */}
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Mã hoá đơn</Th>
                    <Th>Tên khách hàng</Th>
                    <Th>Số điện thoại</Th>
                    <Th>Địa chỉ</Th>
                    <Th>Ngày tạo</Th>
                    <Th>Tổng tiền</Th>
                    <Th>Trạng thái</Th>
                    <Th>Thanh toán</Th>
                    <Th>Hành động</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {invoices.length === 0 ? (
                    <Tr>
                      <Td colSpan={9} textAlign="center" py={8}>
                        <Text color="gray.500">Không có hoá đơn nào</Text>
                      </Td>
                    </Tr>
                  ) : (
                    invoices.map((invoice) => (
                      <Tr key={invoice.id}>
                        <Td fontWeight="medium">{invoice.invoice_code}</Td>
                        <Td>{invoice.customer_name}</Td>
                        <Td>{invoice.customer_phone}</Td>
                        <Td maxW="200px" isTruncated>
                          {invoice.customer_address || "Không có địa chỉ"}
                        </Td>
                        <Td>
                          {new Date(invoice.created_at).toLocaleDateString("vi-VN")}
                        </Td>
                        <Td fontWeight="medium">
                          {formatCurrency(invoice.total_amount)}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getInvoiceStatusColor(invoice.status)}
                          >
                            {getInvoiceStatusText(invoice.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getPaymentStatusColor(invoice.payment_status)}
                          >
                            {getPaymentStatusWithRemaining(invoice)}
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
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>

            {/* Pagination */}
            {totalPages > 0 && (
              <Box mt={0}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </Box>
            )}
          </CardBody>
        </Card>
    </Page>
  );
};

export default SalesListPage;
