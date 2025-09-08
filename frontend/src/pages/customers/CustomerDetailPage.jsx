import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  Edit,
  Phone,
  MapPin,
  Calendar,
  User,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useFetchApi } from "../../hooks/useFetchApi";
import Page from "../../components/organisms/Page";

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch customer data
  const {
    data: customer,
    isLoading: isLoadingCustomer,
    error: customerError,
  } = useFetchApi(
    ["customer", id],
    `/customers/${id}`,
    {
      enabled: !!id,
    }
  );

  // Fetch customer invoices (if available)
  const {
    data: invoices,
    isLoading: isLoadingInvoices,
  } = useFetchApi(
    ["customer", id, "invoices"],
    `/customers/${id}/invoices`,
    {
      enabled: !!id,
    }
  );

  if (isLoadingCustomer) {
    return (
      <Page
        title="Chi tiết khách hàng"
        subtitle="Đang tải thông tin khách hàng..."
      >
        <VStack spacing={4} align="center" justify="center" minH="400px">
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">Đang tải dữ liệu...</Text>
        </VStack>
      </Page>
    );
  }

  if (customerError) {
    return (
      <Page
        title="Chi tiết khách hàng"
        subtitle="Không thể tải thông tin khách hàng"
      >
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Lỗi!</AlertTitle>
            <AlertDescription>
              {customerError.message || "Không thể tải thông tin khách hàng. Vui lòng thử lại."}
            </AlertDescription>
          </Box>
        </Alert>
      </Page>
    );
  }

  if (!customer) {
    return (
      <Page
        title="Chi tiết khách hàng"
        subtitle="Không tìm thấy khách hàng"
      >
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Cảnh báo!</AlertTitle>
            <AlertDescription>
              Không tìm thấy khách hàng với ID này.
            </AlertDescription>
          </Box>
        </Alert>
      </Page>
    );
  }

  const formatPhoneNumber = (phone) => {
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate customer stats
  const totalInvoices = invoices?.length || 0;
  const totalSpent = invoices?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

  return (
    <Page
      title="Chi tiết khách hàng"
      subtitle={`Thông tin chi tiết về ${customer.name}`}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Khách hàng", href: "/customers" },
        { label: customer.name, href: `/customers/${id}` },
      ]}
      primaryActions={[
        {
          label: "Chỉnh sửa",
          onClick: () => navigate(`/customers/${id}/edit`),
          colorScheme: "blue",
          leftIcon: <Edit size={16} />,
        },
      ]}
    >
      <VStack spacing={6} align="stretch">
        {/* Customer Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Trạng thái</StatLabel>
                <StatNumber>
                  <Badge
                    colorScheme={customer.is_active ? "green" : "red"}
                    variant="subtle"
                    fontSize="sm"
                  >
                    {customer.is_active ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </StatNumber>
                <StatHelpText>
                  <User size={14} />
                  Khách hàng
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Tổng hóa đơn</StatLabel>
                <StatNumber>{totalInvoices}</StatNumber>
                <StatHelpText>
                  <ShoppingCart size={14} />
                  Hóa đơn đã mua
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Tổng chi tiêu</StatLabel>
                <StatNumber>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(totalSpent)}
                </StatNumber>
                <StatHelpText>
                  <DollarSign size={14} />
                  Tổng tiền đã chi
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">
              Thông tin khách hàng
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} align="start">
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Tên khách hàng
                  </Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {customer.name}
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    ID khách hàng
                  </Text>
                  <Text fontSize="lg" fontFamily="mono">
                    #{customer.id}
                  </Text>
                </Box>
              </HStack>

              <Divider />

              <HStack spacing={4} align="start">
                <Box flex="1">
                  <HStack spacing={2} mb={1}>
                    <Phone size={16} color="gray.500" />
                    <Text fontSize="sm" color="gray.600">
                      Số điện thoại
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontFamily="mono">
                    {formatPhoneNumber(customer.phone)}
                  </Text>
                </Box>
                <Box flex="1">
                  <HStack spacing={2} mb={1}>
                    <Calendar size={16} color="gray.500" />
                    <Text fontSize="sm" color="gray.600">
                      Ngày tạo
                    </Text>
                  </HStack>
                  <Text fontSize="md">
                    {formatDate(customer.created_at)}
                  </Text>
                </Box>
              </HStack>

              {customer.address && (
                <>
                  <Divider />
                  <Box>
                    <HStack spacing={2} mb={1}>
                      <MapPin size={16} color="gray.500" />
                      <Text fontSize="sm" color="gray.600">
                        Địa chỉ
                      </Text>
                    </HStack>
                    <Text fontSize="md">
                      {customer.address}
                    </Text>
                  </Box>
                </>
              )}

              <Divider />

              <HStack spacing={4} align="start">
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Cập nhật lần cuối
                  </Text>
                  <Text fontSize="md">
                    {formatDate(customer.updated_at)}
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Người tạo
                  </Text>
                  <Text fontSize="md">
                    {customer.created_by ? `User #${customer.created_by}` : 'Hệ thống'}
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">
                Hóa đơn gần đây
              </Text>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/sales')}
              >
                Xem tất cả
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            {isLoadingInvoices ? (
              <VStack spacing={4} align="center" justify="center" minH="100px">
                <Spinner size="md" color="blue.500" />
                <Text color="gray.500">Đang tải hóa đơn...</Text>
              </VStack>
            ) : totalInvoices === 0 ? (
              <VStack spacing={4} align="center" justify="center" minH="100px">
                <Text color="gray.500" textAlign="center">
                  Khách hàng chưa có hóa đơn nào
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => navigate('/sales/create')}
                >
                  Tạo hóa đơn mới
                </Button>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {invoices.slice(0, 5).map((invoice) => (
                  <HStack
                    key={invoice.id}
                    p={3}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    _hover={{ bg: "gray.50" }}
                    cursor="pointer"
                    onClick={() => navigate(`/sales/${invoice.id}`)}
                  >
                    <Box flex="1">
                      <Text fontWeight="semibold">
                        {invoice.invoice_code}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {formatDate(invoice.created_at)}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight="semibold" color="blue.600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(invoice.total_amount)}
                      </Text>
                      <Badge
                        colorScheme={
                          invoice.payment_status === 'paid' ? 'green' :
                          invoice.payment_status === 'partial' ? 'yellow' : 'red'
                        }
                        variant="subtle"
                        fontSize="xs"
                      >
                        {invoice.payment_status === 'paid' ? 'Đã thanh toán' :
                         invoice.payment_status === 'partial' ? 'Thanh toán một phần' : 'Chưa thanh toán'}
                      </Badge>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Page>
  );
};

export default CustomerDetailPage;

