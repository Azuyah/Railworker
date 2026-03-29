import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SimpleGrid,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  Button,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import Header from '../components/Header';
import { getSectionLabel } from '../utils/sectionLabels';
import { apiUrl } from '../lib/api';

const ANORDNING_OPTIONS = [
  { value: 'A-S', label: 'A-Skydd' },
  { value: 'L-S', label: 'L-Skydd' },
  { value: 'S-S', label: 'S-Skydd' },
  { value: 'E-S', label: 'E-Skydd' },
  { value: 'Spf', label: 'Spärrfärd' },
  { value: 'Vxl', label: 'Växling' },
  { value: 'Tvn', label: 'Tågvarning' },
];

const isAllowedAnordningCombo = (left, right) => {
  const pair = [left, right].sort().join('|');
  return pair === 'A-S|Spf' || pair === 'A-S|Vxl';
};

const normalizeDateForInput = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDesiredEndTime = (project) => {
  const raw = String(project?.endTime || project?.formState?.avslutningstid || '').trim();
  const match = raw.match(/^(\d{1,2})[:.](\d{2})$/);
  if (!match) return '';

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';

  const totalMinutes = ((hours * 60 + minutes - 10) + 24 * 60) % (24 * 60);
  const nextHours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const nextMinutes = String(totalMinutes % 60).padStart(2, '0');
  return `${nextHours}:${nextMinutes}`;
};

const buildPlanEntries = (project) => {
  const entries = Array.isArray(project?.formState?.blankett31Entries)
    ? project.formState.blankett31Entries.filter((entry) => entry?.startDate || entry?.beteckning)
    : [];

  if (entries.length) {
    return entries;
  }

  return [
    {
      beteckning: project?.beteckningar?.[0]?.label || '',
      startDate: project?.startDate || '',
      startTime: project?.startTime || '',
      endDate: project?.endDate || '',
      endTime: project?.endTime || '',
    },
  ];
};

const getPlanEntryAnchor = (entry = {}) => {
  const date = normalizeDateForInput(entry.startDate || entry.endDate || '');
  const time = String(entry.startTime || entry.endTime || '00:00').trim() || '00:00';
  if (!date) return Number.POSITIVE_INFINITY;
  const parsed = new Date(`${date}T${time.length === 5 ? time : '00:00'}:00`);
  return Number.isNaN(parsed.getTime()) ? Number.POSITIVE_INFINITY : parsed.getTime();
};

const getNextPlanEntry = (project) => {
  const now = Date.now();
  const entries = buildPlanEntries(project)
    .map((entry) => ({ entry, anchor: getPlanEntryAnchor(entry) }))
    .filter(({ anchor }) => Number.isFinite(anchor))
    .sort((left, right) => left.anchor - right.anchor);

  return entries.find(({ anchor }) => anchor >= now)?.entry || null;
};

const getPlanEntryCutoffTimestamp = (entry) => {
  const anchor = getPlanEntryAnchor(entry);
  if (!Number.isFinite(anchor)) return Number.NEGATIVE_INFINITY;
  return anchor - 60 * 60 * 1000;
};

const isPlanningWindowOpen = (entry) => Date.now() < getPlanEntryCutoffTimestamp(entry);

const formatPlanTime = (value = '') => String(value || '').replace(':', '.');

const formatPlanDateForDisplay = (value = '') => {
  const normalized = normalizeDateForInput(value);
  if (!normalized) return '';

  const [year, month, day] = normalized.split('-');
  return `${day}/${month}/${year}`;
};

const isLineSection = (section = {}) => {
  const explicitType = String(section?.type || section?.sectionType || '').trim().toLowerCase();
  if (explicitType.includes('linje') || explicitType.includes('sträcka')) {
    return true;
  }
  if (explicitType.includes('dp') || explicitType.includes('driftplats')) {
    return false;
  }

  const label = String(section?.signal || section?.name || '').trim();
  return label.includes(' - ');
};

const getAllowedAskyddPairIds = (sections = [], selectedIds = []) => {
  const selectedSet = new Set(selectedIds);
  if (selectedIds.length === 0) {
    return new Set(sections.map((section) => section.id));
  }

  if (selectedIds.length >= 2) {
    return selectedSet;
  }

  const firstSelected = sections.find((section) => section.id === selectedIds[0]);
  if (!firstSelected) {
    return new Set(sections.map((section) => section.id));
  }

  const firstIndex = sections.findIndex((section) => section.id === firstSelected.id);
  const validIds = new Set([firstSelected.id]);

  [firstIndex - 1, firstIndex + 1].forEach((candidateIndex) => {
    const candidate = sections[candidateIndex];
    if (!candidate) return;
    if (isLineSection(candidate) === isLineSection(firstSelected)) return;
    validIds.add(candidate.id);
  });

  return validIds;
};

const normalizeSelectedSectionIds = (sections = [], selectedIds = [], anordning = []) => {
  const uniqueSelectedIds = [...new Set(selectedIds)];

  if (anordning.includes('L-S')) {
    const firstLineId = uniqueSelectedIds.find((id) =>
      sections.some((section) => section.id === id && isLineSection(section))
    );
    return firstLineId ? [firstLineId] : [];
  }

  if (anordning.includes('A-S')) {
    if (uniqueSelectedIds.length === 0) return [];

    const firstSelected = sections.find((section) => section.id === uniqueSelectedIds[0]);
    if (!firstSelected) return [];

    const validIds = getAllowedAskyddPairIds(sections, [firstSelected.id]);
    const secondSelectedId = uniqueSelectedIds
      .slice(1)
      .find((id) => validIds.has(id) && id !== firstSelected.id);

    return secondSelectedId ? [firstSelected.id, secondSelectedId] : [firstSelected.id];
  }

  return uniqueSelectedIds;
};

export default function Panel() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userDataRaw = localStorage.getItem('user');
  const user = userDataRaw ? JSON.parse(userDataRaw) : null;
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);
  const [begardDatum, setBegardDatum] = useState('');
  const [begard, setBegard] = useState('');
  const [tsa, setTsa] = useState(false);
  const [anteckning, setAnteckning] = useState('');
  const [anordning, setAnordning] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [exportingProjectId, setExportingProjectId] = useState(null);
  const namn = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const telefon = user?.phone || '';
  const toast = useToast();
  const nextPlanEntry = useMemo(
    () => getNextPlanEntry(selectedProject),
    [selectedProject]
  );

  const getUserPlansForProject = useCallback(
    (project) => {
      const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLowerCase();
      const phone = String(user?.phone || '').trim();
      const pendingRows = Array.isArray(project?.tsmRows)
        ? project.tsmRows.filter((row) => row.userId === user?.id && row.isPending !== false)
        : [];
      const approvedRows = Array.isArray(project?.rows)
        ? project.rows.filter((row) => {
            const rowName = String(row?.namn || '').trim().toLowerCase();
            const rowPhone = String(row?.telefon || '').trim();
            return (
              row?.userId === user?.id ||
              (!!phone && rowPhone === phone) ||
              (!!fullName && rowName === fullName)
            );
          })
        : [];

      return [...approvedRows, ...pendingRows];
    },
    [user?.firstName, user?.id, user?.lastName, user?.phone]
  );

  const isAnordningOptionDisabled = useCallback((optionValue) => {
    if (anordning.includes(optionValue)) return false;
    if (anordning.length === 0) return false;
    if (anordning.length >= 2) return true;
    return !isAllowedAnordningCombo(anordning[0], optionValue);
  }, [anordning]);

  const isLSkyddSelected = anordning.includes('L-S');
  const isASkyddSelected = anordning.includes('A-S');

  const isSectionSelectionDisabled = useCallback((section) => {
    if (!selectedProject?.sections) return false;
    if (isLSkyddSelected) {
      return !isLineSection(section);
    }
    if (isASkyddSelected) {
      const allowedIds = getAllowedAskyddPairIds(selectedProject.sections, selectedSectionIds);
      return !allowedIds.has(section.id);
    }
    return false;
  }, [isASkyddSelected, isLSkyddSelected, selectedProject?.sections, selectedSectionIds]);

  const handleAnordningChange = useCallback((optionValue, checked) => {
    setAnordning((prev) => {
      if (!checked) {
        return prev.filter((value) => value !== optionValue);
      }

      if (prev.includes(optionValue)) {
        return prev;
      }

      if (prev.length === 0) {
        if (checked && (optionValue === 'L-S' || optionValue === 'A-S') && selectedProject?.sections) {
          setSelectedSectionIds((current) =>
            normalizeSelectedSectionIds(selectedProject.sections, current, [...prev, optionValue])
          );
        }
        return [optionValue];
      }

      if (prev.length === 1 && isAllowedAnordningCombo(prev[0], optionValue)) {
        const nextValues = [...prev, optionValue];
        if (selectedProject?.sections && (optionValue === 'A-S' || prev[0] === 'A-S')) {
          setSelectedSectionIds((current) =>
            normalizeSelectedSectionIds(selectedProject.sections, current, nextValues)
          );
        }
        return nextValues;
      }

      toast({
        title: 'Endast ett val tillåtet',
        description: 'Du kan bara kombinera A-Skydd med Spärrfärd eller Växling.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      return [optionValue];
    });
  }, [selectedProject?.sections, toast]);

  useEffect(() => {
    if ((!isLSkyddSelected && !isASkyddSelected) || !selectedProject?.sections) {
      return;
    }

    setSelectedSectionIds((current) =>
      normalizeSelectedSectionIds(selectedProject.sections, current, anordning)
    );
  }, [anordning, isASkyddSelected, isLSkyddSelected, selectedProject?.sections]);

  const getRowPlanDate = useCallback(
    (row) => normalizeDateForInput(row?.begardDatum || row?.datum || row?.startdatum || ''),
    []
  );

  const getProjectNextPlanDate = useCallback(
    (project) => {
      const nextEntry = getNextPlanEntry(project);
      return normalizeDateForInput(nextEntry?.startDate || nextEntry?.endDate || '');
    },
    []
  );

  const hasExistingNextPlanning = useCallback(
    (project) => {
      const nextPlanDate = getProjectNextPlanDate(project);
      if (!nextPlanDate) return false;

      return getUserPlansForProject(project).some((row) => getRowPlanDate(row) === nextPlanDate);
    },
    [getProjectNextPlanDate, getRowPlanDate, getUserPlansForProject]
  );

  const isPlanningClosedForProject = useCallback(
    (project) => {
      const nextEntry = getNextPlanEntry(project);
      if (!nextEntry) return false;
      return !isPlanningWindowOpen(nextEntry);
    },
    []
  );

  const handleSelfEnroll = async () => {
    try {
      let storedUser = null;
      try {
        storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      } catch (error) {
        storedUser = null;
      }
      const token = storedUser?.token || null;
      const targetPlanEntry = getNextPlanEntry(selectedProject);
      const targetPlanDate = normalizeDateForInput(targetPlanEntry?.startDate || targetPlanEntry?.endDate);

      if (!targetPlanEntry || !targetPlanDate) {
        toast({
          title: 'Ingen kommande planering hittades.',
          description: 'Det finns ingen nästa planering att förplanera mot på projektet.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      if (!isPlanningWindowOpen(targetPlanEntry)) {
        toast({
          title: 'Förplaneringen är stängd för den här planeringen.',
          description: 'Det är mindre än en timme kvar till dispstart. Nu behöver du ringa in.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (hasExistingNextPlanning(selectedProject)) {
        toast({
          title: 'Förplanering finns redan.',
          description: 'Du kan bara ha en förplanering för projektets nästa planering.',
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const selections = selectedProject.sections.map((sec) =>
        selectedSectionIds.includes(sec.id)
      );

      const response = await axios.post(
        apiUrl('/api/row/self-enroll'),
        {
          anordning,
          selections,
          begard,
          datum: targetPlanDate,
          begardDatum: targetPlanDate,
          tsa,
          anteckning,
          projectId: selectedProject.id,
          namn,
          telefon,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdRow = response.data;
      const updatedProject = {
        ...selectedProject,
        tsmRows: [...(selectedProject?.tsmRows || []), createdRow],
      };

      toast({
        title: 'Förplaneringen är skickad.',
        description: 'HTSM ringer upp.',
        status: 'success',
        duration: null,
        isClosable: true,
      });

      onClose();
      setBegard('');
      setBegardDatum('');
      setTsa(false);
      setAnteckning('');
      setAnordning([]);
      setSelectedSectionIds([]);
      setSelectedProject(updatedProject);
      setProjects((prev) =>
        prev.map((project) => (project.id === updatedProject.id ? updatedProject : project))
      );
    } catch (err) {
      console.error('❌ Fel vid TSM-anmälan:', err);
      toast({
        title: 'Kunde inte skicka anmälan.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExportDisp = useCallback(async (project) => {
    try {
      if (!token || !project?.id) {
        toast({
          title: 'Logga in igen för att ladda ner disp.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setExportingProjectId(project.id);
      const response = await fetch(apiUrl(`/api/projects/${project.id}/export-disp`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Kunde inte ladda ner disp');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const filename = filenameMatch?.[1] || `${project.name || 'dispositionsarbetsplan'}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Kunde inte ladda ner disp:', error);
      toast({
        title: 'Kunde inte ladda ner disp.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setExportingProjectId(null);
    }
  }, [toast, token]);

  const fetchAllProjects = useCallback(async () => {
    try {
      const response = await axios.get(
        apiUrl('/api/projects'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(response.data);
    } catch (error) {
      console.error('❌ Kunde inte hämta projekt:', error);
      setProjects([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchAllProjects();
  }, [fetchAllProjects, navigate, token]);

  useEffect(() => {
    if (!isOpen || !selectedProject) return;
    setBegard(getDesiredEndTime(nextPlanEntry || selectedProject));
    setBegardDatum(
      normalizeDateForInput(nextPlanEntry?.startDate || nextPlanEntry?.endDate)
    );
    setTsa(false);
  }, [isOpen, nextPlanEntry, selectedProject]);

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)',
        animation: 'fadeIn 1s ease-in-out',
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .fancy-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
          }

          .fancy-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
          }

          .fancy-button {
            transition: background 0.3s ease, transform 0.2s;
          }

          .fancy-button:hover {
            transform: scale(1.05);
          }

          .underline-link {
            position: relative;
            text-decoration: none;
          }

          .underline-link::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            bottom: -2px;
            left: 0;
            background-color: #3182ce;
            transform: scaleX(0);
            transform-origin: bottom right;
            transition: transform 0.3s ease-out;
          }

          .underline-link:hover::after {
            transform: scaleX(1);
            transform-origin: bottom left;
          }
        `}
      </style>

      <Header />
      <div className="pt-24 p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="fancy-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Tillgängliga projekt</h2>
              <p className="text-sm text-gray-500 mt-1">
                Förplanera direkt här. Dina aktiva projekt hålls kvar i bakgrunden tills vi bygger nästa mobilvy.
              </p>
            </div>
            {projects.length === 0 ? (
              <p className="text-gray-500">Inga projekt hittades.</p>
            ) : (
              <ul className="space-y-4">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="border rounded p-4 flex justify-between items-center transition duration-200 hover:shadow-md"
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {project.name}
                      </h3>
                      {project.plats && (
                        <p className="text-sm text-gray-500">{project.plats}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {user?.role === 'TSM' && (
                        <Button
                          onClick={() => handleExportDisp(project)}
                          className="fancy-button"
                          colorScheme="blue"
                          isLoading={exportingProjectId === project.id}
                          loadingText="Laddar"
                        >
                          Ladda ner disp
                        </Button>
                      )}
                      {user?.role === 'TSM' && (
                        <Button
                          onClick={() => {
                            if (hasExistingNextPlanning(project)) {
                              toast({
                                title: 'Förplanering finns redan',
                                description: 'Du har redan skickat en förplanering för projektets nästa planering.',
                                status: 'info',
                                duration: 5000,
                                isClosable: true,
                              });
                              return;
                            }

                            if (isPlanningClosedForProject(project)) {
                              toast({
                                title: 'Webbförplanering är stängd',
                                description: 'Förplanering på webben är stängd på grund av kort tid innan dispstart. Ring in och förplanera.',
                                status: 'info',
                                duration: 5000,
                                isClosable: true,
                              });
                              return;
                            }

                            setSelectedProject(project);
                            onOpen();
                          }}
                          className="fancy-button"
                          colorScheme="blue"
                          isDisabled={!getProjectNextPlanDate(project)}
                        >
                          {!getProjectNextPlanDate(project)
                            ? 'Ingen planering'
                            : hasExistingNextPlanning(project)
                              ? 'Redan förplanerad'
                              : isPlanningClosedForProject(project)
                                ? 'Ring in'
                                : 'Förplanera'}
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
            {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="white" color="black">
          <ModalHeader>Förplanera projektet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <FormControl>
                <FormLabel>Du förplanerar för nästa planering</FormLabel>
                <Input
                  value={
                    nextPlanEntry
                      ? `${formatPlanDateForDisplay(nextPlanEntry.startDate || nextPlanEntry.endDate)}${nextPlanEntry.startTime ? ` kl. ${formatPlanTime(nextPlanEntry.startTime)}` : ''}`
                      : 'Ingen kommande planering hittades'
                  }
                  isDisabled
                />
              </FormControl>

              {nextPlanEntry && !isPlanningWindowOpen(nextPlanEntry) && (
                <FormControl>
                  <FormLabel color="orange.600">Förplanering stängd</FormLabel>
                  <Input
                    value="Det är mindre än en timme kvar till dispstart. Nu behöver du ringa in."
                    isDisabled
                  />
                </FormControl>
              )}

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Ditt namn</FormLabel>
                  <Input value={namn} isDisabled />
                </FormControl>
                <FormControl>
                  <FormLabel>Ditt telefonnummer</FormLabel>
                  <Input value={telefon} isDisabled />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Delområden</FormLabel>
                  <Menu closeOnSelect={false}>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      {selectedSectionIds.length
                        ? `${selectedSectionIds.length} valda`
                        : 'Välj delområden'}
                    </MenuButton>
                    <MenuList maxH="300px" overflowY="auto">
                      {selectedProject?.sections?.map((sec, i) => (
                        <MenuItem key={sec.id} isDisabled={isSectionSelectionDisabled(sec)}>
                          <Checkbox
                            isChecked={selectedSectionIds.includes(sec.id)}
                            isDisabled={isSectionSelectionDisabled(sec)}
                            onChange={e =>
                              setSelectedSectionIds(prev =>
                                e.target.checked
                                  ? isLSkyddSelected
                                    ? [sec.id]
                                    : isASkyddSelected
                                      ? normalizeSelectedSectionIds(selectedProject?.sections || [], [...prev, sec.id], anordning)
                                    : [...prev, sec.id]
                                  : prev.filter(id => id !== sec.id),
                              )
                            }
                          >
                            {getSectionLabel(sec, i)} ({sec.name})
                          </Checkbox>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                  {isLSkyddSelected && (
                    <FormLabel mt={2} fontSize="xs" color="orange.600">
                      L-Skydd kan bara läggas på ett linjedelområde åt gången.
                    </FormLabel>
                  )}
                  {isASkyddSelected && (
                    <FormLabel mt={2} fontSize="xs" color="orange.600">
                      A-Skydd kräver exakt två delområden: en driftplats och en intilliggande linje.
                    </FormLabel>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Skyddsanordning</FormLabel>
                  <Menu closeOnSelect={false}>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      {anordning.length ? `${anordning.length} valda` : 'Välj skyddsanordning'}
                    </MenuButton>
                    <MenuList>
                      {ANORDNING_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} isDisabled={isAnordningOptionDisabled(opt.value)}>
                          <Checkbox
                            isChecked={anordning.includes(opt.value)}
                            isDisabled={isAnordningOptionDisabled(opt.value)}
                            onChange={(e) => handleAnordningChange(opt.value, e.target.checked)}
                          >
                            {opt.label}
                          </Checkbox>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Önskad sluttid</FormLabel>
                  <Input type="time" value={begard} onChange={e => setBegard(e.target.value)} />
                </FormControl>
	                <FormControl>
	                  <FormLabel>Planeringsdatum</FormLabel>
	                  <Input
	                    type="date"
	                    value={begardDatum}
	                    isDisabled
	                  />
	                </FormControl>
              </SimpleGrid>

              <FormControl>
                <Checkbox
                  isChecked={tsa}
                  onChange={(e) => setTsa(e.target.checked)}
                >
                  TSA
                </Checkbox>
              </FormControl>

              <FormControl>
                <FormLabel>Arbetsbeskrivning</FormLabel>
                <Textarea
                  value={anteckning}
                  onChange={e => setAnteckning(e.target.value)}
                  placeholder="Skriv gärna vad ni ska göra och plats"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
<Button
  colorScheme="blue"
  onClick={handleSelfEnroll}
  isDisabled={
    !begardDatum || !begard || anordning.length === 0 || selectedSectionIds.length === 0 || !nextPlanEntry || hasExistingNextPlanning(selectedProject) || !isPlanningWindowOpen(nextPlanEntry)
  }
>
  Skicka
</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
