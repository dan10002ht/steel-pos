import React from 'react';
import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';

const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  isRequired = false,
  error,
  size = 'md',
  ...props
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      {label && <FormLabel fontSize={{base: 'sm', md: 'md'}}>{label}</FormLabel>}
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        size={size}
        {...props}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default FormInput;
