import React from 'react';
import { HStack, Button, Text, useColorModeValue } from '@chakra-ui/react';
import { Calendar } from 'lucide-react';

const DateFilter = ({ selectedRange, onRangeChange, ...props }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const dateRanges = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'this_week', label: 'Tuần này' },
    { value: 'this_month', label: 'Tháng này' },
  ];

  return (
    <HStack
      spacing={2}
      p={4}
      bg={bgColor}
      border='1px'
      borderColor={borderColor}
      borderRadius='md'
      shadow='sm'
      {...props}
    >
      <Calendar size={20} color='gray.500' />
      <Text fontSize='sm' fontWeight='medium' color='gray.600'>
        Khoảng thời gian (thống kê):
      </Text>
      <HStack spacing={2}>
        {dateRanges.map(range => (
          <Button
            key={range.value}
            size='sm'
            variant={selectedRange === range.value ? 'solid' : 'outline'}
            colorScheme={selectedRange === range.value ? 'blue' : 'gray'}
            onClick={() => onRangeChange(range.value)}
          >
            {range.label}
          </Button>
        ))}
      </HStack>
    </HStack>
  );
};

export default DateFilter;
