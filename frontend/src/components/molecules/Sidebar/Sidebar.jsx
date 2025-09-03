import React from "react";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import Logo from "../../atoms/Logo";
import NavigationMenu from "../NavigationMenu";
import UserMenu from "../UserMenu";
import CloseButton from "../../atoms/CloseButton";
import { useLayoutUi } from "../../../contexts/UiContext";

const Sidebar = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { isSidebarOpen, closeSidebar } = useLayoutUi();

  return (
    <Box
      bg={bgColor}
      h="100vh"
      overflow="hidden"
      position={{ base: "fixed", lg: "static" }}
      left={{ base: isSidebarOpen ? 0 : "-100%", lg: 0 }}
      top={0}
      zIndex={{ base: 1000, lg: "auto" }}
      w={{ base: "100%", lg: "280px" }}
      transition="left 0.3s ease"
      display={{ base: "block", lg: "block" }}
    >
      <Flex direction="column" h="100vh" position="relative">
        {/* Logo Section - Fixed at top */}
        <Box p={{base: "4", md: "6"}} borderBottom="1px" borderColor={borderColor} flexShrink={0} position="relative">
          <Logo />
          {/* Close Button - Mobile Only */}
          <Box display={{ base: "block", lg: "none" }} position="absolute" top={4} right={4}>
            <CloseButton onClick={closeSidebar} />
          </Box>
        </Box>

        {/* Navigation Menu - Scrollable */}
        <Box flex={1} overflowY="auto" minH={0}>
          <NavigationMenu />
        </Box>

        {/* User Section - Fixed at bottom */}
        <Box 
          p={{base: "2", md: "6"}} 
          borderTop="1px" 
          borderColor={borderColor} 
          bg={bgColor}
          flexShrink={0}
        >
          <UserMenu />
        </Box>
      </Flex>
    </Box>
  );
};

export default Sidebar;
