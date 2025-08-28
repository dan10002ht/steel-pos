import React from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const Page = ({
  // Basic info
  title,
  subtitle,
  
  // Navigation
  // breadcrumbs = [], // Temporarily hidden
  
  // Actions
  primaryActions = [],
  secondaryActions = [],
  
  // Content
  children,
  
  // States
  isLoading = false,
  error = null,
  
  // Layout
  maxW = "full",
  spacing = 6,
  
  // Custom
  headerRight,
  headerLeft,
  
  // Props
  ...props
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  // Render action button
  const renderAction = (action, index) => (
    <Button
      key={index}
      leftIcon={action.icon}
      onClick={action.onClick}
      colorScheme={action.colorScheme || "blue"}
      variant={action.variant || "solid"}
      size="md"
      isLoading={action.isLoading}
      isDisabled={action.isDisabled}
    >
      {action.label}
    </Button>
  );

  // Render breadcrumbs - Temporarily hidden
  // const renderBreadcrumbs = () => {
  //   if (breadcrumbs.length === 0) return null;

  //   return (
  //     <Breadcrumb
  //       spacing="8px"
  //       separator={<ChevronRight size={16} color="gray.500" />}
  //       mb={4}
  //     >
  //       {breadcrumbs.map((item, index) => (
  //         <BreadcrumbItem key={index}>
  //           <BreadcrumbLink
  //             as={RouterLink}
  //             to={item.href}
  //             color={index === breadcrumbs.length - 1 ? "blue.500" : textColor}
  //             _hover={{ color: "blue.600" }}
  //           >
  //             {item.label}
  //           </BreadcrumbLink>
  //         </BreadcrumbItem>
  //       ))}
  //     </Breadcrumb>
  //   );
  // };

  // Loading state
  if (isLoading) {
    return (
      <Box p={6}>
        <Flex justify="center" align="center" minH="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textColor}>Đang tải...</Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Đã xảy ra lỗi!</AlertTitle>
            <AlertDescription>
              {error.message || "Không thể tải dữ liệu. Vui lòng thử lại sau."}
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW={maxW} mx="auto" {...props}>
      {/* Header Section */}
      <Box
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        px={6}
        py={4}
        mb={spacing}
      >
        <VStack align="stretch" spacing={4}>
          {/* Breadcrumbs - Temporarily hidden */}
          {/* {renderBreadcrumbs()} */}

          {/* Title and Actions */}
          <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4}>
            {/* Left side - Title */}
            <Box flex="1" minW="0">
              <VStack align="flex-start" spacing={1}>
                {headerLeft}
                <Heading size="lg" color="gray.800" _dark={{ color: "white" }}>
                  {title}
                </Heading>
                {subtitle && (
                  <Text color={textColor} fontSize="md">
                    {subtitle}
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Right side - Actions */}
            <Box>
              <VStack align="flex-end" spacing={3}>
                {headerRight}
                
                {/* Primary Actions */}
                {primaryActions.length > 0 && (
                  <HStack spacing={3} wrap="wrap" justify="flex-end">
                    {primaryActions.map((action, index) => renderAction(action, index))}
                  </HStack>
                )}

                {/* Secondary Actions */}
                {secondaryActions.length > 0 && (
                  <HStack spacing={3} wrap="wrap" justify="flex-end">
                    {secondaryActions.map((action, index) => renderAction(action, index))}
                  </HStack>
                )}
              </VStack>
            </Box>
          </Flex>
        </VStack>
      </Box>

      {/* Content Section */}
      <Box px={6} pb={6}>
        {children}
      </Box>
    </Box>
  );
};

export default Page;
