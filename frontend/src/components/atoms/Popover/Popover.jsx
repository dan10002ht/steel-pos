import React from "react";
import {
  Popover as ChakraPopover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from "@chakra-ui/react";

const Popover = ({ 
  children, 
  activator, 
  placement = "bottom-end",
  isOpen,
  onOpen,
  onClose,
  ...props 
}) => {
  return (
    <ChakraPopover
      placement={placement}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      {...props}
    >
      <PopoverTrigger>
        {activator}
      </PopoverTrigger>
      <PopoverContent
        bg="white"
        border="1px"
        borderColor="gray.200"
        shadow="lg"
        borderRadius="md"
        _focus={{
          outline: "none",
          boxShadow: "lg",
        }}
      >
        <PopoverArrow bg="white" borderColor="gray.200" />
        <PopoverBody p={0}>
          {children}
        </PopoverBody>
      </PopoverContent>
    </ChakraPopover>
  );
};

export default Popover;
