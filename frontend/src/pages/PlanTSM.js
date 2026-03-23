import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';
import { getSectionLabel } from '../utils/sectionLabels';
import { apiUrl } from '../lib/api';
import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

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

const compactSignal = (value = '') =>
  String(value || '')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*,\s*/g, ', ')
    .trim();

const formatAnordningValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => ANORDNING_OPTIONS.find((opt) => opt.value === item)?.label || item)
      .join(', ');
  }

  if (typeof value === 'string') {
    return ANORDNING_OPTIONS.find((opt) => opt.value === value)?.label || value;
  }

  return '';
};

const buildPlanEntryKey = (entry = {}, index = 0) =>
  `${entry.beteckning || 'entry'}|${entry.startDate || ''}|${index}`;

const buildPlanEntries = (project) => {
  const entries = Array.isArray(project?.formState?.blankett31Entries)
    ? project.formState.blankett31Entries.filter((entry) => entry?.startDate || entry?.beteckning)
    : [];

  if (entries.length) {
    return entries.map((entry, index) => ({
      ...entry,
      key: buildPlanEntryKey(entry, index),
    }));
  }

  return [
    {
      key: 'default-entry',
      beteckning: project?.beteckningar?.[0]?.label || '',
      startDate: project?.startDate || '',
      startTime: project?.startTime || '',
      endDate: project?.endDate || '',
      endTime: project?.endTime || '',
    },
  ];
};

const getRowPlanDate = (row) =>
  normalizeDateForInput(
    row?.planDate ||
    row?.begardDatum ||
    row?.startdatum ||
    row?.startDate ||
    row?.datum ||
    ''
  );

const formatPlanEntryLabel = (entry = {}) => {
  const date = normalizeDateForInput(entry.startDate || '');
  const shortDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.slice(5) : date;
  return [shortDate, entry.beteckning].filter(Boolean).join(' ');
};

const PlanTSM = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [rows, setRows] = useState([]);
  const [activePlanEntryKey, setActivePlanEntryKey] = useState('');
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);
  const [begardDatum, setBegardDatum] = useState('');
  const [begard, setBegard] = useState('');
  const [anteckning, setAnteckning] = useState('');
  const [anordning, setAnordning] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const userDataRaw = localStorage.getItem('user');
  const user = userDataRaw ? JSON.parse(userDataRaw) : null;
  const projectPlanEntries = useMemo(() => buildPlanEntries(project), [project]);
  const activePlanEntry = useMemo(
    () =>
      projectPlanEntries.find((entry) => entry.key === activePlanEntryKey) ||
      projectPlanEntries[0] ||
      null,
    [activePlanEntryKey, projectPlanEntries]
  );
  const activePlanDate = normalizeDateForInput(activePlanEntry?.startDate || '');

  const fetchProject = useCallback(async () => {
    try {
      const tokenData = localStorage.getItem('user');
      const token = tokenData ? JSON.parse(tokenData).token : null;

      const response = await axios.get(apiUrl(`/api/project/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const current = response.data;
      setProject(current);
      setRows(Array.isArray(current.rows) ? current.rows : []);
    } catch (err) {
      console.error('Kunde inte hämta projektet:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (!projectPlanEntries.length) {
      setActivePlanEntryKey('');
      return;
    }

    setActivePlanEntryKey((current) =>
      projectPlanEntries.some((entry) => entry.key === current)
        ? current
        : projectPlanEntries[0].key
    );
  }, [projectPlanEntries]);

  useEffect(() => {
    if (!isOpen || !project) return;
    setBegard(getDesiredEndTime(activePlanEntry || project));
    setBegardDatum(normalizeDateForInput(activePlanEntry?.startDate || project.endDate));
  }, [activePlanEntry, isOpen, project]);

  const rowMatchesActivePlan = useCallback((row) => {
    if (!projectPlanEntries.length || !activePlanDate) return true;
    const rowPlanDate = getRowPlanDate(row);
    if (!rowPlanDate) {
      return projectPlanEntries[0]?.key === activePlanEntry?.key;
    }
    return rowPlanDate === activePlanDate;
  }, [activePlanDate, activePlanEntry, projectPlanEntries]);

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

  const handleSelfEnroll = async () => {
    if (!project) return;

    try {
      const token = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')).token
        : null;

      const selections = (project.sections || []).map((sec) =>
        selectedSectionIds.includes(sec.id)
      );

      await axios.post(
        apiUrl('/api/row/self-enroll'),
        {
          datum: activePlanEntry?.startDate || '',
          anordning,
          selections,
          begard,
          begardDatum,
          anteckning,
          projectId: project.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Förplaneringen är skickad.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setBegard(getDesiredEndTime(activePlanEntry || project));
      setBegardDatum(normalizeDateForInput(activePlanEntry?.startDate || project.endDate));
      setAnteckning('');
      setAnordning([]);
      setSelectedSectionIds([]);
      fetchProject();
    } catch (err) {
      console.error('Fel vid förplanering:', err);
      toast({
        title: 'Kunde inte skicka förplaneringen.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const sharedContacts = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return [];
    const [firstRow, ...rest] = rows;
    if (!firstRow?.selections) return [];

    return rest.filter((row) =>
      Array.isArray(row?.selections) &&
      row.selections.some((value, idx) => value && firstRow.selections?.[idx])
    );
  }, [rows]);

  if (!project) return <div className="p-6">Inget projekt hittades.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Header />

      <div className="p-6 max-w-[1600px] w-full mx-auto mt-24">
        <div className="bg-white rounded shadow-md p-6">
          <h2 className="text-2xl font-bold mb-2">Projektnamn: {project.name}</h2>
          <p><strong>Plats:</strong> {project.plats}</p>
          <p><strong>Startdatum:</strong> {activePlanEntry?.startDate || project.startDate} <b>{activePlanEntry?.startTime || project.startTime}</b></p>
          <p><strong>Slutdatum:</strong> {activePlanEntry?.endDate || project.endDate} <b>{activePlanEntry?.endTime || project.endTime}</b></p>
          <p><strong>FJTKL:</strong> {project.namn} ({project.telefonnummer})</p>
        </div>

        {projectPlanEntries.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {projectPlanEntries.map((entry) => (
              <Button
                key={entry.key}
                size="sm"
                colorScheme={entry.key === activePlanEntry?.key ? 'blue' : 'gray'}
                variant={entry.key === activePlanEntry?.key ? 'solid' : 'outline'}
                onClick={() => setActivePlanEntryKey(entry.key)}
              >
                {formatPlanEntryLabel(entry)}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-6 w-full flex gap-6 max-w-[1900px] mx-auto">
          <div className="flex-1">
            <table className="w-full border mt-4 bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-2" colSpan={4} />
                  {(project.sections || []).map((sec, idx) => (
                    <th key={`signal-${sec.id || idx}`} className="border px-2 py-2 min-w-[92px] align-top">
                      <div className="text-[11px] font-bold text-gray-900 leading-tight">
                        {compactSignal(sec.signal || sec.name || '') || 'Ej angivet'}
                      </div>
                      <div className="text-[10px] font-semibold text-gray-600 mt-1">
                        {getSectionLabel(sec, idx)}
                      </div>
                    </th>
                  ))}
                  <th className="border px-2 py-2" colSpan={1} />
                </tr>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">#</th>
                  <th className="border px-4 py-2">Namn</th>
                  <th className="border px-4 py-2">Telefon</th>
                  <th className="border px-4 py-2">Skyddsanordning</th>
                  {(project.sections || []).map((sec, idx) => (
                    <th key={`section-blank-${sec.id || idx}`} className="border px-2 py-2 bg-gray-50" />
                  ))}
                  <th className="border px-4 py-2">Begärd till</th>
                </tr>
              </thead>
              <tbody>
                {rows.filter((row) => rowMatchesActivePlan(row)).length === 0 ? (
                  <tr>
                    <td className="border px-4 py-4 text-center text-gray-500" colSpan={5 + (project.sections || []).length}>
                      Inga rader finns ännu.
                    </td>
                  </tr>
                ) : (
                  rows.filter((row) => rowMatchesActivePlan(row)).map((row, rowIndex) => (
                    <tr key={row.id || rowIndex}>
                      <td className="border px-2 py-1 text-center">{rowIndex + 1}</td>
                      <td className="border px-2 py-1">{row.namn || '—'}</td>
                      <td className="border px-2 py-1">{row.telefon || '—'}</td>
                      <td className="border px-2 py-1">{formatAnordningValue(row.anordning) || '—'}</td>
                      {(project.sections || []).map((_, idx) => (
                        <td key={`selection-${row.id || rowIndex}-${idx}`} className="border text-center">
                          <input type="checkbox" checked={Boolean(row.selections?.[idx])} readOnly />
                        </td>
                      ))}
                      <td className="border px-2 py-1">{row.begard || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="mt-4 flex justify-center">
              <button
                onClick={onOpen}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Förplanera
              </button>
            </div>
          </div>

          <div className="w-80 bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Mina samråd</h2>
            {sharedContacts.length === 0 ? (
              <p className="italic text-gray-500">(tom)</p>
            ) : (
              <ul className="space-y-2">
                {sharedContacts.map((row) => (
                  <li key={row.id} className="text-sm">{row.namn} ({row.telefon})</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

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
                  <Input value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()} isDisabled />
                </FormControl>
                <FormControl>
                  <FormLabel>Telefon</FormLabel>
                  <Input value={user?.phone || ''} isDisabled />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Delområden</FormLabel>
                  <Menu closeOnSelect={false}>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      {selectedSectionIds.length ? `${selectedSectionIds.length} valda` : 'Välj delområden'}
                    </MenuButton>
                    <MenuList maxH="300px" overflowY="auto">
                      {(project.sections || []).map((sec, idx) => (
                        <MenuItem key={sec.id || idx}>
                          <Checkbox
                            isChecked={selectedSectionIds.includes(sec.id)}
                            onChange={(e) =>
                              setSelectedSectionIds((prev) =>
                                e.target.checked
                                  ? [...prev, sec.id]
                                  : prev.filter((sectionId) => sectionId !== sec.id)
                              )
                            }
                          >
                            {getSectionLabel(sec, idx)} ({compactSignal(sec.signal || sec.name || '')})
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
                  <Input type="time" value={begard} onChange={(e) => setBegard(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Slutdatum</FormLabel>
                  <Input
                    type="date"
                    value={begardDatum}
                    max={normalizeDateForInput(project?.endDate)}
                    onChange={(e) => setBegardDatum(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Anteckningar</FormLabel>
                <Textarea value={anteckning} onChange={(e) => setAnteckning(e.target.value)} />
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
};

export default PlanTSM;
