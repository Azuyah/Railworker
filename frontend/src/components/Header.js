import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  Text,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const Header = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <Box
      bg="rgba(30, 58, 138, 0.85)"
      color="white"
      px={6}
      py={4}
      position="fixed"
      top={0}
      left={0}
      width="100%"
      zIndex={1000}
      boxShadow="md"
      backdropFilter="blur(10px)"
      borderBottom="1px solid rgba(255,255,255,0.1)"
    >
<Flex maxW="7xl" mx="auto" align="center" justify="space-between">
  {/* Vänster sida: logga + text */}
  <Flex align="center" gap={3}>
    <Image
      src="/railworkerlogo.svg"
      alt="Railworker logo"
      boxSize="40px"
      filter="drop-shadow(0 0 6px rgba(255,255,255,0.3))"
    />
    <Heading
      size="lg"
      letterSpacing="widest"
      textTransform="uppercase"
      fontWeight="extrabold"
      color="whiteAlpha.900"
    >
      Railworker
    </Heading>
  </Flex>

  {/* Höger sida: knappar + användarnamn, utdraget */}
  <Flex align="center" gap={6} minW="400px" justify="space-between">
    <HStack spacing={3}>
      <MotionButton
        bg="whiteAlpha.200"
        _hover={{ bg: 'whiteAlpha.300', boxShadow: '0 0 6px rgba(255,255,255,0.4)' }}
        color="white"
        px={5}
        py={2}
        borderRadius="lg"
        fontWeight="medium"
        transition="all 0.2s"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/dashboard')}
      >
        Start
      </MotionButton>

      <MotionButton
        bg="whiteAlpha.200"
        _hover={{ bg: 'whiteAlpha.300', boxShadow: '0 0 6px rgba(255,255,255,0.4)' }}
        color="white"
        px={5}
        py={2}
        borderRadius="lg"
        fontWeight="medium"
        transition="all 0.2s"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/profil')}
      >
        Min profil
      </MotionButton>

      <MotionButton
        bg="red.500"
        _hover={{ bg: 'red.600' }}
        color="white"
        px={5}
        py={2}
        borderRadius="lg"
        fontWeight="medium"
        boxShadow="0 0 8px rgba(255, 0, 0, 0.4)"
        transition="all 0.2s"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
      >
        Logga ut
      </MotionButton>
    </HStack>

    <Text fontSize="sm" color="whiteAlpha.800" whiteSpace="nowrap">
      Inloggad som: <strong>{user?.name || 'Okänd användare'}</strong>
    </Text>
  </Flex> {/* <-- Denna Flex stänger högra sektionen */}
</Flex> {/* <-- Denna Flex stänger hela headern */}
    </Box>
  );
};

export default Header;