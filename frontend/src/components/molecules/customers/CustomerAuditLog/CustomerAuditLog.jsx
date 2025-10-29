import React, { useContext } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  VStack,
  Text,
  Box,
} from '@chakra-ui/react';
import { useFetchApi } from '@/hooks/useFetchApi';
import LogTimeline from '@/components/atoms/LogTimeline';
import { AuthContext } from '@/contexts/AuthContext';

const CustomerAuditLog = ({ customerId }) => {
  const {
    data: auditLogs,
    isLoading,
    error,
  } = useFetchApi(
    ['customer-audit-logs', customerId],
    `/customers/${customerId}/audit-logs`,
    {
      enabled: !!customerId,
    }
  );

  const { isAdmin } = useContext(AuthContext);
  if (!isAdmin) return;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Text fontSize='lg' fontWeight='bold'>
            Lịch sử thay đổi
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align='stretch'>
            {[1, 2, 3].map(i => (
              <Box
                key={i}
                p={4}
                border='1px'
                borderColor='gray.200'
                borderRadius='md'
              >
                <Box h='20px' bg='gray.200' borderRadius='md' mb={2} />
                <Box h='16px' bg='gray.100' borderRadius='md' w='60%' />
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <Text fontSize='lg' fontWeight='bold'>
            Lịch sử thay đổi
          </Text>
        </CardHeader>
        <CardBody>
          <Text color='red.500'>
            Không thể tải lịch sử thay đổi: {error.message}
          </Text>
        </CardBody>
      </Card>
    );
  }

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Text fontSize='lg' fontWeight='bold'>
            Lịch sử thay đổi
          </Text>
        </CardHeader>
        <CardBody>
          <Text color='gray.500' textAlign='center' py={8}>
            Chưa có lịch sử thay đổi nào
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Text fontSize='lg' fontWeight='bold'>
          Lịch sử thay đổi
        </Text>
      </CardHeader>
      <CardBody>
        <LogTimeline logs={auditLogs} />
      </CardBody>
    </Card>
  );
};

export default CustomerAuditLog;
