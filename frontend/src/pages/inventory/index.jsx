import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import InventoryDashboard from "./InventoryDashboard";
import InventoryList from "./InventoryList";
import InventoryCreate from "./InventoryCreate";
import InventoryReport from "./InventoryReport";

const Inventory = () => {
  return (
    <Routes>
      <Route path="list" element={<InventoryList />} />
      <Route path="create" element={<InventoryCreate />} />
      <Route path="report" element={<InventoryReport />} />
      <Route index element={<Navigate to="list" replace />} />
    </Routes>
  );
};

export default Inventory;
