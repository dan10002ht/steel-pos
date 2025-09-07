import React from 'react';
import { Badge } from '@chakra-ui/react';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../../constants/options';

const StatusBadge = ({ status, ...props }) => {
  const colorScheme = ORDER_STATUS_COLORS[status] || 'gray';
  const label = ORDER_STATUS_LABELS[status] || status;

  return (
    <Badge colorScheme={colorScheme} {...props}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
