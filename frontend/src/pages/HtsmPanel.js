// src/pages/Dashboard.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import Header from '../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const tokenData = localStorage.getItem('user');
  const token = tokenData ? JSON.parse(tokenData).token : null;

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else {
      fetchAllProjects();
    }
  }, []);

  const fetchAllProjects = async () => {
    try {
      const response = await axios.get(
        'https://railworker-production.up.railway.app/api/projects',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProjects(response.data);
    } catch (error) {
      console.error('Kunde inte hämta projekt:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const boxBg = useColorModeValue('white', 'gray.700');

  return (
    <Box minH="100vh" bg="gray.100">
      <Header />
      <Box pt="100px" px={6} maxW="3xl" mx="auto">
        <Box bg={boxBg} p={6} borderRadius="md" boxShadow="md">
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="md" mb={4}>
                Skapa nytt projekt
              </Heading>
              <Button
                colorScheme="blue"
                width="100%"
                size="lg"
                onClick={() => navigate('/skapa-projekt')}
              >
                + Skapa nytt projekt
              </Button>
            </Box>

            <Box>
              <Heading size="md" mb={4}>
                Projekt
              </Heading>
              {loading ? (
                <VStack spacing={3} align="center" py={6}>
                  <Spinner color="blue.500" size="lg" />
                  <Text color="gray.600">Hämtar projekt...</Text>
                </VStack>
              ) : projects.length === 0 ? (
                <Text color="gray.500">Inga projekt hittades.</Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {projects.map((project) => (
                    <Box
                      key={project.id}
                      borderWidth="1px"
                      borderRadius="md"
                      p={4}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Text fontWeight="semibold">{project.name}</Text>
                        {project.plats && (
                          <Text fontSize="sm" color="gray.600">
                            {project.plats}
                          </Text>
                        )}
                      </Box>
                      <Button
                        variant="link"
                        colorScheme="blue"
                        onClick={() => navigate(`/plan/${project.id}`)}
                      >
                        Visa projekt
                      </Button>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;