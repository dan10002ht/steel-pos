import React from 'react';
import { useNavigate } from 'react-router-dom';
import Page from '../components/organisms/Page';
import ImportOrderForm from '../features/import-orders/components/ImportOrderForm/ImportOrderForm';

const ImportOrderPage = () => {
  const navigate = useNavigate();

  const handleNavigateToList = () => {
    navigate('/import-orders');
  };

  return (
    <Page 
      title="Tạo đơn nhập kho"
      subtitle="Tạo đơn nhập kho mới và quản lý thông tin nhập hàng"
    >
      <ImportOrderForm onNavigateToList={handleNavigateToList} />
    </Page>
  );
};

export default ImportOrderPage;
