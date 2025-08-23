import React from "react";
import { Button as ChakraButton } from "@chakra-ui/react";

const Button = ({
  children,
  variant = "solid",
  size = "md",
  colorScheme = "blue",
  leftIcon,
  rightIcon,
  isLoading,
  loadingText,
  ...props
}) => {
  return (
    <ChakraButton
      variant={variant}
      size={size}
      colorScheme={colorScheme}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      isLoading={isLoading}
      loadingText={loadingText}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
