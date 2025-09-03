import React from 'react';
import { FormControl, FormLabel, Input, FormErrorMessage, VStack, Text } from '@chakra-ui/react';

const FormFileInput = ({
  label,
  name,
  onChange,
  multiple = false,
  accept,
  isRequired = false,
  error,
  size = 'md',
  ...props
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      {label && <FormLabel fontSize={{base: 'sm', md: 'md'}}>{label}</FormLabel>}
      <VStack align='start' spacing={2}>
        <Input
          name={name}
          type='file'
          onChange={onChange}
          multiple={multiple}
          accept={accept}
          size={size}
          {...props}
        />
        {accept && (
          <Text fontSize='sm' color='gray.500'>
            Chấp nhận: {accept}
          </Text>
        )}
      </VStack>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default FormFileInput;
