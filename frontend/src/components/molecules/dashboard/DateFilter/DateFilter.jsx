import React from 'react';
import { Select } from '@chakra-ui/react';
import { Calendar } from 'lucide-react';

const DateFilter = ({ selectedRange, onRangeChange }) => {
  const dateRanges = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'this_week', label: 'Tuần này' },
    { value: 'this_month', label: 'Tháng này' },
  ];

  return (
    <Select
      value={selectedRange}
      onChange={e => onRangeChange(e.target.value)}
      size='sm'
      maxW='200px'
    >
      {dateRanges.map(range => (
        <option key={range.value} value={range.value}>
          {range.label}
        </option>
      ))}
    </Select>
  );
};

export default DateFilter;
