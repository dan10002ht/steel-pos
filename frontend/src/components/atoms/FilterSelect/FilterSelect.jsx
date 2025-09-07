import React from 'react';
import { Select } from '@chakra-ui/react';

const FilterSelect = ({ options, placeholder, value, onChange, ...props }) => {
  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

export default FilterSelect;
