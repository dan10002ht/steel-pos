import React from 'react';
import { Tr, Td, Text, VStack, HStack, Button, Badge } from '@chakra-ui/react';
import { Eye, Edit } from 'lucide-react';
import { formatPhoneNumber } from '@/utils/formatters';

const CustomerTableRow = ({ customer, onViewDetail, onEdit }) => {
  const handleViewClick = e => {
    e.stopPropagation();
    onViewDetail(customer.id);
  };

  const handleEditClick = e => {
    e.stopPropagation();
    onEdit(customer.id);
  };

  return (
    <Tr
      _hover={{ bg: 'gray.50' }}
      cursor='pointer'
      onClick={() => onViewDetail(customer.id)}
    >
      <Td>
        <VStack align='start' spacing={1}>
          <Text fontWeight='bold' fontSize='md'>
            {customer.name}
          </Text>
          <Text fontSize='xs' color='gray.500'>
            ID: {customer.id}
          </Text>
        </VStack>
      </Td>

      <Td>
        <Text fontSize='md' fontFamily='mono'>
          {formatPhoneNumber(customer.phone)}
        </Text>
      </Td>

      <Td>
        {customer.address ? (
          <Text fontSize='sm' color='gray.600' noOfLines={2}>
            {customer.address}
          </Text>
        ) : (
          <Text fontSize='sm' color='gray.400' fontStyle='italic'>
            Chưa có địa chỉ
          </Text>
        )}
      </Td>

      <Td>
        <Badge
          colorScheme={customer.is_active ? 'green' : 'red'}
          variant='subtle'
        >
          {customer.is_active ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      </Td>

      <Td>
        <Text fontSize='sm' color='gray.600'>
          {new Date(customer.created_at).toLocaleDateString('vi-VN')}
        </Text>
      </Td>

      <Td>
        <HStack spacing={2}>
          <Button
            size='sm'
            variant='ghost'
            colorScheme='blue'
            onClick={handleViewClick}
            title='Xem chi tiết'
          >
            <Eye size={16} />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            colorScheme='orange'
            onClick={handleEditClick}
            title='Chỉnh sửa'
          >
            <Edit size={16} />
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
};

export default CustomerTableRow;
