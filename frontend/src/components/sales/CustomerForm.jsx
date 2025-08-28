import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
} from "@chakra-ui/react";
import { User, Search } from "lucide-react";

const CustomerForm = ({ customer, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    email: customer?.email || "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const toast = useToast();

  // Mock data - sẽ được thay thế bằng API calls
  const mockCustomers = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      email: "nguyenvana@email.com",
    },
    {
      id: 2,
      name: "Trần Thị B",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      email: "tranthib@email.com",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-search khi nhập tên hoặc số điện thoại
    if (field === 'name' || field === 'phone') {
      handleSearch(value);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    // TODO: Implement API search
    // Mock search logic
    const results = mockCustomers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );

    if (results.length > 0) {
      toast({
        title: "Tìm thấy khách hàng",
        description: `Có ${results.length} khách hàng phù hợp`,
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSelectCustomer = (selectedCustomer) => {
    setFormData({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address,
      email: selectedCustomer.email,
    });

    onUpdate(selectedCustomer);

    toast({
      title: "Đã chọn khách hàng",
      description: `Khách hàng: ${selectedCustomer.name}`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    setIsSearching(false);
  };

  const handleSaveCustomer = () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ tên và số điện thoại",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newCustomer = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      email: formData.email,
    };

    onUpdate(newCustomer);

    toast({
      title: "Đã lưu thông tin khách hàng",
      description: `Khách hàng: ${formData.name}`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleClearForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      email: "",
    });
    onUpdate(null);
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="md" fontWeight="medium">
          Thông tin khách hàng
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            leftIcon={<Search size={14} />}
            variant="outline"
            onClick={() => handleSearch(formData.name || formData.phone)}
          >
            Tìm kiếm
          </Button>
          <Button
            size="sm"
            leftIcon={<User size={14} />}
            onClick={handleSaveCustomer}
          >
            Lưu
          </Button>
        </HStack>
      </HStack>

      <VStack spacing={3} align="stretch">
        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Họ và tên *
          </Text>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nhập họ và tên khách hàng"
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Số điện thoại *
          </Text>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Nhập số điện thoại"
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Email
          </Text>
          <Input
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Nhập email (không bắt buộc)"
            type="email"
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Địa chỉ
          </Text>
          <Input
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Nhập địa chỉ (không bắt buộc)"
          />
        </Box>
      </VStack>

      {/* Search Results */}
      {isSearching && (
        <Box
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          p={3}
          bg="gray.50"
        >
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Kết quả tìm kiếm:
          </Text>
          <VStack spacing={2} align="stretch">
            {mockCustomers
              .filter(customer =>
                customer.name.toLowerCase().includes((formData.name || "").toLowerCase()) ||
                customer.phone.includes(formData.phone || "")
              )
              .map(customer => (
                <Box
                  key={customer.id}
                  p={2}
                  border="1px"
                  borderColor="gray.300"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "blue.50" }}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <Text fontWeight="medium">{customer.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {customer.phone} • {customer.address}
                  </Text>
                </Box>
              ))}
          </VStack>
        </Box>
      )}

      {/* Current Customer Info */}
      {customer && (
        <Box
          border="1px"
          borderColor="green.200"
          borderRadius="md"
          p={3}
          bg="green.50"
        >
          <Text fontSize="sm" fontWeight="medium" color="green.700" mb={2}>
            Khách hàng hiện tại:
          </Text>
          <Text fontWeight="medium">{customer.name}</Text>
          <Text fontSize="sm" color="gray.600">
            {customer.phone} • {customer.address}
          </Text>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="red"
            mt={2}
            onClick={handleClearForm}
          >
            Xóa thông tin
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default CustomerForm;

