import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Divider,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { ArrowLeft, Printer, Mail } from "lucide-react";

const SalesDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - sẽ được thay thế bằng API calls
  const mockInvoice = {
    id: parseInt(id),
    code: "#20240115001",
    customer: {
      name: "Nguyễn Văn A",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      email: "nguyenvana@email.com",
    },
    date: "2024-01-15",
    items: [
      {
        id: 1,
        productName: "Thép hộp 40x40",
        variantName: "Độ dày 2mm",
        quantity: 100,
        unitPrice: 15000,
        totalPrice: 1500000,
      },
      {
        id: 2,
        productName: "Thép tấm 3mm",
        variantName: "Kích thước 1.2m x 2.4m",
        quantity: 50,
        unitPrice: 80000,
        totalPrice: 4000000,
      },
      {
        id: 3,
        productName: "Thép ống 50mm",
        variantName: "Độ dày 3mm",
        quantity: 200,
        unitPrice: 25000,
        totalPrice: 5000000,
      },
    ],
    subtotal: 10500000,
    discount: 500000,
    finalAmount: 10000000,
    paymentMethod: "Tiền mặt",
    paymentStatus: "paid",
    notes: "Giao hàng vào ngày 20/01/2024",
  };

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

  const handlePrint = () => {
    // TODO: Implement print functionality
    window.print();
  };

  const handleSendEmail = () => {
    // TODO: Implement email functionality
    console.log("Send email to:", mockInvoice.customer.email);
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <HStack justify="space-between">
          <HStack>
            <Button
              leftIcon={<ArrowLeft size={16} />}
              variant="ghost"
              onClick={() => navigate("/sales/list")}
            >
              Quay lại
            </Button>
            <Box>
              <Text fontSize="2xl" fontWeight="bold">
                Chi tiết hoá đơn
              </Text>
              <Text color="gray.600">
                Mã hoá đơn: {mockInvoice.code}
              </Text>
            </Box>
          </HStack>
          <HStack>
            <Button
              leftIcon={<Printer size={16} />}
              onClick={handlePrint}
            >
              In hoá đơn
            </Button>
            <Button
              leftIcon={<Mail size={16} />}
              variant="outline"
              onClick={handleSendEmail}
            >
              Gửi email
            </Button>
          </HStack>
        </HStack>

        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Invoice Information */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  {/* Customer Information */}
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Thông tin khách hàng
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">
                          Họ và tên
                        </Text>
                        <Text>{mockInvoice.customer.name}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">
                          Số điện thoại
                        </Text>
                        <Text>{mockInvoice.customer.phone}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">
                          Email
                        </Text>
                        <Text>{mockInvoice.customer.email}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">
                          Địa chỉ
                        </Text>
                        <Text>{mockInvoice.customer.address}</Text>
                      </Box>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Invoice Items */}
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Danh sách sản phẩm
                    </Text>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Sản phẩm</Th>
                            <Th>Phân loại</Th>
                            <Th isNumeric>Số lượng</Th>
                            <Th isNumeric>Đơn giá</Th>
                            <Th isNumeric>Thành tiền</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {mockInvoice.items.map((item) => (
                            <Tr key={item.id}>
                              <Td fontWeight="medium">{item.productName}</Td>
                              <Td>{item.variantName}</Td>
                              <Td isNumeric>{item.quantity}</Td>
                              <Td isNumeric>
                                {item.unitPrice.toLocaleString("vi-VN")} VNĐ
                              </Td>
                              <Td isNumeric fontWeight="bold">
                                {item.totalPrice.toLocaleString("vi-VN")} VNĐ
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Invoice Summary */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="bold">
                    Thông tin hoá đơn
                  </Text>

                  <Box>
                    <Text fontWeight="medium" color="gray.600">
                      Mã hoá đơn
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {mockInvoice.code}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" color="gray.600">
                      Ngày tạo
                    </Text>
                    <Text>{mockInvoice.date}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" color="gray.600">
                      Trạng thái thanh toán
                    </Text>
                    <Badge colorScheme={getStatusColor(mockInvoice.paymentStatus)}>
                      {getStatusText(mockInvoice.paymentStatus)}
                    </Badge>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" color="gray.600">
                      Hình thức thanh toán
                    </Text>
                    <Text>{mockInvoice.paymentMethod}</Text>
                  </Box>

                  <Divider />

                  {/* Payment Summary */}
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={3}>
                      Tổng kết thanh toán
                    </Text>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text>Thành tiền:</Text>
                        <Text>{mockInvoice.subtotal.toLocaleString("vi-VN")} VNĐ</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Giảm giá:</Text>
                        <Text color="red.500">
                          -{mockInvoice.discount.toLocaleString("vi-VN")} VNĐ
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontWeight="bold" fontSize="lg">
                          Tổng cộng:
                        </Text>
                        <Text fontWeight="bold" fontSize="lg" color="blue.500">
                          {mockInvoice.finalAmount.toLocaleString("vi-VN")} VNĐ
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {mockInvoice.notes && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontWeight="medium" color="gray.600" mb={2}>
                          Ghi chú
                        </Text>
                        <Text>{mockInvoice.notes}</Text>
                      </Box>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default SalesDetailPage;


