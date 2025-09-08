import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerListPage from '../pages/customers/CustomerListPage';
import CustomerCreatePage from '../pages/customers/CustomerCreatePage';
import CustomerDetailPage from '../pages/customers/CustomerDetailPage';
import CustomerEditPage from '../pages/customers/CustomerEditPage';

const CustomersRoute = () => {
  return (
    <Routes>
      <Route index element={<CustomerListPage />} />
      <Route path='create' element={<CustomerCreatePage />} />
      <Route path=':id' element={<CustomerDetailPage />} />
      <Route path=':id/edit' element={<CustomerEditPage />} />
    </Routes>
  );
};

export default CustomersRoute;
