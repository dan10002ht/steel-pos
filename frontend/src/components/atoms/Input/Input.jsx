import React from "react";
import {
  Input as ChakraInput,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";

const Input = ({ label, error, isRequired = false, helperText, ...props }) => {
  return (
    <FormControl isInvalid={!!error} isRequired={isRequired}>
      {label && <FormLabel>{label}</FormLabel>}
      <ChakraInput {...props} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
      {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Input;
