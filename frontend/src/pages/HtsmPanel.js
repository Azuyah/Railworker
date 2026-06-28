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
import { apiUrl, PROD_API_BASE_URL, isLocalAppHost } from '../lib/api';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    return null;
  }
};

const getLocalToken = () => getStoredUser()?.token || localStorage.getItem('token') || '';

const getLiveSyncToken = () => {
  try {
    return localStorage.getItem('railworker.liveSyncToken') || '';
  } catch (error) {
    return '';
  }
};

const saveLiveSyncToken = (token) => {
  try {
    localStorage.setItem('railworker.liveSyncToken', token);
  } catch (error) {
    // ignore storage issues
  }
};

const clearLiveSyncToken = () => {
  try {
    localStorage.removeItem('railworker.liveSyncToken');
  } catch (error) {
    // ignore storage issues
  }
};

const BULK_LIVE_SYNC_ID = 'bulk-live-sync';

const getLiveSyncStatus = (project) => {
  const syncedAt = project?.formState?.liveSync?.syncedAt;
  if (!syncedAt) {
    return {
      label: 'Endast lokalt',
      colorScheme: 'gray',
      helper: 'Projektet finns bara på den här datorn tills du publicerar det till live.',
    };
  }

  return {
    label: 'Publicerad live',
    colorScheme: 'green',
    helper: `Senast publicerad ${new Date(syncedAt).toLocaleString('sv-SE')}.`,
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');
  const [exportingProjectId, setExportingProjectId] = useState(null);
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState(null);
  const [updatingSentStatusId, setUpdatingSentStatusId] = useState(null);
  const [syncingProjectId, setSyncingProjectId] = useState(null);
  const [showSentProjects, setShowSentProjects] = useState(false);
  const toast = useToast();
  const showLiveSync = isLocalAppHost();

  const requestLiveSyncToken = () => {
    const existing = getLiveSyncToken();
    const token = window.prompt(
      'Klistra in live-HTSM-tokenen från railworker.vercel.app så kan projektet publiceras till live.',
      existing || ''
    );
    if (!token) {
      return '';
    }
    const trimmed = token.trim();
    if (trimmed) {
      saveLiveSyncToken(trimmed);
    }
    return trimmed;
  };

  const toLivePayload = (project) => ({
    name: project?.name || '',
    startDate: project?.startDate || '',
    startTime: project?.startTime || '',
    endDate: project?.endDate || '',
    endTime: project?.endTime || '',
    plats: project?.plats || '',
    namn: project?.namn || '',
    telefonnummer: project?.telefonnummer || '',
    granspunkter: project?.granspunkter || '',
    formState: project?.formState || {},
    visibleToTsm: Boolean(project?.visibleToTsm),
    rows: project?.rows || null,
    anteckningar: project?.anteckningar || [],
    sections: Array.isArray(project?.sections)
      ? project.sections.map((section) => ({
          type: section?.type || 'Delområde',
          name: section?.name || section?.signal || '',
          signal: section?.signal || section?.name || '',
          namingMode: section?.namingMode || 'NUMBERS',
        }))
      : [],
    beteckningar: Array.isArray(project?.beteckningar)
      ? project.beteckningar.map((item) => ({
          label: item?.label || item?.value || '',
          value: item?.value || item?.label || '',
        }))
      : [],
  });

  const persistLocalLiveSyncMeta = async (fullProject, liveProjectId) => {
    const localToken = getLocalToken();
    if (!localToken || !fullProject?.id) return;

    const nextProject = {
      ...fullProject,
      formState: {
        ...(fullProject.formState || {}),
        liveSync: {
          liveProjectId,
          syncedAt: new Date().toISOString(),
        },
      },
    };

    await axios.put(apiUrl(`/api/projects/${fullProject.id}`), toLivePayload(nextProject), {
      headers: {
        Authorization: `Bearer ${localToken}`,
      },
    });
  };

  const fetchUserAndProjects = useCallback(async () => {
    const token = getLocalToken();
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
  const projectsMarkedForLive = projects.filter((project) => Boolean(project?.visibleToTsm));

  const activeProjects = filteredProjects.filter((project) => !isProjectSent(project));
  const sentProjects = filteredProjects.filter((project) => isProjectSent(project));

  useEffect(() => {
    fetchUserAndProjects();
  }, [fetchUserAndProjects]);

  const handleExportDisp = async (project) => {
    const token = getLocalToken();
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
    const token = getLocalToken();
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
    const token = getLocalToken();
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

  const syncProjectToLive = async (project, preferredLiveToken = '') => {
    const localToken = getLocalToken();
    if (!localToken || !project?.id) {
      throw new Error('Ingen lokal inloggning hittades');
    }

    const liveToken = preferredLiveToken || getLiveSyncToken() || requestLiveSyncToken();
    if (!liveToken) {
      throw new Error('Live-token saknas');
    }

    const syncProject = async (token, fullProject, payload) => {
      const liveProjectsRes = await axios.get(`${PROD_API_BASE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const liveProjects = Array.isArray(liveProjectsRes.data) ? liveProjectsRes.data : [];
      const storedLiveProjectId = Number(fullProject?.formState?.liveSync?.liveProjectId);
      const matchingLiveProject =
        liveProjects.find((item) => Number(item.id) === storedLiveProjectId) ||
        liveProjects.find((item) =>
          String(item?.name || '').trim() === String(fullProject?.name || '').trim() &&
          String(item?.startDate || '') === String(fullProject?.startDate || '') &&
          String(item?.plats || '').trim() === String(fullProject?.plats || '').trim()
        );

      let liveProjectId = null;
      if (matchingLiveProject?.id) {
        await axios.put(`${PROD_API_BASE_URL}/api/projects/${matchingLiveProject.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        liveProjectId = matchingLiveProject.id;
      } else {
        const createRes = await axios.post(`${PROD_API_BASE_URL}/api/projects`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        liveProjectId = createRes.data?.id || null;
      }

      if (liveProjectId && typeof payload.visibleToTsm === 'boolean') {
        await axios.patch(
          `${PROD_API_BASE_URL}/api/projects/${liveProjectId}/visibility`,
          { visibleToTsm: payload.visibleToTsm },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (liveProjectId && typeof fullProject?.formState?.sentToManagement === 'boolean') {
        await axios.patch(
          `${PROD_API_BASE_URL}/api/projects/${liveProjectId}/sent-status`,
          { sentToManagement: Boolean(fullProject.formState.sentToManagement) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      return liveProjectId;
    };

    const localProjectRes = await axios.get(apiUrl(`/api/project/${project.id}`), {
      headers: {
        Authorization: `Bearer ${localToken}`,
      },
    });
    const fullProject = localProjectRes.data;
    const payload = toLivePayload(fullProject);
    let liveProjectId = null;
    let tokenUsed = liveToken;

    try {
      liveProjectId = await syncProject(liveToken, fullProject, payload);
    } catch (error) {
      const status = Number(error?.response?.status);
      if (status !== 401 && status !== 403) {
        throw error;
      }

      clearLiveSyncToken();
      const replacementToken = requestLiveSyncToken();
      if (!replacementToken) {
        throw error;
      }

      tokenUsed = replacementToken;
      liveProjectId = await syncProject(replacementToken, fullProject, payload);
    }

    if (liveProjectId) {
      await persistLocalLiveSyncMeta(fullProject, liveProjectId);
    }

    return {
      liveProjectId,
      payload,
      tokenUsed,
    };
  };

  const handleSyncProjectToLive = async (project) => {
    try {
      setSyncingProjectId(project.id);
      const { payload } = await syncProjectToLive(project);
      await fetchUserAndProjects();

      toast({
        title: 'Projekt publicerat till live',
        description: payload.visibleToTsm
          ? 'Projektet finns nu i live och är redo för TSM om datumen fortfarande är aktuella.'
          : 'Projektet finns nu i live. Slå på Visa för TSM när det ska bli synligt.',
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Kunde inte publicera projekt till live:', error);
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        clearLiveSyncToken();
      }
      toast({
        title: 'Kunde inte publicera till live',
        description:
          error?.response?.data?.error ||
          error?.message ||
          'Kontrollera live-tokenen och försök igen.',
        status: 'error',
        duration: 4500,
        isClosable: true,
      });
    } finally {
      setSyncingProjectId(null);
    }
  };

  const handleSyncMarkedProjectsToLive = async () => {
    if (!projectsMarkedForLive.length) {
      toast({
        title: 'Inga projekt markerade för TSM',
        description: 'Slå på Visa för TSM på de projekt som ska publiceras live.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSyncingProjectId(BULK_LIVE_SYNC_ID);
      let currentLiveToken = getLiveSyncToken() || requestLiveSyncToken();
      if (!currentLiveToken) {
        return;
      }

      let successCount = 0;
      const failedProjects = [];

      for (const project of projectsMarkedForLive) {
        try {
          const { tokenUsed } = await syncProjectToLive(project, currentLiveToken);
          currentLiveToken = tokenUsed || currentLiveToken;
          successCount += 1;
        } catch (error) {
          failedProjects.push({
            name: project.name || `Projekt ${project.id}`,
            error,
          });
        }
      }

      await fetchUserAndProjects();

      if (!failedProjects.length) {
        toast({
          title: `${successCount} projekt publicerade till live`,
          description: 'Alla projekt som är markerade för TSM är nu publicerade till live.',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const firstError =
        failedProjects[0]?.error?.response?.data?.error ||
        failedProjects[0]?.error?.message ||
        'Okänt fel';

      toast({
        title: `${successCount} projekt publicerade, ${failedProjects.length} misslyckades`,
        description: `${failedProjects[0]?.name}: ${firstError}`,
        status: successCount > 0 ? 'warning' : 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSyncingProjectId(null);
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
            <Text fontWeight="700" color="gray.900" fontSize="lg">
              {project.name}
            </Text>
            {showLiveSync && (
              <Badge
                colorScheme={getLiveSyncStatus(project).colorScheme}
                borderRadius="full"
                px={3}
                py={1}
                textTransform="none"
              >
                {getLiveSyncStatus(project).label}
              </Badge>
            )}
            {isProjectSent(project) && (
              <Badge colorScheme="orange" borderRadius="full" px={3} py={1} textTransform="none">
                Skickat
              </Badge>
            )}
          </HStack>
          {project.plats && (
            <Text fontSize="sm" color="gray.600" mt={1}>
              {project.plats}
            </Text>
          )}
          <Text fontSize="sm" color="gray.600" mt={2}>
            {project.formState?.dispSettings?.veckaOchDagar || 'Ingen vecka/dag-rad angiven ännu'}
          </Text>
          {showLiveSync && (
            <Text fontSize="xs" color="gray.700" mt={2} fontWeight="600">
              {getLiveSyncStatus(project).helper}
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
              {isProjectSent(project) ? 'Ta tillbaka till aktiv lista' : 'Markera som skickat'}
            </Button>
          </HStack>
          {isProjectSent(project) && (
            <Text mt={2} fontSize="xs" color="orange.700">
              Projektet är undanlagt från huvudlistan och varnar innan öppning så att du inte råkar ändra i ett aktivt utskick.
            </Text>
          )}
        </Box>
        <HStack spacing={2}>
          {showLiveSync && (
            <Button
              variant="outline"
              borderRadius="full"
              size="sm"
              borderColor="emerald.400"
              bg="white"
              color="emerald.700"
              onClick={() => handleSyncProjectToLive(project)}
              isLoading={syncingProjectId === project.id}
              loadingText="Publicerar"
            >
              Publicera live
            </Button>
          )}
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
            Ladda ner disp
          </Button>
          <Button
            variant="outline"
            borderRadius="full"
            size="sm"
            borderColor={isProjectSent(project) ? 'orange.400' : 'blue.400'}
            bg={isProjectSent(project) ? 'whiteAlpha.800' : 'white'}
            onClick={() => handleOpenProject(project, 'project')}
          >
            Öppna projekt
          </Button>
          <Button
            bg={isProjectSent(project) ? 'orange.500' : 'blue.700'}
            color="white"
            borderRadius="full"
            size="sm"
            _hover={{ bg: isProjectSent(project) ? 'orange.600' : 'blue.800' }}
            onClick={() => handleOpenProject(project, 'plan')}
          >
            Öppna planka
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
                    Skapa nya projekt, håll koll på vad som är öppet för TSM och lägg undan sådant som redan skickats till arbetsledningen.
                  </Text>
                  {showLiveSync && (
                    <Text fontSize="xs" color="blue.700" mt={2} maxW="560px" fontWeight="600">
                      Publicera projekt till live härifrån när de ska bli synliga för TSM på railworker.vercel.app.
                    </Text>
                  )}
                </Box>
                <HStack spacing={3} wrap="wrap">
                  {showLiveSync && (
                    <Button
                      variant="outline"
                      borderColor="emerald.400"
                      color="emerald.700"
                      bg="white"
                      size="lg"
                      borderRadius="full"
                      px={6}
                      onClick={handleSyncMarkedProjectsToLive}
                      isLoading={syncingProjectId === BULK_LIVE_SYNC_ID}
                      isDisabled={!projectsMarkedForLive.length}
                      loadingText="Publicerar markerade"
                    >
                      {`Publicera markerade live (${projectsMarkedForLive.length})`}
                    </Button>
                  )}
                  <Button
                    bg="blue.700"
                    color="white"
                    size="lg"
                    borderRadius="full"
                    px={8}
                    _hover={{ bg: 'blue.800' }}
                    onClick={() => navigate('/skapa-projekt')}
                  >
                    + Skapa projekt
                  </Button>
                </HStack>
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
                  Öppna ett projekt för att arbeta vidare med disp, planka eller synlighet för TSM.
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
                    Inga aktiva projekt matchar din sökning just nu.
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
