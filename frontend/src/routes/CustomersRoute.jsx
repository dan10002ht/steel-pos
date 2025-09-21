import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerListPage from '../pages/customers/CustomerListPage';
import CustomerCreatePage from '../pages/customers/CustomerCreatePage';
import CustomerDetailPage from '../pages/customers/CustomerDetailPage';

const CustomersRoute = () => {
  return (
    <Routes>
      <Route index element={<CustomerListPage />} />
      <Route path='create' element={<CustomerCreatePage />} />
      <Route path=':id' element={<CustomerDetailPage />} />
    </Routes>
  );
};

export default CustomersRoute;
