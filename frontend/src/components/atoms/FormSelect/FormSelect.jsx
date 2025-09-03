import React from 'react';
import { FormControl, FormLabel, Select, FormErrorMessage } from '@chakra-ui/react';

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  children,
  isRequired = false,
  error,
  size = 'md',
  ...props
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      {label && <FormLabel>{label}</FormLabel>}
      <Select
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size={size}
        {...props}
      >
        {children}
      </Select>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default FormSelect;
