import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InventoryList from '../pages/inventory/InventoryList';
import ImportOrderPage from '../pages/ImportOrderPage';
import InventoryDetail from '../pages/inventory/InventoryDetail';
import InventoryEdit from '../pages/inventory/InventoryEdit';

const InventoryRoute = () => {
  return (
    <Routes>
      <Route index element={<InventoryList />} />
      <Route path='create' element={<ImportOrderPage />} />
      <Route path=':id' element={<InventoryDetail />} />
      <Route path=':id/edit' element={<InventoryEdit />} />
    </Routes>
  );
};

export default InventoryRoute;
