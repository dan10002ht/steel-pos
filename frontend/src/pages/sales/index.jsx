import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SalesCreatePage from "./SalesCreatePage";
import SalesListPage from "./SalesListPage";
import SalesDetailPage from "./SalesDetailPage";

const SalesRouter = () => {
  return (
    <Routes>
      <Route path="create" element={<SalesCreatePage />} />
      <Route path="list" element={<SalesListPage />} />
      <Route path="detail/:id" element={<SalesDetailPage />} />
      <Route path="*" element={<Navigate to="create" replace />} />
    </Routes>
  );
};

export default SalesRouter;
