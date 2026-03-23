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

const getClosestPlanEntry = (project) => {
  const entries = buildPlanEntries(project);
  if (!entries.length) return null;

  const now = Date.now();
  return entries.reduce((closest, entry) => {
    if (!closest) return entry;
    const currentDistance = Math.abs(getPlanEntryAnchor(entry) - now);
    const closestDistance = Math.abs(getPlanEntryAnchor(closest) - now);
    return currentDistance < closestDistance ? entry : closest;
  }, null);
};

const formatAnordningLabel = (value) =>
  ANORDNING_OPTIONS.find((option) => option.value === value)?.label || value;

const formatPlanTime = (value = '') => String(value || '').replace(':', '.');

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
  const [anteckning, setAnteckning] = useState('');
  const [anordning, setAnordning] = useState([]);
  const [enrolledProjects, setEnrolledProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const namn = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const telefon = user?.phone || '';
  const toast = useToast();
  const htsmNamn = `${selectedProject?.user?.firstName || ''} ${selectedProject?.user?.lastName || ''}`.trim();
  const htsmTelefon = selectedProject?.formState?.htsmTelefon || '';
  const signatureBase = (user?.signature || `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`).toUpperCase();
  const nearestPlanEntry = useMemo(
    () => getClosestPlanEntry(selectedProject),
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

  const getPlanSectionSummary = useCallback((project, row) => {
    if (!Array.isArray(project?.sections) || !Array.isArray(row?.selections)) {
      return '';
    }

    return project.sections
      .flatMap((section, index) => (
        row.selections[index] ? [getSectionLabel(section, index)] : []
      ))
      .join(', ');
  }, []);

  const isAnordningOptionDisabled = useCallback((optionValue) => {
    if (anordning.includes(optionValue)) return false;
    if (anordning.length === 0) return false;
    if (anordning.length >= 2) return true;
    return !isAllowedAnordningCombo(anordning[0], optionValue);
  }, [anordning]);

  const handleAnordningChange = useCallback((optionValue, checked) => {
    setAnordning((prev) => {
      if (!checked) {
        return prev.filter((value) => value !== optionValue);
      }

      if (prev.includes(optionValue)) {
        return prev;
      }

      if (prev.length === 0) {
        return [optionValue];
      }

      if (prev.length === 1 && isAllowedAnordningCombo(prev[0], optionValue)) {
        return [...prev, optionValue];
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
  }, [toast]);

  const userIsInProject = useCallback(
    (project) => getUserPlansForProject(project).length > 0,
    [getUserPlansForProject]
  );

  const handleSelfEnroll = async () => {
    try {
      const token = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')).token
        : null;
      const targetPlanEntry = getClosestPlanEntry(selectedProject);

      const selections = selectedProject.sections.map((sec) =>
        selectedSectionIds.includes(sec.id)
      );

      const response = await axios.post(
        apiUrl('/api/row/self-enroll'),
        {
          anordning,
          selections,
          begard,
          datum: normalizeDateForInput(targetPlanEntry?.startDate || begardDatum),
          begardDatum: normalizeDateForInput(targetPlanEntry?.startDate || begardDatum),
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
      setAnteckning('');
      setAnordning([]);
      setSelectedSectionIds([]);
      setSelectedProject(updatedProject);
      setProjects((prev) =>
        prev.map((project) => (project.id === updatedProject.id ? updatedProject : project))
      );
      setEnrolledProjects((prev) => {
        const existing = prev.filter((project) => project.id !== updatedProject.id);
        return [...existing, updatedProject];
      });
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
      setEnrolledProjects(response.data.filter(userIsInProject));
    } catch (error) {
      console.error('❌ Kunde inte hämta projekt:', error);
      setProjects([]);
    }
  }, [token, userIsInProject]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchAllProjects();
  }, [fetchAllProjects, navigate, token]);

  useEffect(() => {
    if (!isOpen || !selectedProject) return;
    setBegard(getDesiredEndTime(nearestPlanEntry || selectedProject));
    setBegardDatum(
      normalizeDateForInput(nearestPlanEntry?.startDate || selectedProject.endDate)
    );
  }, [isOpen, nearestPlanEntry, selectedProject]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="fancy-card p-6">
            <h2 className="text-lg font-semibold mb-4">Tillgängliga projekt</h2>
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
                      {project.description && (
                        <p className="text-sm text-gray-500">{project.plats}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {user?.role === 'TSM' && (
                        <Button
                          onClick={() => {
                            setSelectedProject(project);
                            onOpen();
                          }}
                          className="fancy-button"
                          colorScheme="blue"
                        >
                          Förplanera
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="fancy-card p-6">
            <h2 className="text-lg font-semibold mb-4">Mina projekt</h2>
            {enrolledProjects.length === 0 ? (
              <p className="text-gray-500">Du har inte anmält dig till något projekt ännu.</p>
            ) : (
              <ul className="space-y-4">
                {enrolledProjects.map((project) => (
                  <li
                    key={project.id}
                    className="border rounded p-4 transition duration-200 hover:shadow-md"
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">{project.plats}</p>
                      <div className="mt-3 space-y-2">
		                        {getUserPlansForProject(project)
		                          .sort(
		                            (left, right) => {
		                              const leftClosed = Boolean(left.avslutadRad);
		                              const rightClosed = Boolean(right.avslutadRad);
		                              if (leftClosed !== rightClosed) {
		                                return leftClosed ? 1 : -1;
		                              }
		                              return (
		                                new Date(right.skapadDatum || right.createdAt || 0) -
		                                new Date(left.skapadDatum || left.createdAt || 0)
		                              );
		                            }
		                          )
		                          .map((plan, index) => {
	                            const anordningar = Array.isArray(plan.anordning)
	                              ? plan.anordning.map(formatAnordningLabel).join(' + ')
	                              : formatAnordningLabel(plan.anordning || '');
	                            const delomraden = getPlanSectionSummary(project, plan);
	                            const btkn = plan.btkn || `${signatureBase}${String(index + 1).padStart(2, '0')}`;
	                            const isClosed = Boolean(plan.avslutadRad);
	                            const statusLabel = isClosed ? 'Avslutad' : 'Aktiv / förplanerad';

	                            return (
	                              <div
	                                key={plan.id || `${project.id}-${index}`}
	                                className={`rounded-lg border px-3 py-2 text-sm ${
	                                  isClosed
	                                    ? 'border-red-200 bg-red-50 text-red-900'
	                                    : 'border-green-200 bg-green-50 text-green-900'
	                                }`}
	                              >
	                                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
	                                  {statusLabel}
	                                </p>
	                                <p><strong>{anordningar || 'Skydd saknas'}</strong></p>
	                                <p>Delområde {delomraden || 'saknas'}</p>
	                                <p>Sluttid kl {formatPlanTime(plan.begard) || 'saknas'}</p>
	                                <p>Beteckning {btkn}</p>
	                              </div>
                            );
                          })}
                      </div>
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
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Namn</FormLabel>
                  <Input value={htsmNamn} isDisabled />
                </FormControl>
                <FormControl>
                  <FormLabel>Telefon</FormLabel>
                  <Input value={htsmTelefon} isDisabled />
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
                        <MenuItem key={sec.id}>
                          <Checkbox
                            isChecked={selectedSectionIds.includes(sec.id)}
                            onChange={e =>
                              setSelectedSectionIds(prev =>
                                e.target.checked
                                  ? [...prev, sec.id]
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
	                  <FormLabel>Slutdatum</FormLabel>
	                  <Input
	                    type="date"
	                    value={begardDatum}
	                    isDisabled
	                    max={normalizeDateForInput(selectedProject?.endDate)}
	                  />
	                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Anteckningar</FormLabel>
                <Textarea value={anteckning} onChange={e => setAnteckning(e.target.value)} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
<Button
  colorScheme="blue"
  onClick={handleSelfEnroll}
  isDisabled={
    !begardDatum || !begard || anordning.length === 0 || selectedSectionIds.length === 0
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
