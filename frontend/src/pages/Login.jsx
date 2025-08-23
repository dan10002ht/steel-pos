import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Flex,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Nếu đã đăng nhập, chuyển hướng đến dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await login(formData);

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Chuyển hướng sẽ được xử lý trong useEffect
    } catch (error) {
      toast({
        title: "Đăng nhập thất bại",
        description: error.error || "Tên đăng nhập hoặc mật khẩu không đúng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container
        maxW="lg"
        py={{ base: "12", md: "24" }}
        px={{ base: "4", sm: "8" }}
      >
        <Flex direction="column" align="center" justify="center" minH="100vh">
          <Box
            py={{ base: "0", sm: "8" }}
            px={{ base: "4", sm: "10" }}
            bg={{ base: "transparent", sm: "white" }}
            boxShadow={{ base: "none", sm: "md" }}
            borderRadius={{ base: "none", sm: "xl" }}
            w="full"
            maxW="md"
          >
            <VStack spacing="8">
              {/* Logo và tên ứng dụng */}
              <VStack spacing="6">
                <Flex
                  w="16"
                  h="16"
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="blue.500"
                  color="white"
                >
                  <Building2 size={32} />
                </Flex>
                <VStack spacing="2">
                  <Heading size="lg" color="gray.900">
                    Steel POS
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    Hệ thống quản lý bán hàng sắt thép
                  </Text>
                </VStack>
              </VStack>

              {/* Form đăng nhập */}
              <Box as="form" onSubmit={handleSubmit} w="full">
                <VStack spacing="6">
                  <FormControl isRequired>
                    <FormLabel
                      htmlFor="username"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Tên đăng nhập
                    </FormLabel>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Nhập tên đăng nhập"
                      size="lg"
                      bg="white"
                      border="1px"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel
                      htmlFor="password"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Mật khẩu
                    </FormLabel>
                    <InputGroup size="lg">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Nhập mật khẩu"
                        bg="white"
                        border="1px"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "outline",
                        }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={
                            showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                          }
                          icon={showPassword ? <EyeOff /> : <Eye />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    fontSize="md"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Đang đăng nhập..."
                  >
                    Đăng nhập
                  </Button>
                </VStack>
              </Box>

              {/* Thông tin demo */}
              <VStack spacing="4" pt="4" borderTop="1px" borderColor="gray.200">
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Tài khoản demo:
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Username: admin | Password: admin123
                </Text>
              </VStack>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Login;
