import React from "react";
import { IconButton } from "@chakra-ui/react";
import { Menu } from "lucide-react";

const MenuButton = ({ onClick, isOpen }) => {
  return (
    <IconButton
      icon={<Menu size={20} />}
      variant="ghost"
      size="md"
      onClick={onClick}
      aria-label="Toggle menu"
      display={{ base: "flex", lg: "none" }}
    />
  );
};

export default MenuButton;
