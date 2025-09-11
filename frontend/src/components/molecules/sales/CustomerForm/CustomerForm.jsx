import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { User, Search, X } from 'lucide-react';
import { useCustomerSearch } from '@/hooks/sales/useCustomerSearch';

const CustomerForm = ({ customer, onUpdate, onSelectCustomer }) => {
  const [errors, setErrors] = useState({});

  // Customer search hook
  const {
    searchTerm,
    isSearching,
    searchResults,
    isSearchLoading,
    searchError,
    searchCustomers,
    clearSearch,
    selectCustomer,
  } = useCustomerSearch();

  const handleInputChange = (field, value) => {
    // Map field names to invoice field names
    const fieldMapping = {
      name: 'customer_name',
      phone: 'customer_phone',
      address: 'customer_address',
    };

    const invoiceField = fieldMapping[field];
    onUpdate(invoiceField, value);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Auto-search khi nhập tên hoặc số điện thoại
    if (field === 'name' || field === 'phone') {
      searchCustomers(value);
    }
  };

  const handleSelectCustomer = selectedCustomer => {
    onSelectCustomer({customer_id: selectedCustomer.id, customer_name: selectedCustomer.name, customer_phone: selectedCustomer.phone, customer_address: selectedCustomer.address});
  };

  const handleClearForm = () => {
    onSelectCustomer({customer_id: null, customer_name: '', customer_phone: '', customer_address: ''});
    clearSearch();
  };

  return (
    <VStack spacing={4} align='stretch'>
      <Text fontSize='md' fontWeight='medium'>
        Thông tin khách hàng
      </Text>

      {/* Hiển thị khách hàng hiện tại nếu đã select */}
      {customer?.id && (
        <Box
          p={3}
          bg='green.50'
          border='1px'
          borderColor='green.200'
          borderRadius='md'
        >
          <HStack justify='space-between'>
            <VStack align='start' spacing={1}>
              <Text fontSize='sm' fontWeight='medium' color='green.700'>
                Khách hàng hiện tại
              </Text>
              <Text fontSize='sm' color='green.600'>
                {customer.name} - {customer.phone}
              </Text>
              {customer.address && (
                <Text fontSize='xs' color='green.500'>
                  {customer.address}
                </Text>
              )}
            </VStack>
            <Button
              size='xs'
              variant='ghost'
              colorScheme='green'
              onClick={handleClearForm}
              leftIcon={<X size={12} />}
            >
              Thay đổi
            </Button>
          </HStack>
        </Box>
      )}

      <VStack spacing={3} align='stretch'>
        <Box>
          <Text fontSize='sm' color='gray.600' mb={1}>
            Họ và tên *
          </Text>
          <Input
            value={customer.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder='Nhập họ và tên khách hàng'
            borderColor={errors.name ? 'red.300' : undefined}
            _focus={{ borderColor: errors.name ? 'red.500' : 'blue.500' }}
          />
          {errors.name && (
            <Text fontSize='xs' color='red.500' mt={1}>
              {errors.name}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontSize='sm' color='gray.600' mb={1}>
            Số điện thoại *
          </Text>
          <Input
            value={customer.phone}
            onChange={e => handleInputChange('phone', e.target.value)}
            placeholder='Nhập số điện thoại'
            borderColor={errors.phone ? 'red.300' : undefined}
            _focus={{ borderColor: errors.phone ? 'red.500' : 'blue.500' }}
          />
          {errors.phone && (
            <Text fontSize='xs' color='red.500' mt={1}>
              {errors.phone}
            </Text>
          )}
        </Box>
        <Box>
          <Text fontSize='sm' color='gray.600' mb={1}>
            Địa chỉ
          </Text>
          <Input
            value={customer.address}
            onChange={e => handleInputChange('address', e.target.value)}
            placeholder='Nhập địa chỉ (không bắt buộc)'
          />
        </Box>
      </VStack>

      {/* Search Results */}
      {isSearching && searchTerm && (
        <Box
          border='1px'
          borderColor='gray.200'
          borderRadius='md'
          p={3}
          bg='gray.50'
          maxH='200px'
          overflowY='auto'
        >
          <HStack justify='space-between' mb={2}>
            <Text fontSize='sm' fontWeight='medium'>
              Kết quả tìm kiếm:
            </Text>
            <Button
              size='xs'
              variant='ghost'
              onClick={clearSearch}
              leftIcon={<X size={12} />}
            >
              Đóng
            </Button>
          </HStack>

          {isSearchLoading ? (
            <HStack justify='center' py={4}>
              <Spinner size='sm' />
              <Text fontSize='sm' color='gray.600'>
                Đang tìm kiếm...
              </Text>
            </HStack>
          ) : searchError ? (
            <Alert status='error' size='sm'>
              <AlertIcon />
              <Text fontSize='sm'>Lỗi tìm kiếm khách hàng</Text>
            </Alert>
          ) : searchResults.length > 0 ? (
            <VStack spacing={2} align='stretch'>
              {searchResults.map(customer => (
                <Box
                  key={customer.id}
                  p={2}
                  border='1px'
                  borderColor='gray.300'
                  borderRadius='md'
                  cursor='pointer'
                  _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <Text fontWeight='medium'>{customer.name}</Text>
                  <Text fontSize='sm' color='gray.600'>
                    {customer.phone} • {customer.address || 'Chưa có địa chỉ'}
                  </Text>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text fontSize='sm' color='gray.600' textAlign='center' py={2}>
              Không tìm thấy khách hàng nào
            </Text>
          )}
        </Box>
      )}
    </VStack>
  );
};

export default CustomerForm;
