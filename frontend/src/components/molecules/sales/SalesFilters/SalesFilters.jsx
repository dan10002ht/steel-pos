import React from "react";
import { Flex } from "@chakra-ui/react";
import SalesFilterField from "../../../atoms/sales/SalesFilterField";

const SalesFilters = ({ 
  statusFilter, 
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo
}) => {
  const statusOptions = [
    { value: "draft", label: "Nháp" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Chờ thanh toán" },
    { value: "partial", label: "Còn lại" },
    { value: "paid", label: "Đã thanh toán" },
    { value: "refunded", label: "Đã hoàn tiền" }
  ];

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      gap={4}
      wrap="wrap"
      mb={4}
    >
      <SalesFilterField
        type="select"
        label="Trạng thái hoá đơn"
        value={statusFilter}
        onChange={setStatusFilter}
        options={statusOptions}
        placeholder="Tất cả"
      />

      <SalesFilterField
        type="select"
        label="Trạng thái thanh toán"
        value={paymentStatusFilter}
        onChange={setPaymentStatusFilter}
        options={paymentStatusOptions}
        placeholder="Tất cả"
      />

      <SalesFilterField
        type="date"
        label="Từ ngày"
        value={dateFrom}
        onChange={setDateFrom}
      />

      <SalesFilterField
        type="date"
        label="Đến ngày"
        value={dateTo}
        onChange={setDateTo}
      />
    </Flex>
  );
};

export default SalesFilters;
