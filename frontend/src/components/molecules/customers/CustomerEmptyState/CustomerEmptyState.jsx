import React from 'react';
import { VStack, Text, Button, Box } from '@chakra-ui/react';
import { Plus, Users } from 'lucide-react';

const CustomerEmptyState = ({
  hasSearchTerm = false,
  hasFilter = false,
  onCreateCustomer,
}) => {
  return (
    <VStack spacing={6} align='center' justify='center' minH='300px' py={12}>
      <Box
        p={6}
        borderRadius='full'
        bg='gray.50'
        color='gray.400'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Users size={48} />
      </Box>

      <VStack spacing={2} textAlign='center'>
        <Text fontSize='xl' fontWeight='semibold' color='gray.700'>
          Chưa có khách hàng nào
        </Text>
        <Text fontSize='md' color='gray.500' maxW='400px'>
          {hasSearchTerm || hasFilter
            ? 'Không tìm thấy khách hàng phù hợp với bộ lọc hiện tại'
            : 'Bắt đầu bằng cách thêm khách hàng đầu tiên vào hệ thống'}
        </Text>
        {!hasSearchTerm && !hasFilter && (
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme='blue'
            onClick={onCreateCustomer}
            mt={4}
          >
            Thêm khách hàng đầu tiên
          </Button>
        )}
      </VStack>
    </VStack>
  );
};

export default CustomerEmptyState;
