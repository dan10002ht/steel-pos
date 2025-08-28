import React from "react";
import { Avatar, HStack, VStack, Text } from "@chakra-ui/react";

const UserAvatar = ({ user }) => {
  return (
    <HStack spacing={3} w="full">
      <Avatar size="sm" name={user?.full_name || user?.username} />
      <VStack align="flex-start" spacing={0} flex={1}>
        <Text fontSize="sm" fontWeight="medium">
          {user?.full_name || user?.username || "User"}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {user?.role || "User"}
        </Text>
      </VStack>
    </HStack>
  );
};

export default UserAvatar;
