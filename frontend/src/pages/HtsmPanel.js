import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Badge,
  Box,
  Button,
  Collapse,
  Input,
  Spinner,
  Switch,
  Text,
  useToast,
  VStack,
  HStack,
  Stack,
} from '@chakra-ui/react';
import Header from '../components/Header';
import { apiUrl } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');
  const [exportingProjectId, setExportingProjectId] = useState(null);
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState(null);
  const [updatingSentStatusId, setUpdatingSentStatusId] = useState(null);
  const [showSentProjects, setShowSentProjects] = useState(false);
  const toast = useToast();
  const fetchUserAndProjects = useCallback(async () => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
      storedUser = null;
    }

    const token = storedUser?.token || localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setLoadError('Ingen aktiv inloggning hittades.');
      return;
    }

    try {
      setLoadError('');
      const projectRes = await axios.get(
        apiUrl('/api/projects'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProjects(Array.isArray(projectRes.data) ? projectRes.data : []);
    } catch (error) {
      console.error('Kunde inte hämta projekt för HTSM-panelen:', error);
      setLoadError('Kunde inte hämta projekten just nu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const isProjectSent = (project) => Boolean(project?.formState?.sentToManagement);

  const filteredProjects = projects.filter((project) =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProjects = filteredProjects.filter((project) => !isProjectSent(project));
  const sentProjects = filteredProjects.filter((project) => isProjectSent(project));

  useEffect(() => {
    fetchUserAndProjects();
  }, [fetchUserAndProjects]);

  const handleExportDisp = async (project) => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
      storedUser = null;
    }

    const token = storedUser?.token || localStorage.getItem('token');
    if (!token || !project?.id) {
      setLoadError('Logga in igen för att skapa disp.');
      return;
    }

    try {
      setExportingProjectId(project.id);
      const response = await fetch(apiUrl(`/api/projects/${project.id}/export-disp?ts=${Date.now()}`), {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Kunde inte skapa disp');
      }

      const blob = await response.blob();
      const explicitFilename = response.headers.get('X-Export-Filename') || '';
      const contentDisposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fallbackFilename = `${project.name || 'dispositionsarbetsplan'}-${Date.now()}.pdf`;
      const filename = explicitFilename || filenameMatch?.[1] || fallbackFilename;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Kunde inte exportera dispositionsarbetsplan:', error);
      setLoadError('Kunde inte skapa disp just nu.');
    } finally {
      setExportingProjectId(null);
    }
  };

  const handleVisibilityChange = async (project, nextVisibleToTsm) => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
      storedUser = null;
    }

    const token = storedUser?.token || localStorage.getItem('token');
    if (!token || !project?.id) {
      setLoadError('Logga in igen för att uppdatera projektsynlighet.');
      return;
    }

    try {
      setUpdatingVisibilityId(project.id);
      setProjects((prev) => prev.map((item) => (
        item.id === project.id
          ? { ...item, visibleToTsm: nextVisibleToTsm }
          : item
      )));

      await axios.patch(
        apiUrl(`/api/projects/${project.id}/visibility`),
        { visibleToTsm: nextVisibleToTsm },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: nextVisibleToTsm ? 'Projekt visas för TSM' : 'Projekt dolt för TSM',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Kunde inte uppdatera projektsynlighet:', error);
      setProjects((prev) => prev.map((item) => (
        item.id === project.id
          ? { ...item, visibleToTsm: !nextVisibleToTsm }
          : item
      )));
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Kunde inte uppdatera synlighet';
      toast({
        title: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingVisibilityId(null);
    }
  };

  const handleSentStatusChange = async (project, nextSentStatus) => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
      storedUser = null;
    }

    const token = storedUser?.token || localStorage.getItem('token');
    if (!token || !project?.id) {
      setLoadError('Logga in igen för att uppdatera skickat-status.');
      return;
    }

    try {
      setUpdatingSentStatusId(project.id);
      setProjects((prev) => prev.map((item) => (
        item.id === project.id
          ? {
              ...item,
              formState: {
                ...(item.formState || {}),
                sentToManagement: nextSentStatus,
              },
            }
          : item
      )));

      await axios.patch(
        apiUrl(`/api/projects/${project.id}/sent-status`),
        { sentToManagement: nextSentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: nextSentStatus ? 'Projekt markerat som skickat' : 'Projekt åter i aktiv lista',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Kunde inte uppdatera skickat-status:', error);
      setProjects((prev) => prev.map((item) => (
        item.id === project.id
          ? {
              ...item,
              formState: {
                ...(item.formState || {}),
                sentToManagement: !nextSentStatus,
              },
            }
          : item
      )));
      toast({
        title: error?.response?.data?.error || 'Kunde inte uppdatera skickat-status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingSentStatusId(null);
    }
  };

  const handleOpenProject = (project, destination) => {
    if (isProjectSent(project)) {
      const confirmed = window.confirm(
        'Det här projektet är markerat som skickat till arbetsledningen. Om du öppnar det nu riskerar du att ändra i ett aktivt projekt. Vill du fortsätta?'
      );
      if (!confirmed) {
        return;
      }
    }

    if (destination === 'project') {
      navigate('/skapa-projekt', { state: { projectId: project.id } });
      return;
    }

    if (destination === 'plan') {
      navigate(`/plan/${project.id}`);
    }
  };

  const renderProjectCard = (project) => (
    <Box
      key={project.id}
      border="1px solid"
      borderColor={isProjectSent(project) ? 'orange.300' : 'blue.300'}
      borderRadius="xl"
      p={4}
      bg={isProjectSent(project) ? 'orange.100' : 'blue.50'}
      transition="all 0.2s ease"
      _hover={{ borderColor: isProjectSent(project) ? 'orange.400' : 'blue.400', boxShadow: '0 10px 24px rgba(15,23,42,0.10)' }}
    >
      <HStack justify="space-between" align="center" wrap="wrap" spacing={3}>
        <Box>
          <HStack spacing={3} align="center" wrap="wrap">
            <Text fontWeight="700" color="gray.900">
              {project.name}
            </Text>
            {isProjectSent(project) && (
              <Badge colorScheme="orange" borderRadius="full" px={3} py={1} textTransform="none">
                Skickat
              </Badge>
            )}
          </HStack>
          {project.plats && (
            <Text fontSize="sm" color="gray.600">
              {project.plats}
            </Text>
          )}
          <HStack spacing={3} mt={3} wrap="wrap">
            <HStack spacing={2}>
              <Switch
                colorScheme="green"
                isChecked={Boolean(project.visibleToTsm)}
                isDisabled={updatingVisibilityId === project.id}
                onChange={(event) => handleVisibilityChange(project, event.target.checked)}
              />
              <Text fontSize="sm" color="gray.700" fontWeight="600">
                Visa för TSM
              </Text>
            </HStack>
            <Text fontSize="xs" color={project.visibleToTsm ? 'green.600' : 'gray.500'}>
              {project.visibleToTsm ? 'Synligt i TSM-panelen' : 'Dolt från TSM-panelen'}
            </Text>
            <Button
              variant={isProjectSent(project) ? 'solid' : 'outline'}
              colorScheme={isProjectSent(project) ? 'orange' : 'gray'}
              borderRadius="full"
              size="xs"
              isLoading={updatingSentStatusId === project.id}
              onClick={() => handleSentStatusChange(project, !isProjectSent(project))}
            >
              {isProjectSent(project) ? 'Ta tillbaka till aktiv' : 'Markera som skickat'}
            </Button>
          </HStack>
          {isProjectSent(project) && (
            <Text mt={2} fontSize="xs" color="orange.700">
              Projektet är undanlagt från huvudlistan och varnar innan öppning.
            </Text>
          )}
        </Box>
        <HStack spacing={2}>
          <Button
            variant="outline"
            borderRadius="full"
            size="sm"
            borderColor={isProjectSent(project) ? 'orange.400' : 'blue.400'}
            bg={isProjectSent(project) ? 'whiteAlpha.800' : 'white'}
            onClick={() => handleExportDisp(project)}
            isLoading={exportingProjectId === project.id}
            loadingText="Skapar disp"
          >
            Skapa disp
          </Button>
          <Button
            variant="outline"
            borderRadius="full"
            size="sm"
            borderColor={isProjectSent(project) ? 'orange.400' : 'blue.400'}
            bg={isProjectSent(project) ? 'whiteAlpha.800' : 'white'}
            onClick={() => handleOpenProject(project, 'project')}
          >
            Visa projekt
          </Button>
          <Button
            bg={isProjectSent(project) ? 'orange.500' : 'blue.700'}
            color="white"
            borderRadius="full"
            size="sm"
            _hover={{ bg: isProjectSent(project) ? 'orange.600' : 'blue.800' }}
            onClick={() => handleOpenProject(project, 'plan')}
          >
            Visa planka
          </Button>
        </HStack>
      </HStack>
    </Box>
  );

  return (
    <Box minH="100vh" bg="#F4F6FA">
      <Box
        position="fixed"
        inset={0}
        zIndex={0}
        bgGradient="radial(900px 500px at 90% 10%, rgba(251,191,36,0.24), transparent 60%), radial(700px 450px at 10% 90%, rgba(96,165,250,0.24), transparent 60%)"
      />
      <Header />
      <Box position="relative" zIndex={1} pt="110px" px={6} pb={16} maxW="1200px" mx="auto">
        <Stack spacing={8}>
          <Box
            borderRadius="2xl"
            border="1px solid"
            borderColor="blue.200"
            bgGradient="linear(to-br, blue.50, white, blue.100)"
            boxShadow="0 20px 60px rgba(59,130,246,0.10)"
            p={[6, 8]}
          >
            <Stack spacing={6}>
              <HStack justify="space-between" align="start" wrap="wrap" spacing={4}>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.3em" color="blue.700" fontWeight="700">
                    HTSM Panel
                  </Text>
                  <Text fontSize="2xl" fontWeight="700" color="black" mt={2}>
                    Hantera dina dispositionsplaner
                  </Text>
                  <Text fontSize="sm" color="gray.700" mt={2} maxW="520px">
                    Skapa nya projekt, följ status och öppna planerna direkt. Allt samlat i en snabb vy.
                  </Text>
                </Box>
                <Button
                  bg="blue.700"
                  color="white"
                  size="lg"
                  borderRadius="full"
                  px={8}
                  _hover={{ bg: 'blue.800' }}
                  onClick={() => navigate('/skapa-projekt')}
                >
                  + Skapa nytt projekt
                </Button>
              </HStack>
            </Stack>
          </Box>

          <Box
            borderRadius="2xl"
            border="1px solid"
            borderColor="emerald.200"
            bgGradient="linear(to-br, emerald.50, white, emerald.100)"
            boxShadow="0 16px 40px rgba(16,185,129,0.08)"
            p={[6, 8]}
          >
            <HStack justify="space-between" mb={6} wrap="wrap" spacing={3}>
              <Box>
                <Text fontSize="sm" fontWeight="700" color="black">
                  Projekt
                </Text>
                <Text fontSize="xs" color="gray.700">
                  Öppna ett projekt för att gå till dispositionsplanen.
                </Text>
              </Box>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök projektnamn"
                maxW="280px"
                borderRadius="full"
                bg="white"
                borderColor="emerald.300"
              />
            </HStack>

            {loading ? (
              <VStack spacing={3} align="center" py={6}>
                <Spinner color="blue.700" size="lg" />
                <Text color="gray.700">Hämtar projekt...</Text>
              </VStack>
            ) : loadError ? (
              <Box
                border="1px solid"
                borderColor="red.200"
                borderRadius="xl"
                p={6}
                textAlign="center"
                color="red.600"
                bg="red.50"
              >
                <Text fontWeight="700">{loadError}</Text>
                <Button
                  mt={4}
                  size="sm"
                  borderRadius="full"
                  onClick={fetchUserAndProjects}
                >
                  Försök igen
                </Button>
              </Box>
            ) : filteredProjects.length === 0 ? (
              <Box
                border="1px dashed"
                borderColor="gray.300"
                borderRadius="xl"
                p={6}
                textAlign="center"
                color="gray.500"
                bg="gray.50"
              >
                {projects.length === 0
                  ? 'Inga projekt hittades ännu. Skapa ditt första projekt.'
                  : 'Inga projekt matchar din sökning.'}
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {activeProjects.length ? (
                  activeProjects.map(renderProjectCard)
                ) : (
                  <Box
                    border="1px dashed"
                    borderColor="gray.300"
                    borderRadius="xl"
                    p={5}
                    textAlign="center"
                    color="gray.500"
                    bg="gray.50"
                  >
                    Inga aktiva projekt matchar din sökning.
                  </Box>
                )}

                <Box borderTop="1px solid" borderColor="gray.200" pt={2}>
                  <Button
                    variant="ghost"
                    justifyContent="space-between"
                    width="full"
                    borderRadius="xl"
                    px={3}
                    onClick={() => setShowSentProjects((prev) => !prev)}
                  >
                    <HStack spacing={3}>
                      <Text fontWeight="700" color="black">
                        Skickade projekt
                      </Text>
                      <Badge colorScheme="orange" borderRadius="full" px={3} py={1} textTransform="none">
                        {sentProjects.length}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {showSentProjects ? 'Dölj' : 'Visa'}
                    </Text>
                  </Button>
                  <Collapse in={showSentProjects} animateOpacity>
                    <VStack spacing={4} align="stretch" mt={4}>
                      {sentProjects.length ? (
                        sentProjects.map(renderProjectCard)
                      ) : (
                        <Box
                          border="1px dashed"
                          borderColor="gray.300"
                          borderRadius="xl"
                          p={5}
                          textAlign="center"
                          color="gray.500"
                          bg="gray.50"
                        >
                          Inga skickade projekt matchar din sökning.
                        </Box>
                      )}
                    </VStack>
                  </Collapse>
                </Box>
              </VStack>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;
