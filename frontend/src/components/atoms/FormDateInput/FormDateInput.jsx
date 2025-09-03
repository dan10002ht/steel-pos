import React from 'react';
import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';

const FormDateInput = ({
  label,
  name,
  value,
  onChange,
  isRequired = false,
  error,
  ...props
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <FormLabel fontSize={{base: 'sm', md: 'md'}}>{label}</FormLabel>
      <Input
        name={name}
        value={value}
        onChange={onChange}
        type='date'
        {...props}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default FormDateInput;
