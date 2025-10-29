import React from 'react';
import Page from '../../components/organisms/Page';
import ImportOrderForm from '../../features/import-orders/components/ImportOrderForm/ImportOrderForm';
import { useNavigate } from 'react-router-dom';

const InventoryCreate = () => {
  const navigate = useNavigate();
  return (
    <Page
      title='Tạo đơn nhập kho'
      subtitle='Tạo đơn nhập kho mới và quản lý thông tin nhập hàng'
    >
      <ImportOrderForm onNavigateToList={() => navigate('/inventory')} />
    </Page>
  );
};

export default InventoryCreate;
