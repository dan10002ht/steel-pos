import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Text, useColorModeValue } from "@chakra-ui/react";

const BreadcrumbLink = ({ href, children, isActive = false, ...props }) => {
  const navigate = useNavigate();
  const linkColor = useColorModeValue("blue.500", "blue.300");
  const activeColor = useColorModeValue("gray.500", "gray.400");

  const handleClick = (e) => {
    e.preventDefault();
    if (href && !isActive) {
      navigate(href);
    }
  };

  return (
    <Text
      as="span"
      color={isActive ? activeColor : linkColor}
      cursor={isActive ? "default" : "pointer"}
      _hover={!isActive ? { textDecoration: "underline" } : {}}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Text>
  );
};

export default BreadcrumbLink;
