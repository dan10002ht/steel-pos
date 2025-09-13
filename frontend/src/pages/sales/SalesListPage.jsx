import React, { useState, useMemo, useCallback } from 'react';
import {
  HStack,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Page from '@/components/organisms/Page/Page';
import SalesStats from '@/components/molecules/sales/SalesStats';
import SalesTable from '@/components/molecules/sales/SalesTable';
import SalesFilters from '@/components/molecules/sales/SalesFilters';
import SalesSearch from '@/components/molecules/sales/SalesSearch/SalesSearch';
import CancelInvoiceModal from '@/components/molecules/sales/CancelInvoiceModal/CancelInvoiceModal';
import { useFetchApi } from '@/hooks/useFetchApi';
import { useDebounce } from '@/hooks/useDebounce';
import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';

const SalesListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch invoices from API
  const {
    data: invoicesData,
    error,
    isLoading,
    refetch,
  } = useFetchApi(
    [
      'invoices',
      currentPage,
      pageSize,
      debouncedSearchTerm,
      paymentStatusFilter,
      dateFrom,
      dateTo,
    ],
    debouncedSearchTerm
      ? `/invoices/search?q=${debouncedSearchTerm.trim()}&page=${currentPage}&limit=${pageSize}&payment_status=${paymentStatusFilter}&date_from=${dateFrom}&date_to=${dateTo}`
      : `/invoices?page=${currentPage}&limit=${pageSize}&payment_status=${paymentStatusFilter}&date_from=${dateFrom}&date_to=${dateTo}`,
    {
      enabled: true,
    }
  );

  const handleViewDetail = useCallback(id => {
    navigate(`/sales/detail/${id}`);
  }, []);

  const handleEdit = useCallback(id => {
    navigate(`/sales/detail/${id}`);
  }, []);

  const handleCreateNew = useCallback(() => {
    navigate('/sales/create');
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleCancelInvoice = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setCancelModalOpen(true);
  }, []);

  const handleCancelSuccess = useCallback(() => {
    // Refresh data after successful cancellation
    refetch();
  }, [refetch]);
  // Extract data from API response - memoized to prevent unnecessary re-renders
  const invoices = useMemo(() => invoicesData?.invoices || [], [invoicesData?.invoices]);
  const totalCount = useMemo(() => invoicesData?.total || 0, [invoicesData?.total]);
  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);

  // Memoize primary actions to prevent re-renders
  const primaryActions = useMemo(() => [
    {
      label: 'Tạo hoá đơn mới',
      icon: <Plus size={16} />,
      onClick: handleCreateNew,
      colorScheme: 'blue',
    },
  ], []);

  // Show error state
  if (error) {
    return (
      <Page
        title='Danh sách bán hàng'
        subtitle='Quản lý và theo dõi tất cả hoá đơn bán hàng'
      >
        <Alert status='error'>
          <AlertIcon />
          <AlertTitle>Lỗi tải dữ liệu!</AlertTitle>
          <AlertDescription>
            {error.message || 'Không thể tải danh sách hoá đơn'}
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title='Danh sách bán hàng'
      subtitle='Quản lý và theo dõi tất cả hoá đơn bán hàng'
      primaryActions={primaryActions}
    >
      {/* Sales Stats */}
      <SalesStats />

      {/* Search and Actions */}
      <Card>
        <CardBody>
          <HStack justify='space-between' mb={4}>
            <SalesSearch
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          </HStack>

          {/* Filters */}
          <SalesFilters
            paymentStatusFilter={paymentStatusFilter}
            setPaymentStatusFilter={setPaymentStatusFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
          />

          {/* Table */}
          <SalesTable
            isLoading={isLoading}
            invoices={invoices}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onCancel={handleCancelInvoice}
            isAdmin={isAdmin}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardBody>
      </Card>

      {/* Cancel Invoice Modal */}
      <CancelInvoiceModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        invoice={selectedInvoice}
        onSuccess={handleCancelSuccess}
      />
    </Page>
  );
};

export default SalesListPage;
