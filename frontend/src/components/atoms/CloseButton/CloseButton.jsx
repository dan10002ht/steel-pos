import React from "react";
import { IconButton } from "@chakra-ui/react";
import { X } from "lucide-react";

const CloseButton = ({ onClick }) => {
  return (
    <IconButton
      icon={<X size={20} />}
      variant="ghost"
      size="md"
      onClick={onClick}
      aria-label="Close sidebar"
    />
  );
};

export default CloseButton;
