import React from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useBreakpointValue,
} from "@chakra-ui/react";
import { MoreVertical } from "lucide-react";

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
}) => {

  const isMobile = useBreakpointValue({ base: true, md: false });
  const iconSize = isMobile ? 8 : 16;

  


  // Render loading state
  if (isLoading) {
    return (
      <Box p={6}>
        <VStack spacing={8} align="center" justify="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500">Đang tải...</Text>
        </VStack>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Lỗi!</AlertTitle>
            <AlertDescription>
              {error.message || "Đã xảy ra lỗi. Vui lòng thử lại."}
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW={maxW} mx="auto">
      {/* Header Section */}
      <Box
        py={4}
        mb={6}
      >
        <VStack spacing={4} align="stretch">
          {/* Breadcrumbs - Temporarily hidden */}
          {/* {breadcrumbs.length > 0 && (
                         <Breadcrumb
               spacing="8px"
               separator={<ChevronRight size={16} color="gray.500" />}
               fontSize="sm"
             >
               {breadcrumbs.map((item, index) => (
                 <BreadcrumbItem key={index}>
                   <BreadcrumbLink
                     href={item.href}
                     isActive={index === breadcrumbs.length - 1}
                   >
                     {item.label}
                   </BreadcrumbLink>
                 </BreadcrumbItem>
               ))}
             </Breadcrumb>
          )} */}

          {/* Title and Actions Row */}
          <HStack justify="space-between" align="flex-start" spacing={4}>
            {/* Left side - Title and subtitle */}
            <VStack align="flex-start" spacing={1} flex={1}>
              <Heading size={{base: "md", md: "lg"}} fontWeight="bold">
                {title}
              </Heading>
              {subtitle && (
                <Text color="gray.600" fontSize={{base: "sm", md: "md"}}>
                  {subtitle}
                </Text>
              )}
            </VStack>

            {/* Right side - Actions */}
            {(primaryActions.length > 0 || secondaryActions.length > 0 || headerRight) && (
              <HStack align="flex-end" spacing={2}>
                {/* Primary Actions - Always visible */}
                {secondaryActions.length > 0 && (
                  <>
                    {/* Desktop: Show all secondary actions as buttons */}
                    <HStack spacing={2} wrap="wrap" justify="flex-end" display={{ base: "none", md: "flex" }}>
                      {secondaryActions.map((action, index) => (
                        <Button
                          key={index}
                          leftIcon={action.icon}
                          colorScheme={action.colorScheme || "gray"}
                          variant={action.variant || "outline"}
                          size={{base: "xs", md: "sm"}}
                          onClick={action.onClick}
                          isLoading={action.isLoading}
                          isDisabled={action.isDisabled}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </HStack>

                    {/* Mobile: Show secondary actions in menu */}
                    <Box display={{ base: "block", md: "none" }}>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<MoreVertical size={iconSize} />}
                          variant="outline"
                          size={{base: "xs", md: "sm"}}
                          aria-label="More actions"
                        />
                        <MenuList>
                          {secondaryActions.map((action, index) => (
                            <MenuItem
                              key={index}
                              icon={action.icon}
                              onClick={action.onClick}
                              isDisabled={action.isDisabled}
                            >
                              {action.label}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Menu>
                    </Box>
                  </>
                )}
                {primaryActions.length > 0 && (
                  <HStack spacing={2} wrap="wrap" justify="flex-end">
                    {primaryActions.map((action, index) => (
                      <Button
                        key={index}
                        leftIcon={action.icon}
                        colorScheme={action.colorScheme || "blue"}
                        variant={action.variant || "solid"}
                        size={{base: "xs", md: "sm"}}
                        onClick={action.onClick}
                        isLoading={action.isLoading}
                        isDisabled={action.isDisabled}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </HStack>
                )}

                {/* Secondary Actions - Responsive */}
               

                {/* Custom header right content */}
                {headerRight}
              </HStack>
            )}
          </HStack>

          {/* Custom header left content */}
          {headerLeft && (
            <Box mt={2}>
              {headerLeft}
            </Box>
          )}
        </VStack>
      </Box>

      {/* Content Section */}
        <VStack spacing={spacing} align="stretch">
          {children}
        </VStack>
    </Box>
  );
};

export default Page;
