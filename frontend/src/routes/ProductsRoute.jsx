import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductListPage from '../pages/products/ProductListPage';
import CreateProductPage from '../pages/products/CreateProductPage';
import ProductDetailPage from '../pages/products/ProductDetailPage';
import EditProductPage from '../pages/products/EditProductPage';

const ProductsRoute = () => {
  return (
    <Routes>
      <Route index element={<ProductListPage />} />
      <Route path='create' element={<CreateProductPage />} />
      <Route path=':id' element={<ProductDetailPage />} />
      <Route path=':id/edit' element={<EditProductPage />} />
    </Routes>
  );
};

export default ProductsRoute;
