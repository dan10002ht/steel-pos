import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import CustomerForm from "../../features/customers/components/CustomerForm";
import { useCreateApi } from "../../hooks/useCreateApi";
import Page from "../../components/organisms/Page";

const CustomerCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const createCustomerMutation = useCreateApi("/customers", {
    invalidateQueries: [["customers"]],
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Khách hàng đã được tạo thành công.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/customers");
    },
    onError: (error) => {
      toast({
        title: "Lỗi!",
        description: error.message || "Không thể tạo khách hàng. Vui lòng thử lại.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = async (customerData) => {
    try {
      await createCustomerMutation.mutateAsync(customerData);
    } catch (error) {
      // Error is handled by onError callback
      console.error("Error creating customer:", error);
    }
  };

  return (
    <Page
      title="Tạo khách hàng mới"
      subtitle="Thêm thông tin khách hàng vào hệ thống"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Khách hàng", href: "/customers" },
        { label: "Tạo mới", href: "/customers/create" },
      ]}
    >
      <CustomerForm
        onSubmit={handleSubmit}
        isLoading={createCustomerMutation.isPending}
        title="Tạo khách hàng mới"
        submitText="Tạo khách hàng"
      />
    </Page>
  );
};

export default CustomerCreatePage;
