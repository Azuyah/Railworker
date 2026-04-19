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
  const role = user?.role || '';
  const isAuthenticated = Boolean(user?.role);
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate(role === 'HTSM' ? '/htsm-login' : '/tsm-login');
  };
  const handleStart = () => navigate(isAuthenticated ? '/dashboard' : '/panel');
  const showStartButton = role === 'HTSM';
  const desktopNavColumns = showStartButton ? (isAuthenticated ? 3 : 1) : (isAuthenticated ? 2 : 1);
  const mobileNavColumns = desktopNavColumns;

  return (
    <Box
      bg="rgba(30, 58, 138, 0.85)"
      color="white"
      px={{ base: 3, md: 6 }}
      py={{ base: 2, md: 2.5 }}
      position="fixed"
      top={0}
      left={0}
      width="100%"
      zIndex={1000}
      boxShadow="md"
      backdropFilter="blur(10px)"
      borderBottom="1px solid rgba(255,255,255,0.1)"
    >
      <Flex maxW="7xl" mx="auto" direction="column" gap={{ base: 2, md: 0 }}>
        <Flex
          align="center"
          justify="space-between"
          gap={3}
          display={{ base: 'none', md: 'flex' }}
        >
          <Flex align="center" gap={3} minW={0}>
            <Box
              bg="white"
              px={2}
              py={1}
              borderRadius="lg"
              boxShadow="0 8px 18px rgba(15,23,42,0.18)"
              border="1px solid rgba(255,255,255,0.75)"
              flexShrink={0}
            >
              <Image
                src="/vallakra-railworker-logo.png"
                alt="Vallåkra Railworker logo"
                h="38px"
                w="auto"
                objectFit="contain"
              />
            </Box>
            <Heading
              size="md"
              letterSpacing="wide"
              fontWeight="extrabold"
              color="whiteAlpha.900"
              whiteSpace="nowrap"
            >
              Vallåkra Railworker
            </Heading>
          </Flex>

          <SimpleGrid columns={desktopNavColumns} spacing={3} flex="1" maxW="2xl" mx={8}>
            {showStartButton ? (
              <MotionButton
                bg="whiteAlpha.180"
                _hover={{ bg: 'whiteAlpha.260', boxShadow: '0 0 6px rgba(255,255,255,0.4)' }}
                color="white"
                px={4}
                py={2}
                minH="40px"
                borderRadius="lg"
                fontWeight="medium"
                fontSize="md"
                transition="all 0.2s"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
              >
                Start
              </MotionButton>
            ) : null}

            {isAuthenticated ? (
              <>
                <MotionButton
                  bg="whiteAlpha.180"
                  _hover={{ bg: 'whiteAlpha.260', boxShadow: '0 0 6px rgba(255,255,255,0.4)' }}
                  color="white"
                  px={4}
                  py={2}
                  minH="40px"
                  borderRadius="lg"
                  fontWeight="medium"
                  fontSize="md"
                  transition="all 0.2s"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/profil')}
                >
                  Min profil
                </MotionButton>

                <MotionButton
                  bg="red.500"
                  _hover={{ bg: 'red.600' }}
                  color="white"
                  px={4}
                  py={2}
                  minH="40px"
                  borderRadius="lg"
                  fontWeight="medium"
                  fontSize="md"
                  boxShadow="0 0 8px rgba(255, 0, 0, 0.35)"
                  transition="all 0.2s"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={logout}
                >
                  Logga ut
                </MotionButton>
              </>
            ) : null}
          </SimpleGrid>

          {isAuthenticated ? (
            <Text
              fontSize="sm"
              color="whiteAlpha.800"
              whiteSpace="nowrap"
              flexShrink={0}
            >
              Inloggad som: <strong>{displayName}</strong>
            </Text>
          ) : (
            <MotionButton
              bg="whiteAlpha.180"
              _hover={{ bg: 'whiteAlpha.260', boxShadow: '0 0 6px rgba(255,255,255,0.4)' }}
              color="white"
              px={4}
              py={2}
              minH="40px"
              borderRadius="lg"
              fontWeight="medium"
              fontSize="md"
              transition="all 0.2s"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/tsm-login')}
            >
              TSM-inloggning
            </MotionButton>
          )}
        </Flex>

        <Flex
          align="center"
          justify="space-between"
          gap={3}
          display={{ base: 'flex', md: 'none' }}
        >
          <Flex align="center" gap={2} minW={0}>
            <Box
              bg="white"
              px={2}
              py={1}
              borderRadius="md"
              boxShadow="0 6px 16px rgba(15,23,42,0.16)"
              border="1px solid rgba(255,255,255,0.72)"
              flexShrink={0}
            >
              <Image
                src="/vallakra-railworker-logo.png"
                alt="Vallåkra Railworker logo"
                h="32px"
                w="auto"
                objectFit="contain"
              />
            </Box>
            <Heading
              size="sm"
              letterSpacing="normal"
              fontWeight="extrabold"
              color="whiteAlpha.900"
              whiteSpace="nowrap"
            >
              Vallåkra Railworker
            </Heading>
          </Flex>
        </Flex>

        <SimpleGrid columns={mobileNavColumns} spacing={{ base: 2, md: 3 }} display={{ base: 'grid', md: 'none' }}>
          {showStartButton ? (
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
              onClick={handleStart}
            >
              Start
            </MotionButton>
          ) : null}

          {isAuthenticated ? (
            <>
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
            </>
          ) : null}
        </SimpleGrid>

        {isAuthenticated ? (
          <Text
            fontSize="xs"
            color="whiteAlpha.800"
            textAlign="center"
            display={{ base: 'block', md: 'none' }}
            noOfLines={1}
          >
            Inloggad som: <strong>{displayName}</strong>
          </Text>
        ) : null}
      </Flex>
    </Box>
  );
};

export default Header;
