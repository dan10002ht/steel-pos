import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { useFetchApi } from '@/hooks/useFetchApi';
import Page from '@/components/organisms/Page';
import CustomerStatsGrid from '@/components/organisms/CustomerStatsGrid';
import CustomerInfoSection from '@/components/molecules/CustomerInfoSection';
import RecentInvoicesSection from '@/components/organisms/RecentInvoicesSection';
import CustomerAuditLog from '@/components/molecules/customers/CustomerAuditLog';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch customer data
  const {
    data: customer,
    isLoading: isLoadingCustomer,
    error: customerError,
  } = useFetchApi(['customer', id], `/customers/${id}`, {
    enabled: !!id,
  });

  if (isLoadingCustomer) {
    return (
      <Page
        onBack={() => navigate('/customers')}
        title='Chi tiết khách hàng'
        subtitle='Đang tải thông tin khách hàng...'
      >
        <VStack spacing={6} align='stretch'>
          {/* Skeleton for stats */}
          <VStack spacing={4} align='stretch'>
            <Skeleton height='20px' width='200px' />
            <VStack spacing={4} align='stretch'>
              <Skeleton height='120px' borderRadius='md' />
              <Skeleton height='120px' borderRadius='md' />
            </VStack>
          </VStack>

          {/* Skeleton for customer info */}
          <Box>
            <Skeleton height='20px' width='180px' mb={4} />
            <SkeletonText noOfLines={6} spacing='4' skeletonHeight='20px' />
          </Box>

          {/* Skeleton for invoices */}
          <Box>
            <Skeleton height='20px' width='150px' mb={4} />
            <VStack spacing={3} align='stretch'>
              <Skeleton height='80px' borderRadius='md' />
              <Skeleton height='80px' borderRadius='md' />
              <Skeleton height='80px' borderRadius='md' />
            </VStack>
          </Box>
        </VStack>
      </Page>
    );
  }

  if (customerError) {
    return (
      <Page
        title='Chi tiết khách hàng'
        subtitle='Không thể tải thông tin khách hàng'
      >
        <Alert status='error' borderRadius='md'>
          <AlertIcon />
          <Box>
            <AlertTitle>Lỗi!</AlertTitle>
            <AlertDescription>
              {customerError.message ||
                'Không thể tải thông tin khách hàng. Vui lòng thử lại.'}
            </AlertDescription>
          </Box>
        </Alert>
      </Page>
    );
  }

  if (!customer) {
    return (
      <Page
        onBack={() => navigate('/customers')}
        title='Chi tiết khách hàng'
        subtitle='Không tìm thấy khách hàng'
      >
        <Alert status='warning' borderRadius='md'>
          <AlertIcon />
          <Box>
            <AlertTitle>Cảnh báo!</AlertTitle>
            <AlertDescription>
              Không tìm thấy khách hàng với ID này.
            </AlertDescription>
          </Box>
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      onBack={() => navigate('/customers')}
      title='Chi tiết khách hàng'
      subtitle={`Thông tin chi tiết về ${customer.name}`}
    >
      <VStack spacing={6} align='stretch'>
        <CustomerInfoSection customer={customer} />
        <CustomerStatsGrid customerId={id} />
        <RecentInvoicesSection
          customerId={id}
          onViewAll={() => navigate('/sales')}
          onCreateInvoice={() => navigate('/sales/create')}
          onInvoiceClick={invoiceId => navigate(`/sales/detail/${invoiceId}`)}
        />
        <CustomerAuditLog customerId={id} />
      </VStack>
    </Page>
  );
};

export default CustomerDetailPage;
