import React from "react";
import {
  Box,
  Flex,
  VStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { Building2 } from "lucide-react";
import { useSplashScreen } from "../../hooks/useSplashScreen";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const SplashScreen = ({ duration = 2000, showProgress = false }) => {
  const { progress, isComplete, currentStepText } = useSplashScreen({
    duration,
    showProgress,
    steps: ["Đang tải..."],
  });

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={8} animation={`${fadeIn} 0.8s ease-out`}>
        {/* Logo */}
        <Box
          animation={`${pulse} 2s ease-in-out infinite`}
          p={6}
          borderRadius="full"
          bg="white"
          boxShadow="0 20px 40px rgba(0,0,0,0.1)"
        >
          <Building2 size={48} color="#667eea" />
        </Box>

        {/* App Name */}
        <VStack spacing={2}>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color="white"
            textShadow="0 2px 4px rgba(0,0,0,0.3)"
          >
            Steel POS
          </Text>
          <Text
            fontSize="md"
            color="whiteAlpha.800"
            textAlign="center"
            maxW="300px"
          >
            Hệ thống quản lý bán hàng sắt thép
          </Text>
        </VStack>

        {/* Loading Spinner */}
        <VStack spacing={4}>
          <Spinner
            size="lg"
            color="white"
            thickness="3px"
            speed="0.8s"
          />
          <Text
            fontSize="sm"
            color="whiteAlpha.700"
            fontWeight="medium"
          >
            {currentStepText}
          </Text>
        </VStack>

        {/* Version Info */}
        <Text
          fontSize="xs"
          color="whiteAlpha.600"
          position="absolute"
          bottom={8}
        >
          Version 1.0.0
        </Text>
      </VStack>
    </Box>
  );
};

export default SplashScreen;
