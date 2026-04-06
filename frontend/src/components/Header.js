import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  Image,
  SimpleGrid,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const Header = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null') || {};
  } catch (error) {
    user = {};
  }

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : 'Okänd användare';

  return (
    <Box
      bg="rgba(30, 58, 138, 0.85)"
      color="white"
      px={{ base: 3, md: 6 }}
      py={{ base: 2, md: 4 }}
      position="fixed"
      top={0}
      left={0}
      width="100%"
      zIndex={1000}
      boxShadow="md"
      backdropFilter="blur(10px)"
      borderBottom="1px solid rgba(255,255,255,0.1)"
    >
      <Flex maxW="7xl" mx="auto" direction="column" gap={{ base: 2, md: 3 }}>
        <Flex align="center" justify="space-between" gap={3}>
          <Flex align="center" gap={{ base: 2, md: 3 }} minW={0}>
            <Image
              src="/railworkerlogo.svg"
              alt="Railworker logo"
              boxSize={{ base: '30px', md: '40px' }}
              filter="drop-shadow(0 0 6px rgba(255,255,255,0.3))"
              flexShrink={0}
            />
            <Heading
              size={{ base: 'md', md: 'lg' }}
              letterSpacing={{ base: 'wide', md: 'widest' }}
              textTransform="uppercase"
              fontWeight="extrabold"
              color="whiteAlpha.900"
              whiteSpace="nowrap"
            >
              Railworker
            </Heading>
          </Flex>

          <Text
            fontSize="sm"
            color="whiteAlpha.800"
            whiteSpace="nowrap"
            display={{ base: 'none', lg: 'block' }}
          >
            Inloggad som: <strong>{displayName}</strong>
          </Text>
        </Flex>

        <SimpleGrid columns={3} spacing={{ base: 2, md: 3 }}>
          <MotionButton
            bg="whiteAlpha.200"
            _hover={{ bg: 'whiteAlpha.300', boxShadow: '0 0 6px rgba(255,255,255,0.4)' }}
            color="white"
            px={{ base: 2, md: 5 }}
            py={{ base: 2, md: 2 }}
            borderRadius="lg"
            fontWeight="medium"
            fontSize={{ base: 'sm', md: 'md' }}
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
            px={{ base: 2, md: 5 }}
            py={{ base: 2, md: 2 }}
            borderRadius="lg"
            fontWeight="medium"
            fontSize={{ base: 'sm', md: 'md' }}
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
            px={{ base: 2, md: 5 }}
            py={{ base: 2, md: 2 }}
            borderRadius="lg"
            fontWeight="medium"
            fontSize={{ base: 'sm', md: 'md' }}
            boxShadow="0 0 8px rgba(255, 0, 0, 0.4)"
            transition="all 0.2s"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
          >
            Logga ut
          </MotionButton>
        </SimpleGrid>

        <Text
          fontSize="xs"
          color="whiteAlpha.800"
          textAlign="center"
          display={{ base: 'block', lg: 'none' }}
          noOfLines={1}
        >
          Inloggad som: <strong>{displayName}</strong>
        </Text>
      </Flex>
    </Box>
  );
};

export default Header;
