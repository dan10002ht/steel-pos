import React from 'react';
import { Badge } from '@chakra-ui/react';

const CustomerStatusBadge = ({ isActive }) => {
  return (
    <Badge colorScheme={isActive ? 'green' : 'red'} variant='subtle'>
      {isActive ? 'Hoạt động' : 'Không hoạt động'}
    </Badge>
  );
};

export default CustomerStatusBadge;
