// components/LoadingScreen.js
import React from 'react';
import { Center, Spinner, Text } from '@chakra-ui/react';

const LoadingScreen = ({ text = 'Laddar...' }) => {
  return (
    <Center height="100vh" flexDirection="column" bg="white" color="gray.800">
      <Spinner size="xl" thickness="4px" speed="0.6s" color="blue.500" />
      <Text mt={4} fontSize="xl">{text}</Text>
    </Center>
  );
};

export default LoadingScreen;