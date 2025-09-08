import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetchApi } from "../../hooks/useFetchApi";
import { useEditApi } from "../../hooks/useEditApi";
import CustomerForm from "../../features/customers/components/CustomerForm";
import Page from "../../components/organisms/Page";
import { Spinner, VStack, Text, Alert, AlertIcon, AlertTitle, AlertDescription, Box, useToast } from "@chakra-ui/react";

const CustomerEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch customer data for editing
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

  // Edit customer mutation
  const editCustomerMutation = useEditApi("/customers", {
    invalidateQueries: [["customers"], ["customer", id]], // Invalidate specific customer detail
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Khách hàng đã được cập nhật thành công.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Navigate to customer list page on success
      navigate("/customers");
    },
    onError: (error) => {
      toast({
        title: "Lỗi!",
        description: error.message || "Không thể cập nhật khách hàng. Vui lòng thử lại.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = async (formData) => {
    try {
      await editCustomerMutation.mutateAsync({
        id: parseInt(id),
        data: formData,
      });
      // Navigation is handled in onSuccess callback
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  if (isLoadingCustomer) {
    return (
      <Page
        title="Chỉnh sửa khách hàng"
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
        title="Chỉnh sửa khách hàng"
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
        title="Chỉnh sửa khách hàng"
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

  return (
    <Page
      title="Chỉnh sửa khách hàng"
      subtitle={`Cập nhật thông tin cho ${customer.name}`}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Khách hàng", href: "/customers" },
        { label: customer.name, href: `/customers/${id}` },
        { label: "Chỉnh sửa", href: `/customers/${id}/edit` },
      ]}
    >
      <CustomerForm
        customer={customer}
        onSubmit={handleSubmit}
        isLoading={editCustomerMutation.isPending}
        title="Chỉnh sửa khách hàng"
        submitText="Cập nhật khách hàng"
      />
    </Page>
  );
};

export default CustomerEditPage;

