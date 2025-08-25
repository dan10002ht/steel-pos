import React from "react";
import { Badge } from "@chakra-ui/react";

const ProductBadge = ({
  type = "default",
  children,
  variant = "subtle",
  size = "sm",
  ...props
}) => {
  const getColorScheme = () => {
    switch (type) {
      case "category":
        return "blue";
      case "status":
        return "green";
      case "stock":
        return "orange";
      case "price":
        return "purple";
      case "variant":
        return "teal";
      case "danger":
        return "red";
      case "warning":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <Badge
      colorScheme={getColorScheme()}
      variant={variant}
      size={size}
      {...props}
    >
      {children}
    </Badge>
  );
};

export default ProductBadge;
