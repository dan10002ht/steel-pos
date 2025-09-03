import React from "react";
import Page from "../../components/organisms/Page";
import ImportOrderForm from "../../features/import-orders/components/ImportOrderForm/ImportOrderForm";

const InventoryCreate = () => {
  return (
    <Page 
      title="Tạo đơn nhập kho"
      subtitle="Tạo đơn nhập kho mới và quản lý thông tin nhập hàng"
    >
      <ImportOrderForm />
    </Page>
  );
};

export default InventoryCreate;
