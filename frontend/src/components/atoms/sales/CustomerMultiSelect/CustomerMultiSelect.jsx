import React, { useState, useRef, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  useOutsideClick,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ChevronDown, X, Search } from 'lucide-react';
import { useCustomerSearch } from '@/hooks/sales/useCustomerSearch';

const CustomerSelect = ({
  label,
  value = null,
  onChange,
  placeholder = 'Chọn khách hàng...',
  minW = { base: '100%', sm: '300px' },
  maxW = { base: '100%', md: '300px' },
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const {
    searchResults,
    isSearchLoading,
    searchError,
    searchCustomers,
    clearSearch,
  } = useCustomerSearch();

  // Close dropdown when clicking outside
  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  // Handle search
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchCustomers(searchTerm);
    } else {
      clearSearch();
    }
  }, [searchTerm, searchCustomers, clearSearch]);

  // Get selected customer
  const selectedCustomer = value;

  // Handle customer selection
  const handleCustomerSelect = customer => {
    if (selectedCustomer && selectedCustomer.id === customer.id) {
      // Remove customer if already selected
      onChange(null);
    } else {
      // Select customer
      onChange(customer);
    }
    setIsOpen(false); // Close dropdown after selection
  };

  // Handle remove customer
  const handleRemoveCustomer = () => {
    onChange(null);
  };

  return (
    <FormControl minW={minW} maxW={maxW} position='relative' ref={containerRef}>
      <FormLabel fontSize='sm'>{label}</FormLabel>

      {/* Selected customers display */}
      <Box
        minH='40px'
        p={2}
        border='1px solid'
        borderColor='gray.300'
        borderRadius='md'
        bg='white'
        cursor='pointer'
        position='relative'
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ borderColor: 'blue.400' }}
        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
      >
        {!selectedCustomer ? (
          <Text color='gray.500' fontSize='sm'>
            {placeholder}
          </Text>
        ) : (
          <HStack spacing={2} justify='space-between'>
            <Badge
              colorScheme='blue'
              variant='subtle'
              borderRadius='md'
              fontSize='xs'
              px={2}
              py={1}
            >
              <HStack spacing={1}>
                <Text>{selectedCustomer.name}</Text>
                {selectedCustomer.phone && (
                  <Text color='gray.600'>({selectedCustomer.phone})</Text>
                )}
              </HStack>
            </Badge>
            <IconButton
              size='xs'
              variant='ghost'
              icon={<X size={12} />}
              onClick={e => {
                e.stopPropagation();
                handleRemoveCustomer();
              }}
              aria-label='Remove customer'
              color='red.500'
              _hover={{ bg: 'red.50' }}
            />
          </HStack>
        )}

        <Box
          position='absolute'
          right={2}
          top='50%'
          transform='translateY(-50%)'
        >
          <ChevronDown size={16} color='gray' />
        </Box>
      </Box>

      {/* Dropdown */}
      {isOpen && (
        <Box
          position='absolute'
          top='100%'
          left={0}
          right={0}
          zIndex={1000}
          bg='white'
          border='1px solid'
          borderColor='gray.300'
          borderRadius='md'
          boxShadow='lg'
        >
          {/* Search input */}
          <Box p={2} borderBottom='1px solid' borderColor='gray.200'>
            <HStack>
              <Search size={16} color='gray' />
              <Input
                placeholder='Tìm kiếm khách hàng...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                size='sm'
                border='none'
                _focus={{ boxShadow: 'none' }}
              />
            </HStack>
          </Box>

          {/* Results */}
          <Box maxH='200px' overflowY='auto'>
            {isSearchLoading ? (
              <Box p={4} textAlign='center'>
                <Spinner size='sm' />
                <Text fontSize='sm' mt={2}>
                  Đang tìm kiếm...
                </Text>
              </Box>
            ) : searchError ? (
              <Alert status='error' size='sm' m={2}>
                <AlertIcon />
                <Text fontSize='xs'>Lỗi tải danh sách khách hàng</Text>
              </Alert>
            ) : searchResults.length === 0 ? (
              <Box p={4} textAlign='center'>
                <Text fontSize='sm' color='gray.500'>
                  {searchTerm.length >= 2
                    ? 'Không tìm thấy khách hàng'
                    : 'Nhập ít nhất 2 ký tự để tìm kiếm'}
                </Text>
              </Box>
            ) : (
              <VStack spacing={0} align='stretch'>
                {searchResults.map(customer => {
                  const isSelected =
                    selectedCustomer && selectedCustomer.id === customer.id;

                  return (
                    <Box
                      key={customer.id}
                      p={3}
                      cursor='pointer'
                      bg={isSelected ? 'blue.50' : 'white'}
                      _hover={{ bg: isSelected ? 'blue.100' : 'gray.50' }}
                      borderBottom='1px solid'
                      borderColor='gray.100'
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <VStack align='start' spacing={1}>
                        <Text fontSize='sm' fontWeight='medium'>
                          {customer.name}
                        </Text>
                        {customer.phone && (
                          <Text fontSize='xs' color='gray.600'>
                            {customer.phone}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </Box>
      )}
    </FormControl>
  );
};

export default CustomerSelect;
