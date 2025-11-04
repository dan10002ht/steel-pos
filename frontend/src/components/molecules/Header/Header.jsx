import React from 'react';
import { Box, Flex, HStack, useBreakpointValue } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import MenuButton from '../../atoms/MenuButton';
import { useLayoutUi } from '../../../contexts/UiContext';

const Header = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isSidebarOpen, toggleSidebar } = useLayoutUi();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Default to true if undefined (mobile-first approach)
  // This fixes Safari iOS issue where useBreakpointValue might return undefined initially
  if (isMobile === false) return null;

  return (
    <Box
      bg={bgColor}
      borderBottom='1px'
      borderColor={borderColor}
      px={{ base: '2', md: '6' }}
      py={{ base: '2', md: '4' }}
      position='sticky'
      top={0}
      zIndex={10}
    >
      <Flex justify='space-between' align='center'>
        <HStack spacing={4}>
          <MenuButton onClick={toggleSidebar} isOpen={isSidebarOpen} />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
