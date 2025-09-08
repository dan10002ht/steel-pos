import React from "react";
import {  Box } from "@chakra-ui/react";
import Sidebar from "../../molecules/Sidebar";
import Header from "../../molecules/Header";

const MainLayout = ({ children }) => {

  return (
    <Box 
      h="100vh" 
      overflow="hidden" 
      bg="gray.50" 
      display={{ base: "block", lg: "grid" }}
      gridTemplateColumns={{ lg: "280px 1fr" }}
      gridTemplateRows={{ lg: "1fr" }}
      position="relative"
    >
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <Box 
        display="flex" 
        flexDirection="column" 
        h="100vh"
        ml={{ base: 0, lg: 0 }}
      >
        {/* Top Header - Fixed */}
        <Header />

        {/* Page Content - Scrollable */}
        <Box flex={1} overflowY="auto" p={{base: "4", md: "6"}} minH={0}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
