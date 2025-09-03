import React from 'react';
import {
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
} from '@chakra-ui/react';

const FormNumberInput = ({
  label,
  name,
  value,
  onChange,
  min = 0,
  isRequired = false,
  error,
  size = 'md',
  showStepper = true,
  ...props
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      {label && <FormLabel>{label}</FormLabel>}
      <NumberInput
        value={value}
        onChange={onChange}
        min={min}
        size={size}
        {...props}
      >
        <NumberInputField />
        {showStepper && (
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        )}
      </NumberInput>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default FormNumberInput;
