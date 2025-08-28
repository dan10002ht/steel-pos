import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Spinner,
  keyframes,
  Progress,
} from "@chakra-ui/react";
import { Building2, CheckCircle } from "lucide-react";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const AdvancedSplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    "Khởi tạo hệ thống...",
    "Kết nối cơ sở dữ liệu...",
    "Tải dữ liệu người dùng...",
    "Hoàn tất khởi động...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [steps.length]);

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background Animation */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="whiteAlpha.100"
        animation={`${scaleIn} 2s ease-out`}
      />

      <VStack spacing={8} animation={`${fadeInUp} 1s ease-out`}>
        {/* Logo with Bounce Animation */}
        <Box
          animation={isComplete ? `${bounce} 0.6s ease-in-out` : `${scaleIn} 1s ease-out`}
          p={6}
          borderRadius="full"
          bg="white"
          boxShadow="0 20px 40px rgba(0,0,0,0.1)"
          position="relative"
        >
          {isComplete ? (
            <CheckCircle size={48} color="#48BB78" />
          ) : (
            <Building2 size={48} color="#667eea" />
          )}
        </Box>

        {/* App Name */}
        <VStack spacing={2}>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color="white"
            textShadow="0 2px 4px rgba(0,0,0,0.3)"
            animation={`${fadeInUp} 1.2s ease-out`}
          >
            Steel POS
          </Text>
          <Text
            fontSize="md"
            color="whiteAlpha.800"
            textAlign="center"
            maxW="300px"
            animation={`${fadeInUp} 1.4s ease-out`}
          >
            Hệ thống quản lý bán hàng sắt thép
          </Text>
        </VStack>

        {/* Progress Section */}
        <VStack spacing={4} w="300px">
          {/* Current Step */}
          <Text
            fontSize="sm"
            color="whiteAlpha.800"
            fontWeight="medium"
            textAlign="center"
            minH="20px"
          >
            {steps[currentStep]}
          </Text>

          {/* Progress Bar */}
          <Box w="full" bg="whiteAlpha.200" borderRadius="full" p={1}>
            <Progress
              value={progress}
              colorScheme="whiteAlpha"
              borderRadius="full"
              size="sm"
              transition="width 0.3s ease"
            />
          </Box>

          {/* Progress Percentage */}
          <Text
            fontSize="xs"
            color="whiteAlpha.600"
            fontWeight="medium"
          >
            {progress}%
          </Text>

          {/* Loading Spinner (only show when not complete) */}
          {!isComplete && (
            <Spinner
              size="md"
              color="white"
              thickness="2px"
              speed="0.8s"
            />
          )}
        </VStack>

        {/* Version Info */}
        <Text
          fontSize="xs"
          color="whiteAlpha.600"
          position="absolute"
          bottom={8}
          animation={`${fadeInUp} 1.6s ease-out`}
        >
          Version 1.0.0
        </Text>
      </VStack>
    </Box>
  );
};

export default AdvancedSplashScreen;
