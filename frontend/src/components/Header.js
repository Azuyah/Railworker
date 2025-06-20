// Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';

const Header = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

return (
  <Box
    bg="blue.700"
    color="white"
    px={6}
    py={4}
    position="fixed"
    top={0}
    left={0}
    width="100%"
    zIndex={1000}
    boxShadow="md"
  >
    <Flex maxW="7xl" mx="auto" align="center" justify="space-between">
      {/* Vänster sida: logga + text */}
      <Flex align="center" gap={3}>
        <Image src="/railworkerlogo.svg" alt="Railworker logo" boxSize="40px" />
        <Heading size="lg" letterSpacing="wide">
          Railworker
        </Heading>
      </Flex>

      {/* Höger sida: knappar */}
      <HStack spacing={4}>
        <Button
          colorScheme="whiteAlpha"
          variant="solid"
          onClick={() => navigate('/dashboard')}
        >
          Start
        </Button>
        <Button
          colorScheme="whiteAlpha"
          variant="solid"
          onClick={() => navigate('/profil')}
        >
          Min profil
        </Button>
        <Button
          colorScheme="red"
          variant="solid"
          onClick={logout}
        >
          Logga ut
        </Button>
      </HStack>
    </Flex>
  </Box>
);
};

export default Header;