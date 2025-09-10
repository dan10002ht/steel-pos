import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SalesCreatePage from "./SalesCreatePage";
import SalesListPage from "./SalesListPage";
import SalesDetailPage from "./SalesDetailPage";
import SalesEditPage from "./SalesEditPage";
import InvoicePrintPage from "./InvoicePrintPage";

const SalesRouter = () => {
  return (
    <Routes>
      <Route path="create" element={<SalesCreatePage />} />
      <Route path="list" element={<SalesListPage />} />
      <Route path="detail/:id" element={<SalesDetailPage />} />
      <Route path="edit/:id" element={<SalesEditPage />} />
      <Route path="invoice/:id/print" element={<InvoicePrintPage />} />
      <Route path="*" element={<Navigate to="create" replace />} />
    </Routes>
  );
};

export default SalesRouter;
