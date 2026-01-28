import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Spinner,
  Text,
  VStack,
  HStack,
  Stack,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import Header from '../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchUserAndProjects = useCallback(async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/');
    return;
  }

  try {
    await axios.get('https://railworker-production.up.railway.app/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const projectRes = await axios.get(
      'https://railworker-production.up.railway.app/api/projects',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setProjects(projectRes.data);
  } catch (error) {
    console.error('Kunde inte hämta användare eller projekt:', error);
    navigate('/'); // Tillbaka till login vid fel
  } finally {
    setLoading(false);
  }
}, [navigate]);

  useEffect(() => {
    fetchUserAndProjects();
  }, [fetchUserAndProjects]);

  return (
    <Box minH="100vh" bg="#F4F6FA">
      <Box
        position="fixed"
        inset={0}
        zIndex={0}
        bgGradient="radial(900px 500px at 90% 10%, rgba(251,191,36,0.18), transparent 60%), radial(700px 450px at 10% 90%, rgba(96,165,250,0.18), transparent 60%)"
      />
      <Header />
      <Box position="relative" zIndex={1} pt="110px" px={6} pb={16} maxW="1200px" mx="auto">
        <Stack spacing={8}>
          <Box
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            bg="whiteAlpha.900"
            boxShadow="0 20px 60px rgba(15,23,42,0.08)"
            p={[6, 8]}
          >
            <Stack spacing={6}>
              <HStack justify="space-between" align="start" wrap="wrap" spacing={4}>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.3em" color="gray.500" fontWeight="600">
                    HTSM Panel
                  </Text>
                  <Text fontSize="2xl" fontWeight="700" color="gray.900" mt={2}>
                    Hantera dina dispositionsplaner
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={2} maxW="520px">
                    Skapa nya projekt, följ status och öppna planerna direkt. Allt samlat i en snabb vy.
                  </Text>
                </Box>
                <Button
                  bg="gray.900"
                  color="white"
                  size="lg"
                  borderRadius="full"
                  px={8}
                  _hover={{ bg: 'gray.800' }}
                  onClick={() => navigate('/skapa-projekt')}
                >
                  + Skapa nytt projekt
                </Button>
              </HStack>

              <SimpleGrid columns={[1, 3]} spacing={4}>
                <Box borderRadius="xl" border="1px solid" borderColor="gray.200" p={4} bg="gray.50">
                  <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="0.2em">
                    Projekt
                  </Text>
                  <Text fontSize="2xl" fontWeight="700" mt={2}>
                    {projects.length}
                  </Text>
                </Box>
                <Box borderRadius="xl" border="1px solid" borderColor="gray.200" p={4} bg="gray.50">
                  <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="0.2em">
                    Status
                  </Text>
                  <Text fontSize="sm" fontWeight="600" mt={3} color="gray.700">
                    {loading ? 'Laddar…' : 'Redo'}
                  </Text>
                </Box>
                <Box borderRadius="xl" border="1px solid" borderColor="gray.200" p={4} bg="gray.50">
                  <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="0.2em">
                    Snabbtips
                  </Text>
                  <Text fontSize="sm" fontWeight="600" mt={3} color="gray.700">
                    Öppna en plan för att redigera rader direkt.
                  </Text>
                </Box>
              </SimpleGrid>
            </Stack>
          </Box>

          <Box
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            bg="whiteAlpha.900"
            boxShadow="0 16px 40px rgba(15,23,42,0.06)"
            p={[6, 8]}
          >
            <HStack justify="space-between" mb={6} wrap="wrap" spacing={3}>
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.900">
                  Projekt
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Öppna ett projekt för att gå till dispositionsplanen.
                </Text>
              </Box>
              <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={3} py={1}>
                {projects.length} projekt
              </Badge>
            </HStack>

            {loading ? (
              <VStack spacing={3} align="center" py={6}>
                <Spinner color="gray.700" size="lg" />
                <Text color="gray.600">Hämtar projekt...</Text>
              </VStack>
            ) : projects.length === 0 ? (
              <Box
                border="1px dashed"
                borderColor="gray.300"
                borderRadius="xl"
                p={6}
                textAlign="center"
                color="gray.500"
                bg="gray.50"
              >
                Inga projekt hittades ännu. Skapa ditt första projekt.
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {projects.map((project) => (
                  <Box
                    key={project.id}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    p={4}
                    bg="white"
                    transition="all 0.2s ease"
                    _hover={{ borderColor: 'gray.400', boxShadow: '0 8px 20px rgba(15,23,42,0.08)' }}
                  >
                    <HStack justify="space-between" align="center" wrap="wrap" spacing={3}>
                      <Box>
                        <Text fontWeight="700" color="gray.900">
                          {project.name}
                        </Text>
                        {project.plats && (
                          <Text fontSize="sm" color="gray.600">
                            {project.plats}
                          </Text>
                        )}
                      </Box>
                      <Button
                        variant="outline"
                        borderRadius="full"
                        size="sm"
                        onClick={() => navigate(`/plan/${project.id}`)}
                      >
                        Visa projekt
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;
