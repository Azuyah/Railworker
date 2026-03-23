import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { Tooltip } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Tag, TagLabel } from "@chakra-ui/react";
import {
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFlag,
  FaStar,
  FaBolt,
  FaRegCommentDots,
} from 'react-icons/fa';
import { FiHash, FiUser, FiPhone, FiAperture, FiSliders, FiEdit2, FiMessageCircle } from 'react-icons/fi';
import { HiX } from "react-icons/hi";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useToast,
  TableContainer,
  VStack,
  HStack,
  Menu,
  Icon,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  IconButton,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Badge,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  SimpleGrid,
  FormControl,
  FormLabel,
  Divider,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Header from '../components/Header';
import { getSectionLabel, getSectionMarker } from '../utils/sectionLabels';
import { apiUrl } from '../lib/api';

const mergeSectionDetails = (sections = [], sectionDetails = []) =>
  sections.map((section, index) => ({
    ...section,
    ...(sectionDetails[index] || {}),
    signal: section?.signal || section?.name || sectionDetails[index]?.signal || '',
  }));

const splitSectionSignalAndTrack = (section) => {
  const raw = String(section?.signal || section?.name || '').trim();
  const trackMatch = raw.match(/(Spår\s+.+)$/i);
  if (!trackMatch) {
    return {
      signal: raw,
      spar: section?.spar || '',
    };
  }

  return {
    signal: raw.replace(/\s*,?\s*Spår\s+.+$/i, '').trim(),
    spar: trackMatch[1].trim(),
  };
};

const compactSectionText = (value = '') =>
  String(value || '')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*,\s*/g, ',')
    .trim();

const normalizePlanDate = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }
  return raw;
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

const formatPlanEntryLabel = (entry = {}) => {
  const date = normalizePlanDate(entry.startDate || '');
  const shortDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.slice(5) : date;
  return [shortDate, entry.beteckning].filter(Boolean).join(' ');
};

const formatClockLabel = (value = '') => String(value || '').replace(':', '.');
const extractBtknPrefix = (value = '') =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\d+$/, '')
    .trim();

const Plan = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [rows, setRows] = useState([]);
  const [filterValue] = useState('all');
  const [archivedModalOpen, setArchivedModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [avklaradSamrad, setAvklaradSamrad] = useState({});
  const [loading, setLoading] = useState(true);
  const [smsSelection, setSmsSelection] = useState({});
  const [smsMessage, setSmsMessage] = useState('');
  const [editableTsmRow, setEditableTsmRow] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [editBeteckningar, setEditBeteckningar] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [selectedApprovalAreas, setSelectedApprovalAreas] = useState([]);
  const [anteckningar, setAnteckningar] = useState([]);
  const [anteckningarModalOpen, setAnteckningarModalOpen] = useState(false);
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);
  const [samradModalRow, setSamradModalRow] = useState(null);
  const [sectionHeaderNotes, setSectionHeaderNotes] = useState([]);
  const [sectionHeaderNotes2, setSectionHeaderNotes2] = useState([]);
  const [sectionHeaderNotes3, setSectionHeaderNotes3] = useState([]);
  const [headerNotesTop, setHeaderNotesTop] = useState({});
  const [headerNotesMid, setHeaderNotesMid] = useState({});
  const [headerMerges, setHeaderMerges] = useState([]);
  const [selectedBodyCell, setSelectedBodyCell] = useState(null);
  const [, setEditingBodyCell] = useState(null);
  const [bodyContextMenu, setBodyContextMenu] = useState({ open: false, x: 0, y: 0 });
  const bodyContextRef = useRef(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [hotkeysOpen, setHotkeysOpen] = useState(false);
  const [btknPrefix, setBtknPrefix] = useState('');
  const [activePlanEntryKey, setActivePlanEntryKey] = useState('');
  const [hoveredSectionInfo, setHoveredSectionInfo] = useState(null);
  const [topPanelCollapsed, setTopPanelCollapsed] = useState(false);
  const [columnWidths, setColumnWidths] = useState({
    btkn: 54,
    namn: 96,
    telefon: 190,
    anordning: 62,
    sectionDefault: 14,
    starttid: 66,
    begard: 66,
  });
  const [resizingColumn, setResizingColumn] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [visibleColumns] = useState({
    '#': false,
    btkn: true,
    namn: true,
    telefon: true,
    anordning: true,
    starttid: false,
    begard: true,
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isFollowUpChoiceOpen,
    onOpen: onOpenFollowUpChoice,
    onClose: onCloseFollowUpChoice,
  } = useDisclosure();
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [pendingCompletionRow, setPendingCompletionRow] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projektNamn, setProjektNamn] = useState(project?.name || '');
  const [plats, setPlats] = useState(project?.plats || '');
  const [startDate, setStartDate] = useState(project?.startDate || '');
  const [startTime, setStartTime] = useState(project?.startTime || '');
  const [endDate, setEndDate] = useState(project?.endDate || '');
  const [endTime, setEndTime] = useState(project?.endTime || '');
  const [namn, setNamn] = useState(project?.namn || '');
  const [telefonnummer, setTelefonnummer] = useState(project?.telefonnummer || '');
  const [avstamt, setAvstamt] = useState(Boolean(project?.avstamt));
  const [objekt, setObjekt] = useState(project?.objekt || '');
  const [avslutaSkyddTid, setAvslutaSkyddTid] = useState(project?.avslutaSkyddTid || '');
  const [uttagningstid, setUttagningstid] = useState(project?.uttagningstid || '');
  const [signatur, setSignatur] = useState(project?.signatur || '');
  const [editSections, setEditSections] = useState(project?.sections || []);
  const projectFormState = project?.formState || {};
  const projectPlanEntries = useMemo(() => buildPlanEntries(project), [project]);
  const activePlanEntry = useMemo(
    () =>
      projectPlanEntries.find((entry) => entry.key === activePlanEntryKey) ||
      projectPlanEntries[0] ||
      null,
    [activePlanEntryKey, projectPlanEntries]
  );
  const activePlanDate = normalizePlanDate(activePlanEntry?.startDate || '');
  const projectNodnummer = projectFormState.nodnummer || '';
  const projectSluttid = activePlanEntry?.endTime || project?.endTime || projectFormState.avslutningstid || '';
  const projectSectionSummaries = (project?.sections || []).map((sec, idx) => ({
    id: sec.id || `${sec.type || 'section'}-${idx}`,
    label: getSectionLabel(sec, idx),
    signal: sec.name || sec.signal || '',
  }));

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

function formatDateOnly(datetimeStr) {
  const match = datetimeStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  let date;

  if (match) {
    const [, day, month, year] = match;
    date = new Date(`${year}-${month}-${day}`);
  } else {
    date = new Date(datetimeStr);
  }

  if (isNaN(date)) return '';

  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  return `${d}/${m}/${y}`;
}

const getRowPlanDate = (row) =>
  normalizePlanDate(
    row?.planDate ||
    row?.begardDatum ||
    row?.startdatum ||
    row?.startDate ||
    row?.datum ||
    ''
  );

const updateRow = useCallback((updatedRow) => {
  const updatedRows = rows.map((row) =>
    row.id === updatedRow.id ? updatedRow : row
  );
  setRows(updatedRows);
  return updatedRows; // Returnera nya rows
}, [rows]);

const deleteRow = (id) => {
  const updatedRows = rows.filter((row) => row.id !== id);
  setRows(updatedRows);
  return updatedRows; // Returnera nya rows
};

const {
  isOpen: isApprovalModalOpen,
  onOpen: onOpenApprovalModal,
  onClose: onCloseApprovalModal,
} = useDisclosure();

const {
  isOpen: isSamradModalOpen,
  onOpen: onOpenSamradModal,
  onClose: onCloseSamradModal,
} = useDisclosure();

const isSamradResolved = (resolvedMap, rowAId, rowBId) =>
  Boolean(
    resolvedMap?.[rowAId]?.[rowBId] ||
    resolvedMap?.[rowBId]?.[rowAId]
  );

const calculateSamrad = useCallback((rows) => {
  const newSamradList = [];
  const newAvklarad = {};
  const now = new Date();

  const parseRowEndDateTime = (row) => {
    if (!row?.avslutatDatum || !row?.avslutat) return null;
    const dateStr = String(row.avslutatDatum).trim();
    const timeStr = String(row.avslutat).trim();
    let datePart = dateStr;

    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) {
      const [, day, month, year] = match;
      datePart = `${year}-${month}-${day}`;
    }

    const dateTime = new Date(`${datePart}T${timeStr}`);
    return Number.isNaN(dateTime.getTime()) ? null : dateTime;
  };

  const isRowExpired = (row) => {
    const endDate = parseRowEndDateTime(row);
    if (!endDate) return false;
    return endDate.getTime() <= now.getTime();
  };

  const normalizeAnordningar = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item || '').trim().toUpperCase()).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
    }
    return [];
  };

  const hasSamradDriver = (anordningar) =>
    anordningar.some((item) => item === 'SPF' || item === 'VXL');

  rows.forEach((row, i) => {
    if (row.avslutadRad) return;
    if (isRowExpired(row)) return;

    const rowAreas = row.selections || [];
    const rowAnordningar = normalizeAnordningar(row.anordning);
    const rowPlanDate = getRowPlanDate(row);

    for (let j = 0; j < i; j++) {
      const compareRow = rows[j];
      if (compareRow.avslutadRad) continue;
      if (isRowExpired(compareRow)) continue;
      if (rowPlanDate && getRowPlanDate(compareRow) && rowPlanDate !== getRowPlanDate(compareRow)) continue;

      const compareAreas = compareRow.selections || [];
      const compareAnordningar = normalizeAnordningar(compareRow.anordning);

      const sharedAreas = rowAreas.some((selected, index) => selected && compareAreas[index]);
      const requiresSamrad = hasSamradDriver(rowAnordningar) || hasSamradDriver(compareAnordningar);

      if (sharedAreas && requiresSamrad && !isSamradResolved(avklaradSamrad, row.id, compareRow.id)) {
        newSamradList.push({
  from: i,
  to: j,
  id: rows[j].id,
  namn: rows[j].namn,
  telefon: rows[j].telefon,
});
        newAvklarad[`${i}-${j}`] = false;
      }
    }
  });

  return { samradList: newSamradList, avklaradMap: newAvklarad };
}, [avklaradSamrad]);

const buildSamradEntriesForRow = useCallback((rows, rowIndex) => {
  if (!Array.isArray(rows) || rowIndex < 0 || rowIndex >= rows.length) return [];
  const currentRow = rows[rowIndex];
  if (!currentRow) return [];
  if (currentRow.avslutadRad) return [];

  const currentSelections = Array.isArray(currentRow.selections) ? currentRow.selections : [];
  const normalizeAnordningar = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item || '').trim().toUpperCase()).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
    }
    return [];
  };
  const currentHasSamradDriver = normalizeAnordningar(currentRow.anordning).some(
    (item) => item === 'SPF' || item === 'VXL'
  );

  return rows
    .map((candidate, candidateIndex) => ({ candidate, candidateIndex }))
    .filter(({ candidate, candidateIndex }) => {
      if (!candidate || candidateIndex === rowIndex) return false;
      if (candidate.avslutadRad) return false;
      const candidateSelections = Array.isArray(candidate.selections) ? candidate.selections : [];
      const sharedArea = currentSelections.some((selected, index) => Boolean(selected) && Boolean(candidateSelections[index]));
      const candidateHasSamradDriver = normalizeAnordningar(candidate.anordning).some(
        (item) => item === 'SPF' || item === 'VXL'
      );
      return (
        sharedArea &&
        (currentHasSamradDriver || candidateHasSamradDriver) &&
        !isSamradResolved(avklaradSamrad, currentRow.id, candidate.id)
      );
    })
    .map(({ candidate }) => ({
      id: candidate.id,
      namn: candidate.namn && candidate.namn.trim() !== '' ? candidate.namn : (candidate.btkn || 'Okänt namn'),
      telefon: candidate.telefon || '',
      dp: candidate.dp || '',
      linje: candidate.linje || '',
      btkn: candidate.btkn || '',
      bt: candidate.bt || '',
    }));
}, [avklaradSamrad]);

const CELL_COLORS = [
  { label: 'Ingen', value: '' },
  { label: 'Gul', value: 'yellow.100' },
  { label: 'Grön', value: 'green.100' },
  { label: 'Blå', value: 'blue.100' },
  { label: 'Röd', value: 'red.100' },
  { label: 'Lila', value: 'purple.100' },
  { label: 'Orange', value: 'orange.100' },
  { label: 'Grå', value: 'gray.100' },
];

const CELL_ICONS = [
  { key: '', label: 'Ingen', icon: null },
  { key: 'check', label: 'Check', icon: FaCheckCircle, color: 'green.500' },
  { key: 'alert', label: 'Varning', icon: FaExclamationTriangle, color: 'orange.500' },
  { key: 'clock', label: 'Tid', icon: FaClock, color: 'blue.500' },
  { key: 'flag', label: 'Flagga', icon: FaFlag, color: 'red.500' },
  { key: 'star', label: 'Stjärna', icon: FaStar, color: 'yellow.500' },
  { key: 'bolt', label: 'Bolt', icon: FaBolt, color: 'purple.500' },
];

const getCellMeta = (row, key) => {
  if (!row || !key) return {};
  return row.cellMeta?.[key] || {};
};

const updateCellMeta = (rowId, cellKey, patch) => {
  if (!rowId || !cellKey) return;
  const applyPatch = (currentMeta = {}) => {
    if (patch?.__clear) return {};
    return { ...currentMeta, ...patch };
  };

  setRows((prev) =>
    prev.map((row) => {
      if (row.id !== rowId) return row;
      const nextCellMeta = {
        ...(row.cellMeta || {}),
        [cellKey]: applyPatch(row.cellMeta?.[cellKey]),
      };
      if (patch?.__clear) {
        delete nextCellMeta[cellKey];
      }
      return { ...row, cellMeta: nextCellMeta };
    })
  );

  setSelectedRow((prev) => {
    if (!prev || prev.id !== rowId) return prev;
    const nextCellMeta = {
      ...(prev.cellMeta || {}),
      [cellKey]: applyPatch(prev.cellMeta?.[cellKey]),
    };
    if (patch?.__clear) {
      delete nextCellMeta[cellKey];
    }
    return { ...prev, cellMeta: nextCellMeta };
  });
};

const getIconConfig = (iconKey) =>
  CELL_ICONS.find((option) => option.key === iconKey);

const handleCellInteraction = () => {};

const smsRecipients = useMemo(() => {
  if (!selectedRow) return { samrad: [], allRows: [] };
  const samradPeople = Array.isArray(selectedRow.samrad)
    ? selectedRow.samrad
        .map((entry) => rows.find((r) => String(r.id) === String(entry.id)))
        .filter((person) => person)
    : [];

  const allRows = rows
    .filter((row) => !row.avslutadRad)
    .map((row) => ({
      ...row,
      namn: row.namn || row.btkn || `Rad ${row.id}`,
    }));

  return { samrad: samradPeople, allRows };
}, [rows, selectedRow]);

const toggleSmsSelection = (recipientId) => {
  setSmsSelection((prev) => ({
    ...prev,
    [recipientId]: !prev[recipientId],
  }));
};

const sendCustomSms = () => {
  const selectedIds = Object.keys(smsSelection).filter((id) => smsSelection[id]);
  const selectedPeople = smsRecipients.allRows.filter((row) =>
    selectedIds.includes(String(row.id))
  );
  const phones = selectedPeople.map((p) => p.telefon).filter(Boolean);

  if (!smsMessage.trim()) {
    toast({
      title: 'Meddelande saknas',
      description: 'Skriv ett meddelande innan du skickar.',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  if (phones.length === 0) {
    toast({
      title: 'Inga mottagare',
      description: 'Välj minst en mottagare med telefonnummer.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const smsUrl = `sms:${phones.join(',')}?&body=${encodeURIComponent(smsMessage)}`;
  window.location.href = smsUrl;
};

const buildAnteckningarEmailContent = useCallback(() => {
  const draftNote = noteText.trim()
    ? [
        {
          id: 'draft-note',
          text: noteText.trim(),
          timestamp: new Date().toISOString(),
          author: 'Ej sparad anteckning',
        },
      ]
    : [];

  const allNotes = [...anteckningar, ...draftNote].filter(
    (note) => note && typeof note.text === 'string' && note.text.trim() !== ''
  );

  const sortedNotes = allNotes.sort(
    (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  );

  const subject = `Anteckningar - ${project?.name || 'Plan'}`;
  const headerLines = [
    `Projekt: ${project?.name || 'Ej angivet'}`,
    `Plats: ${project?.plats || 'Ej angivet'}`,
    `Startdag: ${project?.startDate || 'Ej angivet'}`,
    `Starttid: ${project?.startTime || 'Ej angivet'}`,
    `Slutdag: ${project?.endDate || 'Ej angivet'}`,
    `Sluttid: ${projectSluttid || 'Ej angivet'}`,
    '',
    'Anteckningar:',
  ];

  const noteLines = sortedNotes.length
    ? sortedNotes.flatMap((note, index) => {
        const timestamp = note.timestamp
          ? new Date(note.timestamp).toLocaleString('sv-SE')
          : 'Tid saknas';
        const author = note.author ? ` av ${note.author}` : '';
        return [
          `${index + 1}. ${note.text || ''}`,
          `   ${timestamp}${author}`,
          '',
        ];
      })
    : ['Inga anteckningar ännu.'];

  const body = [...headerLines, ...noteLines].join('\n');
  return { subject, body };
}, [
  anteckningar,
  noteText,
  project?.endDate,
  project?.name,
  project?.plats,
  project?.startDate,
  project?.startTime,
  projectSluttid,
]);

const forwardAnteckningarByMail = useCallback(() => {
  const { subject, body } = buildAnteckningarEmailContent();
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}, [buildAnteckningarEmailContent]);

const forwardAnteckningarToOutlook = useCallback(() => {
  const { subject, body } = buildAnteckningarEmailContent();
  window.open(
    `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    '_blank',
    'noopener,noreferrer'
  );
}, [buildAnteckningarEmailContent]);

const addEditDP = () => {
  const newDP = { type: 'DP', name: '' }; // ändrat signal ➜ name
  setEditSections([...editSections, newDP]);
};

const buildSectionsWithInsert = (sections, type) => {
  const next = [...(sections || [])];
  if (type === 'Linje') {
    const indexToInsert =
      next.findIndex(
        (sec) =>
          sec.type === 'DP' &&
          !next.some((s, i) => i > next.indexOf(sec) && s.type === 'Linje')
      ) + 1;
    const insertAt = indexToInsert > 0 ? indexToInsert : next.length;
    next.splice(insertAt, 0, { type: 'Linje', name: '' });
    return next;
  }
  next.push({ type: 'DP', name: '' });
  return next;
};

const fetchProject = useCallback(async () => {
  try {
    setLoading(true);

    const tokenData = localStorage.getItem('user');
    const token = tokenData ? JSON.parse(tokenData).token : null;

    const response = await axios.get(apiUrl(`/api/project/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const current = response.data;
    const mergedSections = mergeSectionDetails(
      current.sections || [],
      current.formState?.sectionDetails || []
    );
    setProject({
      ...current,
      sections: mergedSections,
      beteckningar: current.beteckningar || [],
    });
    setAnteckningar(current.anteckningar || []);
    setSectionHeaderNotes(Array.isArray(current.sectionHeaderNotes) ? current.sectionHeaderNotes : []);
    setSectionHeaderNotes2(Array.isArray(current.sectionHeaderNotes2) ? current.sectionHeaderNotes2 : []);
    setSectionHeaderNotes3(Array.isArray(current.sectionHeaderNotes3) ? current.sectionHeaderNotes3 : []);
    setHeaderNotesTop(current.headerNotesTop || {});
    setHeaderNotesMid(current.headerNotesMid || {});
    if (Array.isArray(current.headerMerges)) {
      setHeaderMerges(current.headerMerges.filter((merge) => merge.type !== 'begard-default'));
    } else {
      setHeaderMerges([]);
    }
    const currentFormState = current.formState || {};
    setAvstamt(Boolean(currentFormState.avstamt));
    setObjekt(currentFormState.objekt || '');
    setUttagningstid(currentFormState.uttagningstid || '');
    setSignatur(currentFormState.signatur || '');
    setAvslutaSkyddTid(currentFormState.avslutaSkyddTid || '');
    const enrichedRows = (current.rows || []).map((row) => {
      const selectedAreas = Array.isArray(row.selections)
        ? row.selections.map((val, idx) => (val ? idx : null)).filter((i) => i !== null)
        : [];

      return { ...row, selectedAreas };
    });

    setRows(enrichedRows);
  } catch (error) {
    console.error('Kunde inte hämta projekt:', error);
  } finally {
    setLoading(false);
  }
}, [id]);

const approveRow = async (rowId) => {
  try {
    const tokenData = localStorage.getItem('user');
    const token = tokenData ? JSON.parse(tokenData).token : null;

    await axios.put(
      apiUrl(`/api/row/approve/${rowId}`),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 1. Ta bort raden från visningen direkt
    setRows((prev) => prev.filter((row) => row.id !== rowId));

    // 2. Visa bekräftelse
    toast({
      title: 'Raden godkänd.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // 3. Hämta uppdaterad projektdata (t.ex. för att ladda nya raden)
    fetchProject();
  } catch (error) {
    console.error('Fel vid godkännande:', error);
  }
};

const handleApprovalChange = (field, value) => {
  setEditableTsmRow((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const toggleApprovalArea = (idx) => {
  const updatedAreas = selectedApprovalAreas.includes(idx)
    ? selectedApprovalAreas.filter((i) => i !== idx)
    : [...selectedApprovalAreas, idx].sort((a, b) => a - b);

  setSelectedApprovalAreas(updatedAreas);

  // Sätt om boolean-array baserat på valda index
  const selections = Array(project.sections.length).fill(false);
  updatedAreas.forEach((i) => (selections[i] = true));

  setEditableTsmRow((prev) => ({
    ...prev,
    selections,
  }));
};

const addEditLinje = () => {
  const updated = buildSectionsWithInsert(editSections, 'Linje');
  setEditSections(updated);
};

const handleEditSignalChange = (index, value) => {
  const updated = [...editSections];
  updated[index].name = value;
  setEditSections(updated);
};


const openEditProjectModal = () => {
  const formState = project.formState || {};
  const mergedSections = mergeSectionDetails(
    project.sections || [],
    formState.sectionDetails || []
  );
  setProjektNamn(project.name);
  setPlats(project.plats);
  setStartDate(project.startDate);
  setStartTime(project.startTime);
  setEndDate(project.endDate);
  setEndTime(project.endTime);
    setNamn(project.namn);
    setTelefonnummer(project.telefonnummer);
    setAvstamt(Boolean(formState.avstamt));
    setObjekt(formState.objekt || '');
    setAvslutaSkyddTid(formState.avslutaSkyddTid || '');
    setUttagningstid(formState.uttagningstid || '');
    setSignatur(formState.signatur || '');
  setEditSections(mergedSections);
  setEditModalOpen(true);
  setEditBeteckningar(project.beteckningar?.map(b => b.label) || []);
};

const updateProject = async () => {
  const nextFormState = {
    ...(project?.formState || {}),
    avstamt,
    objekt,
    avslutaSkyddTid,
    uttagningstid,
    signatur,
  };
  const updated = {
    name: projektNamn,
    plats,
    startDate,
    startTime,
    endDate,
    endTime,
    namn,
    telefonnummer,
    formState: nextFormState,
    sections: editSections,
    rows,
    beteckningar: editBeteckningar.map(b => ({ label: b })),
  };

  const token = JSON.parse(localStorage.getItem('user'))?.token;
  if (!token) return alert('Ingen token.');

  try {
    await axios.put(
      apiUrl(`/api/projects/${id}`),
      updated,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    window.location.reload();
  } catch (error) {
    console.error('Kunde inte uppdatera projekt:', error);
    alert('Fel vid uppdatering.');
  }
};

const exportPlanToExcel = async () => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  if (!token) {
    alert('Ingen token.');
    return;
  }

  try {
    const response = await fetch(apiUrl(`/api/projects/${id}/export-excel`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Kunde inte exportera Excel');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition') || '';
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    const filename = filenameMatch?.[1] || `${project?.name || 'plan'}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Fel vid Excel-export:', error);
    alert('Kunde inte exportera Excel.');
  }
};

const getCurrentDate = useCallback(() => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`; // Exempel: "28/06/2025"
}, []);

const getCurrentTime = useCallback(() => {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // Exempel: "15:12"
}, []);


const sparaProjekt = useCallback(async (customRows = rows) => {
  try {
    const tokenData = localStorage.getItem('user');
    const token = tokenData ? JSON.parse(tokenData).token : null;

    if (!project || !project.id) {
      toast({
        title: 'Fel',
        description: 'Ingen giltig projektdata att spara.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Skapa en kopia av raderna
    const preparedRows = [...customRows];

if (selectedRow && selectedRow.id) {
  const index = preparedRows.findIndex((r) => r.id === selectedRow.id);
  if (index !== -1) {
    preparedRows[index] = {
      ...preparedRows[index],
      selectedAreas: [...selectedAreas],
    };
  }
}

    // Uppdatera varje rad med selections från selectedAreas (om den finns)
    const updatedRows = preparedRows.map((row) => {
      let selections = Array(project.sections.length).fill(false);

      if (Array.isArray(row.selectedAreas)) {
        row.selectedAreas.forEach((index) => {
          if (index >= 0 && index < selections.length) {
            selections[index] = true;
          }
        });
      } else if (Array.isArray(row.selections)) {
        selections = [...row.selections];
      }

      return {
        ...row,
        selections,
        selectedAreas: Array.isArray(row.selectedAreas)
          ? [...row.selectedAreas]
          : row.selections
          ? row.selections
              .map((selected, i) => (selected ? i : null))
              .filter((i) => i !== null)
          : [],
        };
    }).filter((row) => !isRowEffectivelyEmpty(row));

    // Räkna ut samråd
    const result = calculateSamrad(updatedRows);

    const rowsWithSamrad = updatedRows.map((row, idx) => {
      const matched = result.samradList
        .filter((entry) => entry.from === idx)
        .map((entry) => updatedRows[entry.to].id);

      return {
        ...row,
        samrad: matched,
      };
    });

    // Uppdatera projektet
    const updatedProject = {
      ...project,
      formState: {
        ...(project?.formState || {}),
        avstamt,
        objekt,
        avslutaSkyddTid,
        uttagningstid,
        signatur,
      },
      rows: rowsWithSamrad,
      sectionHeaderNotes,
      sectionHeaderNotes2,
      sectionHeaderNotes3,
      headerNotesTop,
      headerNotesMid,
      headerMerges,
    };

    rowsWithSamrad.forEach(() => {});

// ✅ Skicka till backend
await axios.put(
  apiUrl(`/api/projects/${project.id}`),
  updatedProject,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

    setRows(rowsWithSamrad);

    toast({
      title: 'Projekt sparat',
      description: 'Alla ändringar har sparats.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  } catch (error) {
    console.error('Fel vid sparning:', error);
    toast({
      title: 'Fel',
      description: 'Kunde inte spara projektet.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
}, [
  avstamt,
  avslutaSkyddTid,
  calculateSamrad,
  headerMerges,
  headerNotesMid,
  headerNotesTop,
  objekt,
  project,
  rows,
  sectionHeaderNotes,
  sectionHeaderNotes2,
  sectionHeaderNotes3,
  selectedAreas,
  selectedRow,
  uttagningstid,
  signatur,
  toast,
]);

useEffect(() => {
  fetchProject();
}, [fetchProject]);

useEffect(() => {
  if (project?.rows?.length && (!rows || rows.length === 0)) {
    const restoredRows = project.rows.map((row) => {
      const selectedAreas = Array.isArray(row.selections)
        ? row.selections
            .map((value, index) => (value ? index : null))
            .filter((v) => v !== null)
        : [];

      return {
        ...row,
        selectedAreas,
      };
    });

    setRows(restoredRows);
  }
}, [buildSamradEntriesForRow, project, rows]);

useEffect(() => {
  if (selectedRow?.id) {
    setSelectedRow((prev) => {
      if (!prev) return prev;
      const nextSelectedAreas = [...selectedAreas];
      if (JSON.stringify(prev.selectedAreas || []) === JSON.stringify(nextSelectedAreas)) {
        return prev;
      }
      return {
        ...prev,
        selectedAreas: nextSelectedAreas,
      };
    });
  }
}, [selectedAreas, selectedRow?.id]);

useEffect(() => {
  if (!project?.sections) return;
  setSectionHeaderNotes((prev) => {
    const next = [...prev];
    if (next.length < project.sections.length) {
      next.length = project.sections.length;
    }
    return next.map((value) => value || '');
  });
  setSectionHeaderNotes2((prev) => {
    const next = [...prev];
    if (next.length < project.sections.length) {
      next.length = project.sections.length;
    }
    return next.map((value) => value || '');
  });
  setSectionHeaderNotes3((prev) => {
    const next = [...prev];
    if (next.length < project.sections.length) {
      next.length = project.sections.length;
    }
    return next.map((value) => value || '');
  });
}, [project?.sections]);

useEffect(() => {
  if (!selectedRowId) return;
  setSmsSelection({});
  setSmsMessage('');
}, [selectedRowId]);

useEffect(() => {
  if (
    !rows ||
    !selectedRow ||
    !Array.isArray(rows) ||
    !Array.isArray(selectedAreas) ||
    !project?.sections
  )
    return;

  const realIndex = rows.findIndex((r) => r.id === selectedRow.id);
  if (realIndex === -1) return;

  const newSelections = Array(project.sections.length).fill(false);
  selectedAreas.forEach((idx) => {
    newSelections[idx] = true;
  });

  const updatedRow = {
    ...rows[realIndex],
    selections: newSelections,
  };

  const tempRows = [...rows];
  tempRows[realIndex] = updatedRow;

  const relatedSamrad = buildSamradEntriesForRow(tempRows, realIndex);

  const updatedRowWithSamrad = {
    ...updatedRow,
    samrad: relatedSamrad,
  };

  // ✅ Undvik ändringar om inget faktiskt förändrats
  const currentRow = rows[realIndex];
  const rowChanged = JSON.stringify(currentRow) !== JSON.stringify(updatedRowWithSamrad);

  if (rowChanged) {
    const updatedRows = [...rows];
    updatedRows[realIndex] = updatedRowWithSamrad;
    setRows(updatedRows);
    setSelectedRow(updatedRowWithSamrad);
  }
}, [buildSamradEntriesForRow, project?.sections, rows, selectedAreas, selectedRow]);

useEffect(() => {
  if (selectedRowId == null) return;

  const matchingRow = rows.find((r) => r.id === selectedRowId);
  if (matchingRow) {
    setSelectedRow((prev) => {
      if (!prev) return prev;
      const nextSamrad = matchingRow.samrad || [];
      if (JSON.stringify(prev.samrad || []) === JSON.stringify(nextSamrad)) {
        return prev;
      }
      return {
        ...prev,
        samrad: nextSamrad,
      };
    });
  }
}, [rows, selectedRowId]);

useEffect(() => {
  if (!rows || !project?.sections) return;

  const updated = rows.map((row, index) => {
    const related = buildSamradEntriesForRow(rows, index);

    const selectedAreas = Array.isArray(row.selections)
      ? row.selections.map((v, i) => (v ? i : null)).filter((v) => v !== null)
      : [];

    return {
      ...row,
      samrad: related,
      selectedAreas,
      selections: row.selections || Array(project.sections.length).fill(false),
    };
  });

  const changed = updated.some((row, i) =>
    JSON.stringify(row) !== JSON.stringify(rows[i])
  );

  if (changed) {
    setRows(updated);
  }
}, [buildSamradEntriesForRow, project, rows]);

useEffect(() => {
  if (!rows || !Array.isArray(rows)) return;

  const allRowsUpdated = rows.map((row) => {
    if (!row.samrad || row.samrad.length === 0) return row;

    // Om första värdet i samrad är ett ID (nummer), fixa det
    if (typeof row.samrad[0] === 'number') {
      const updatedSamrad = row.samrad.map((id) => {
        const match = rows.find((r) => r.id === id);
        return {
          id,
          namn: match?.namn || 'Okänt namn',
          dp: match?.dp || '',
          linje: match?.linje || '',
        };
      });

      return {
        ...row,
        samrad: updatedSamrad,
      };
    }

    return row;
  });

  // Endast uppdatera om något ändrats
  const changed = allRowsUpdated.some((r, i) =>
    JSON.stringify(r.samrad) !== JSON.stringify(rows[i].samrad)
  );

  if (changed) {
    setRows(allRowsUpdated);
  }
}, [rows]);

useEffect(() => {
  if (!selectedRowId || !Array.isArray(rows)) return;

  const match = rows.find((r) => r.id === selectedRowId);
  if (!match) return;

  setSelectedRow((prev) => {
    if (prev && JSON.stringify(prev) === JSON.stringify(match)) {
      return prev;
    }
    return match;
  });
}, [selectedRowId, rows]);

const getNextBtknForRows = (prefix, sourceRows) => {
  if (!prefix) return '';
  const safePrefix = prefix.trim();
  const regex = new RegExp(`^${safePrefix}(\\d+)$`);
  let max = 0;
  (sourceRows || []).forEach((row) => {
    const match = String(row?.btkn || '').match(regex);
    if (match && match[1]) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  });
  const next = String(max + 1).padStart(2, '0');
  return `${safePrefix}${next}`;
};

const getBegardForPlanEntry = useCallback((planEntry) => {
  const resolvedPlanEntry =
    projectPlanEntries.find((entry) => entry.key === planEntry?.key) ||
    projectPlanEntries.find(
      (entry) =>
        normalizePlanDate(entry.startDate || '') === normalizePlanDate(planEntry?.startDate || '') &&
        String(entry.beteckning || '') === String(planEntry?.beteckning || '')
    ) ||
    planEntry ||
    activePlanEntry ||
    null;

  const rawEndTime =
    String(
      resolvedPlanEntry?.endTime ||
      project?.endTime ||
      projectFormState.avslutningstid ||
      ''
    ).trim();
  const match = rawEndTime.match(/^(\d{1,2})[:.](\d{2})$/);
  if (!match) return '';

  const totalMinutes =
    ((Number(match[1]) * 60 + Number(match[2]) - 10) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
}, [activePlanEntry, project?.endTime, projectFormState.avslutningstid, projectPlanEntries]);

const createNewRow = useCallback((rows, project, prefix = '', planEntry = null) => {
  const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
  return {
    id: nextId,
    btkn: getNextBtknForRows(prefix, rows),
    namn: '',
    telefon: '',
    anordning: '',
    bt: '',
    linje: '',
    starttid: '',
    begard: getBegardForPlanEntry(planEntry),
    begardDatum: planEntry?.startDate || '',
    avslutat: '',
    avslutadRad: false,
    anteckning: '',
    planDate: planEntry?.startDate || '',
    planEntryKey: planEntry?.key || '',
    selections: project.sections.map(() => false),
    selectedAreas: [],
    cellMeta: {},
  };
}, [getBegardForPlanEntry]);

useEffect(() => {
  if (!project?.sections || !Array.isArray(rows)) return;

  const matchesCurrentEntry = (row) => {
    if (!projectPlanEntries.length || !activePlanDate) return true;
    const rowPlanDate = getRowPlanDate(row);
    if (!rowPlanDate) {
      return projectPlanEntries[0]?.key === activePlanEntry?.key;
    }
    return rowPlanDate === activePlanDate;
  };
  const activeRows = rows.filter((row) => matchesCurrentEntry(row));

  if (rows.length === 0 || activeRows.length === 0) {
    setRows((prev) => [...prev, createNewRow(prev, project, btknPrefix, activePlanEntry)]);
    return;
  }

  const lastRow = activeRows[activeRows.length - 1];
  if (!isRowEffectivelyEmpty(lastRow)) {
    setRows((prev) => [...prev, createNewRow(prev, project, btknPrefix, activePlanEntry)]);
  }
}, [activePlanDate, activePlanEntry, btknPrefix, createNewRow, project, projectPlanEntries, rows]);

const isRowEffectivelyEmpty = (row) => {
  if (!row) return true;
  const hasTextValue = [
    row.namn,
    row.telefon,
    row.bt,
    row.linje,
    row.dp,
    row.starttid,
    row.avslutat,
    row.startdatum,
    row.avslutatDatum,
    row.anteckning,
  ].some((value) => String(value || '').trim() !== '');

  const hasAnordning =
    (Array.isArray(row.anordning) && row.anordning.length > 0) ||
    (typeof row.anordning === 'string' && row.anordning.trim() !== '');

  const hasSelections =
    (Array.isArray(row.selections) && row.selections.some(Boolean)) ||
    (Array.isArray(row.selectedAreas) && row.selectedAreas.length > 0);

  return !hasTextValue && !hasAnordning && !hasSelections;
};

const addRow = () => {
  const newRow = {
    ...createNewRow(rows, project, btknPrefix, activePlanEntry),
    id: Date.now(),
    dp: '',
    linje: '',
  };

  const sameDP = newRow.dp;
  const sameLinje = newRow.linje;
  const isRelevant = ['SPF', 'VXL'].includes(
    Array.isArray(newRow.anordning) ? newRow.anordning[0] : ''
  );

  const matching = rows.filter((r) => {
    if (r.id === newRow.id) return false;
    const matchDP = r.dp === sameDP;
    const matchLinje = r.linje === sameLinje;
    return isRelevant && (matchDP || matchLinje);
  });

  const samradList = matching.map((match) => ({
    id: match.id,
    namn: match.namn,
    dp: match.dp,
    linje: match.linje,
    telefon: match.telefon || '',
  }));

  const newRowWithSamrad = {
    ...newRow,
    samrad: samradList,
  };

  const updatedRows = [...rows, newRowWithSamrad];
  setRows(updatedRows);
  setSelectedRow(newRowWithSamrad);
  setSelectedRowId(newRowWithSamrad.id);

  setSelectedAreas(
    newRow.selections?.map((selected, index) => (selected ? index : null)).filter((index) => index !== null) || []
  );

};

const completeSelectedRow = useCallback(async (targetPlanEntry = null) => {
  if (!selectedRow || !project) return;

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const initials = `${currentUser?.firstName?.[0] || ''}${currentUser?.lastName?.[0] || ''}`.toUpperCase();
  const completedRow = {
    ...selectedRow,
    selectedAreas: [...selectedAreas],
    avslutadRad: true,
    avslutadAv: initials,
    avslutatDatum: selectedRow.avslutatDatum || getCurrentDate(),
    avslutat: selectedRow.avslutat || getCurrentTime(),
    isSavedPlan: false,
  };

  const currentRows = rows.map((row) =>
    row.id === completedRow.id ? { ...row, ...completedRow } : row
  );

  let nextRows = currentRows;
  let nextRow = null;

  if (targetPlanEntry) {
    nextRow = {
      ...createNewRow(currentRows, project, btknPrefix, targetPlanEntry),
      namn: completedRow.namn || '',
      telefon: completedRow.telefon || '',
      anordning: Array.isArray(completedRow.anordning)
        ? [...completedRow.anordning]
        : completedRow.anordning || '',
      selections: Array.isArray(completedRow.selections)
        ? [...completedRow.selections]
        : project.sections.map(() => false),
      selectedAreas: buildSelectedAreasFromRow(completedRow),
      begardDatum: targetPlanEntry?.startDate || '',
      anteckning: '',
      isSavedPlan: false,
      cellMeta: {},
    };
    nextRows = [...currentRows, nextRow];
  }

  if (targetPlanEntry?.key) {
    setActivePlanEntryKey(targetPlanEntry.key);
  }

  setRows(nextRows);
  setPendingCompletionRow(null);
  onCloseFollowUpChoice();

  if (nextRow) {
    setSelectedRow(nextRow);
    setSelectedRowId(nextRow.id);
    setSelectedAreas([...nextRow.selectedAreas]);
  } else {
    setSelectedRow(completedRow);
    setSelectedAreas([...completedRow.selectedAreas]);
    onClose();
  }

  await sparaProjekt(nextRows);
}, [
  btknPrefix,
  createNewRow,
  getCurrentDate,
  getCurrentTime,
  onClose,
  onCloseFollowUpChoice,
  project,
  rows,
  selectedAreas,
  selectedRow,
  sparaProjekt,
]);

const updateRowField = useCallback((rowId, field, value) => {
  if (field === 'btkn') {
    setBtknPrefix(extractBtknPrefix(value));
  }
  setRows((prev) =>
    prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
  );
}, []);


const toggleDelomrade = (rowId, secIdx) => {
  setRows((prev) =>
    prev.map((row) => {
      if (row.id !== rowId) return row;
      const selections = Array.isArray(row.selections)
        ? [...row.selections]
        : Array(project.sections.length).fill(false);
      selections[secIdx] = !selections[secIdx];
      return { ...row, selections };
    })
  );
};

const avslutaRow = useCallback(async (row) => {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const initials = `${currentUser?.firstName?.[0] || ''}${currentUser?.lastName?.[0] || ''}`.toUpperCase();
  const updatedRow = {
    ...row,
    avslutadRad: true,
    avslutadAv: initials,
    avslutatDatum: getCurrentDate(),
    avslutat: getCurrentTime(),
  };
  const updated = updateRow(updatedRow);
  await sparaProjekt(updated);
}, [getCurrentDate, getCurrentTime, sparaProjekt, updateRow]);

const openRowModal = (row, rowIndex) => {
  handleRowClick(row, rowIndex);
  onOpen();
};

const buildSelectedAreasFromRow = (row) => {
  if (Array.isArray(row?.selectedAreas) && row.selectedAreas.length) {
    return [...row.selectedAreas];
  }

  if (Array.isArray(row?.selections)) {
    return row.selections
      .map((selected, index) => (selected ? index : null))
      .filter((index) => index !== null);
  }

  return [];
};

const ANORDNING_OPTIONS = ['A-S', 'L-S', 'S-S', 'E-S', 'SPF', 'VXL', 'Tvn'];

const getAnordningColor = (item) => {
  switch (String(item || '').toUpperCase()) {
    case 'A-S':
      return 'blue';
    case 'L-S':
      return 'green';
    case 'S-S':
      return 'orange';
    case 'E-S':
      return 'red';
    case 'SPF':
      return 'yellow';
    case 'VXL':
      return 'purple';
    case 'TVN':
      return 'cyan';
    default:
      return 'gray';
  }
};

const formatAnordningLabel = (item) => {
  if (!item) return '';
  const upper = item.toUpperCase();
  switch (upper) {
    case 'A-S':
      return 'A-Skydd';
    case 'L-S':
      return 'L-Skydd';
    case 'S-S':
      return 'S-Skydd';
    case 'E-S':
      return 'E-Skydd';
    case 'SPF':
      return 'Spärrfärd';
    case 'VXL':
      return 'Växling';
    case 'TVN':
      return 'Tågvarning';
    default:
      return item;
  }
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

useEffect(() => {
  if (!resizingColumn) return;
  const handleMove = (event) => {
    const delta = event.clientX - resizingColumn.startX;
    const nextWidth = Math.max(60, resizingColumn.startWidth + delta);
    setColumnWidths((prev) => ({ ...prev, [resizingColumn.key]: nextWidth }));
  };
  const handleUp = () => setResizingColumn(null);
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleUp);
  return () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleUp);
  };
}, [resizingColumn]);

const selectedBodyMeta = useMemo(() => {
  if (!selectedBodyCell) return {};
  const row = rows.find((r) => r.id === selectedBodyCell.rowId);
  return getCellMeta(row, selectedBodyCell.key);
}, [rows, selectedBodyCell]);

const openBodyContextMenu = (event, rowId, key) => {
  event.preventDefault();
  event.stopPropagation();
  setSelectedBodyCell({ rowId, key });
  setBodyContextMenu({ open: true, x: event.clientX, y: event.clientY, align: 'down' });
  setEditingBodyCell(null);
};

const closeBodyContextMenu = useCallback(() => {
  setBodyContextMenu((prev) => ({ ...prev, open: false }));
}, []);

const applyMetaToSelectedBodyCell = (patch) => {
  if (!selectedBodyCell) return;
  updateCellMeta(selectedBodyCell.rowId, selectedBodyCell.key, patch);
};

const toggleBodyCellSelection = (rowId, key) => {
  setSelectedBodyCell((prev) =>
    prev?.rowId === rowId && prev?.key === key ? null : { rowId, key }
  );
  if (bodyContextMenu.open) closeBodyContextMenu();
};

const showAvslutaRowConfirm = useCallback((row) => {
  const toastId = 'confirm-avsluta-row';
  if (toast.isActive(toastId)) return;
  toast({
    id: toastId,
    position: 'top',
    containerStyle: {
      justifyContent: 'center',
      marginTop: '40vh',
    },
    duration: null,
    render: ({ onClose }) => (
      <Box
        bg="white"
        border="1px solid #E2E8F0"
        boxShadow="lg"
        borderRadius="md"
        p={3}
        minW="280px"
      >
        <Text fontWeight="semibold">Avsluta rad?</Text>
        <Text fontSize="sm" color="gray.600">
          Vill du avsluta den här raden?
        </Text>
        <HStack mt={3} justify="flex-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onClose();
            }}
          >
            Avbryt
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            onClick={() => {
              avslutaRow(row);
              onClose();
            }}
          >
            Avsluta
          </Button>
        </HStack>
      </Box>
    ),
  });
}, [avslutaRow, toast]);

useEffect(() => {
  const handleHotkeys = (event) => {
    const target = event.target;
    const isTyping =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable);

    if (isTyping) return;

    if (event.metaKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      sparaProjekt();
      return;
    }

    if (event.metaKey && event.key === '/') {
      event.preventDefault();
      setHotkeysOpen((prev) => !prev);
      return;
    }

    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))));
      return;
    }

    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      setZoomLevel((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))));
      return;
    }

    if (!activeRowId) return;

    if (event.key.toLowerCase() === 't') {
      event.preventDefault();
      const now = getCurrentTime();
      if (event.shiftKey) {
        updateRowField(activeRowId, 'begard', now);
      } else if (event.altKey) {
        updateRowField(activeRowId, 'avslutat', now);
      } else {
        updateRowField(activeRowId, 'starttid', now);
      }
      return;
    }

    if (event.key.toLowerCase() === 'd') {
      event.preventDefault();
      const row = rows.find((item) => item.id === activeRowId);
      if (row) {
        showAvslutaRowConfirm(row);
      }
      return;
    }

    if (event.shiftKey && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      const today = getCurrentDate();
      updateRowField(activeRowId, 'begardDatum', today);
    }
  };

  const handleKeyUp = () => {};

  window.addEventListener('keydown', handleHotkeys);
  window.addEventListener('keyup', handleKeyUp);
  return () => {
    window.removeEventListener('keydown', handleHotkeys);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [activeRowId, getCurrentDate, getCurrentTime, rows, sparaProjekt, showAvslutaRowConfirm, updateRowField]);

const showDeleteRowConfirm = (rowId) => {
  const toastId = 'confirm-delete-row';
  if (toast.isActive(toastId)) return;
  toast({
    id: toastId,
    position: 'top',
    containerStyle: {
      justifyContent: 'center',
      marginTop: '40vh',
    },
    duration: null,
    render: ({ onClose }) => (
      <Box
        bg="white"
        border="1px solid #E2E8F0"
        boxShadow="lg"
        borderRadius="md"
        p={3}
        minW="300px"
      >
        <Text fontWeight="semibold">Ta bort rad?</Text>
        <Text fontSize="sm" color="gray.600">
          Vill du ta bort raden permanent?
        </Text>
        <HStack mt={3} justify="flex-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onClose();
            }}
          >
            Avbryt
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            onClick={async () => {
              const updated = deleteRow(rowId);
              await sparaProjekt(updated);
              closeBodyContextMenu();
              onClose();
            }}
          >
            Ta bort
          </Button>
        </HStack>
      </Box>
    ),
  });
};

const handleRowClick = (row, rowIndex) => {
  const resolvedBtkn =
    row.btkn ||
    (btknPrefix
      ? getNextBtknForRows(
          btknPrefix,
          rows.filter((candidate) => candidate.id !== row.id)
        )
      : '');
  // 🔁 Skapa en temporärt uppdaterad lista där aktuell rad speglar vad som syns i modalen
const tempRows = rows.map((r) =>
  r.id === row.id
    ? {
        ...r,
        btkn: resolvedBtkn,
        selectedAreas: selectedAreas,
        anordning: Array.isArray(row.anordning) ? row.anordning : [],
      }
    : r
);

  // ✅ Identifiera korrekt index baserat på ID
  const fromIndex = rows.findIndex(r => r.id === row.id);

  const matched = buildSamradEntriesForRow(tempRows, fromIndex).map((entry) => ({
    id: entry.id,
    namn: entry.namn,
    telefon: entry.telefon,
  }));


  setSelectedRow({
    ...row,
    btkn: resolvedBtkn,
    dp: row.dp || '',
    linje: row.linje || '',
    index: rowIndex,
    samrad: matched,
  });

  setSelectedRowId(row.id);

 setSelectedAreas(
  row.selections
    ?.map((selected, index) => (selected === true ? index : null))
    .filter((index) => index !== null) || []
);


  onOpen();
};


const handleModalChange = (field, value) => {
  if (!selectedRowId) return;

  if (field === 'dp' || field === 'linje') {
    value = parseInt(value);
  }

  if (field === 'btkn') {
    setBtknPrefix(extractBtknPrefix(value));
  }

  const updatedRows = rows.map((r) =>
    r.id === selectedRowId ? { ...r, [field]: value } : r
  );

  setRows(updatedRows);
  setSelectedRow((prev) => ({ ...prev, [field]: value }));
};

const rowMatchesActivePlan = useCallback((row) => {
  if (!projectPlanEntries.length || !activePlanDate) return true;
  const rowPlanDate = getRowPlanDate(row);
  if (!rowPlanDate) {
    return projectPlanEntries[0]?.key === activePlanEntry?.key;
  }
  return rowPlanDate === activePlanDate;
}, [activePlanDate, activePlanEntry, projectPlanEntries]);

const archivedRowsForActivePlan = useMemo(
  () => rows.filter((row) => row.avslutadRad === true && rowMatchesActivePlan(row)),
  [rowMatchesActivePlan, rows]
);

const chooseFollowUpPlanEntry = useCallback(() => {
  if (!projectPlanEntries.length) return activePlanEntry;
  if (projectPlanEntries.length === 1) return projectPlanEntries[0];

  const currentIndex = Math.max(
    projectPlanEntries.findIndex((entry) => entry.key === activePlanEntry?.key),
    0
  );
  const suggestedIndex =
    currentIndex < projectPlanEntries.length - 1 ? currentIndex + 1 : currentIndex;
  const optionsText = projectPlanEntries
    .map((entry, index) => `${index + 1}. ${formatPlanEntryLabel(entry)}`)
    .join('\n');
  const response = window.prompt(
    `I vilken post ska den förplaneras in?\n${optionsText}`,
    String(suggestedIndex + 1)
  );

  if (response == null) return null;

  const selectedIndex = Number.parseInt(String(response).trim(), 10);
  if (
    !Number.isInteger(selectedIndex) ||
    selectedIndex < 1 ||
    selectedIndex > projectPlanEntries.length
  ) {
    window.alert('Ogiltigt val av post.');
    return null;
  }

  return projectPlanEntries[selectedIndex - 1];
}, [activePlanEntry, projectPlanEntries]);

const filteredRows = rows
  .filter((row) => rowMatchesActivePlan(row))
  .filter((row) =>
    filterValue === 'all' || (row.namn || '').toLowerCase() === filterValue.toLowerCase()
  )
  .filter((row) =>
    (row.namn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.telefon || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
const visibleSectionIndexes = useMemo(() => {
  if (!project?.sections?.length) return [];
  // Always show every saved section so a newly created plan mirrors Skapa Projekt directly.
  return project.sections.map((_, index) => index);
}, [project?.sections]);

useEffect(() => {
  if (!bodyContextMenu.open) return;
  const handleClickOutside = (event) => {
    if (bodyContextRef.current && !bodyContextRef.current.contains(event.target)) {
      closeBodyContextMenu();
    }
  };
  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      closeBodyContextMenu();
    }
  };
  window.addEventListener('mousedown', handleClickOutside);
  window.addEventListener('keydown', handleEscape);
  return () => {
    window.removeEventListener('mousedown', handleClickOutside);
    window.removeEventListener('keydown', handleEscape);
  };
}, [bodyContextMenu.open, closeBodyContextMenu]);

useLayoutEffect(() => {
  if (!bodyContextMenu.open || !bodyContextRef.current) return;
  const raf = requestAnimationFrame(() => {
    if (!bodyContextRef.current) return;
    const rect = bodyContextRef.current.getBoundingClientRect();
    const padding = 8;
    let nextX = bodyContextMenu.x;
    let nextY = bodyContextMenu.y;
    let align = bodyContextMenu.align;

    const maxX = window.innerWidth - rect.width - padding;
    const maxY = window.innerHeight - rect.height - padding;

    nextX = Math.min(Math.max(bodyContextMenu.x, padding), Math.max(padding, maxX));

    if (bodyContextMenu.y + rect.height > window.innerHeight - padding) {
      nextY = Math.max(padding, bodyContextMenu.y - rect.height);
      align = 'up';
    } else {
      nextY = Math.min(Math.max(bodyContextMenu.y, padding), Math.max(padding, maxY));
      align = 'down';
    }

    if (nextX !== bodyContextMenu.x || nextY !== bodyContextMenu.y || align !== bodyContextMenu.align) {
      setBodyContextMenu((prev) => ({ ...prev, x: nextX, y: nextY, align }));
    }
  });
  return () => cancelAnimationFrame(raf);
}, [bodyContextMenu.open, bodyContextMenu.x, bodyContextMenu.y, bodyContextMenu.align]);
if (loading || !project) {
  return <LoadingScreen text="Hämtar projekt..." />;
}
  return (
<Box
  minH="100vh"
  bg="linear-gradient(180deg, #F4F7FB 0%, #E9EEF6 100%)"
  py={6}
  px={[2, 4]}
>
  <Box position="fixed" inset={0} bg="linear-gradient(180deg, #F4F7FB 0%, #E9EEF6 100%)" zIndex={0} />
  <Box position="relative" zIndex={1}>
      <Header />
      <Box maxW="1800px" mx="auto" mt={2} pt="52px">
      <Flex justify="flex-end" mb={2}>
        <Button
          size="xs"
          borderRadius="full"
          variant="outline"
          bg="white"
          borderColor="blue.200"
          onClick={() => setTopPanelCollapsed((prev) => !prev)}
        >
          {topPanelCollapsed ? 'Visa panel' : 'Dölj panel'}
        </Button>
      </Flex>

<Modal isOpen={isProjectInfoOpen} onClose={() => setIsProjectInfoOpen(false)} size="xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold">Projektinformation</Text>
      </Flex>
    </ModalHeader>

    <ModalCloseButton />

<ModalBody>
  <Box>
    <Text><strong>Projektnamn:</strong> {project.name}</Text>
    <Text><strong>Plats:</strong> {project.plats}</Text>
    <Text><strong>Startdatum:</strong> {activePlanEntry?.startDate || project.startDate} {activePlanEntry?.startTime || project.startTime}</Text>
    <Text><strong>Slutdatum:</strong> {activePlanEntry?.endDate || project.endDate} {activePlanEntry?.endTime || project.endTime}</Text>
    <Text><strong>Sluttid:</strong> {projectSluttid || '—'}</Text>
    <Text><strong>FJTKL:</strong> {project.namn} ({project.telefonnummer})</Text>
    <Text><strong>Nödnummer:</strong> {projectNodnummer || '—'}</Text>
<Text>
  <strong>Beteckningar:</strong>{' '}
  {project.beteckningar.map((b) => b.label).join(', ')}
</Text>
    <Box mt={3}>
      <Text fontWeight="bold" mb={1}>Delområden</Text>
      <Stack spacing={1}>
        {projectSectionSummaries.length > 0 ? (
          projectSectionSummaries.map((section) => (
            <Text key={section.id}>
              <strong>{section.label}:</strong> {section.signal || '—'}
            </Text>
          ))
        ) : (
          <Text color="gray.500">Inga delområden sparade.</Text>
        )}
      </Stack>
    </Box>
  </Box>
</ModalBody>

    <ModalFooter justifyContent="space-between">
      <HStack spacing={3}>
                <Button colorScheme="blue" onClick={() => openEditProjectModal(true)}>
          Redigera projekt
        </Button>
        <Button
          colorScheme="red"
          onClick={async () => {
            if (!window.confirm('Är du säker på att du vill ta bort detta projekt?')) return;
            try {
              const tokenData = localStorage.getItem('user');
              const token = tokenData ? JSON.parse(tokenData).token : null;
              await axios.delete(apiUrl(`/api/project/${id}`), {
                headers: { Authorization: `Bearer ${token}` },
              });
              window.location.href = '/dashboard';
            } catch (err) {
              console.error('Kunde inte ta bort projekt:', err);
            }
          }}
        >
          Ta bort projekt
        </Button>
        </HStack>

      <Button variant="ghost" onClick={() => setIsProjectInfoOpen(false)}>
        Stäng
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

<Box mb={3}>
  {topPanelCollapsed ? (
    <Box
      bg="rgba(255,255,255,0.94)"
      border="1px solid #D5DEEA"
      borderRadius="2xl"
      px={4}
      py={2}
      boxShadow="0 12px 28px rgba(15, 23, 42, 0.06)"
    >
      <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
        <Box>
          <Text fontSize="sm" fontWeight="800" color="gray.900">
            {project.name}
          </Text>
          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
            {activePlanEntry?.startDate || '—'} {activePlanEntry?.beteckning ? `• ${activePlanEntry.beteckning}` : ''}
          </Text>
        </Box>
        <HStack spacing={3} wrap="wrap">
          <Text fontSize="xs" color="gray.700" fontWeight="semibold">
            Nödnummer: {projectNodnummer || '—'}
          </Text>
          <Text fontSize="xs" color="gray.700" fontWeight="semibold">
            Sluttid: {projectSluttid || '—'}
          </Text>
        </HStack>
      </Flex>
    </Box>
  ) : (
    <Box
      bg="rgba(255,255,255,0.94)"
      border="1px solid #D5DEEA"
      borderRadius="2xl"
      px={4}
      py={3}
      boxShadow="0 18px 45px rgba(15, 23, 42, 0.08)"
      backdropFilter="blur(12px)"
    >
      {projectPlanEntries.length > 1 && (
        <HStack spacing={2} wrap="wrap" mb={3}>
          {projectPlanEntries.map((entry) => (
            <Button
              key={entry.key}
              size="sm"
              borderRadius="full"
              colorScheme={entry.key === activePlanEntry?.key ? 'blue' : 'gray'}
              variant={entry.key === activePlanEntry?.key ? 'solid' : 'outline'}
              onClick={() => setActivePlanEntryKey(entry.key)}
            >
              {formatPlanEntryLabel(entry)}
            </Button>
          ))}
        </HStack>
      )}
      <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
        <Box>
          <Text fontSize="xs" color="blue.700" textTransform="uppercase" letterSpacing="0.18em" fontWeight="bold">
            Projekt
          </Text>
          <Text fontSize="xl" fontWeight="900" color="gray.900">
            {project.name}
          </Text>
          <Text fontSize="sm" color="gray.700" fontWeight="medium">
            {project.plats}
          </Text>
          {activePlanEntry && (
            <Text fontSize="sm" color="gray.600" fontWeight="semibold">
              {activePlanEntry.startDate || '—'} {activePlanEntry.beteckning ? `• ${activePlanEntry.beteckning}` : ''}
            </Text>
          )}
        </Box>

        <HStack spacing={2} wrap="wrap">
          <Button onClick={() => sparaProjekt()} bg="blue.700" color="white" borderRadius="full" _hover={{ bg: 'blue.800' }} boxShadow="sm" size="sm">
            Spara
          </Button>
          <Button variant="outline" borderRadius="full" borderColor="blue.200" bg="white" onClick={() => addRow()} size="sm">
            + Lägg till rad
          </Button>
          <Button variant="outline" borderRadius="full" borderColor="blue.200" bg="white" onClick={() => setAnteckningarModalOpen(true)} size="sm">
            Anteckningar
          </Button>
          <Button variant="outline" borderRadius="full" borderColor="blue.200" bg="white" onClick={exportPlanToExcel} size="sm">
            Exportera Excel
          </Button>
          <Button variant="outline" borderRadius="full" borderColor="blue.200" bg="white" onClick={() => setArchivedModalOpen(true)} size="sm">
            Avslutade
          </Button>
        </HStack>

        <HStack spacing={2} wrap="wrap">
          <HStack spacing={1} bg="white" border="1px solid #CBD5E1" borderRadius="full" px={1} py={1}>
            <Button
              size="xs"
              variant="ghost"
              borderRadius="full"
              minW="30px"
              onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))))}
            >
              -
            </Button>
            <Text fontSize="xs" fontWeight="bold" color="gray.700" minW="44px" textAlign="center">
              {Math.round(zoomLevel * 100)}%
            </Text>
            <Button
              size="xs"
              variant="ghost"
              borderRadius="full"
              minW="30px"
              onClick={() => setZoomLevel(1)}
            >
              100
            </Button>
            <Button
              size="xs"
              variant="ghost"
              borderRadius="full"
              minW="30px"
              onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
            >
              +
            </Button>
          </HStack>

          <Input
            placeholder="Sök namn eller telefon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            width="220px"
            bg="white"
            border="1px solid #CBD5E1"
            borderRadius="full"
            px={4}
            py={2}
            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 2px rgba(49,130,206,0.18)' }}
          />

          <Button variant="outline" borderRadius="full" borderColor="blue.200" bg="white" onClick={() => setHotkeysOpen(true)} size="sm">
            Kortkommandon
          </Button>
        </HStack>
      </Flex>

      <Divider my={3} borderColor="blue.100" />

      <HStack spacing={4} wrap="wrap">
        <HStack spacing={2} bg="blue.50" border="1px solid #BFDBFE" px={3} py={2} borderRadius="xl">
          <Text fontSize="xs" color="blue.800" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em">Nödnummer</Text>
          <Input
            size="xs"
            placeholder="Nödnummer"
            value={projectNodnummer}
            isReadOnly
            bg="white"
            border="1px solid #BFDBFE"
            width="170px"
          />
        </HStack>

        <HStack spacing={2} bg="orange.50" border="1px solid #FBD38D" px={3} py={2} borderRadius="xl">
          <Text fontSize="xs" color="orange.800" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em">Sluttid</Text>
          <Input
            size="xs"
            type="time"
            placeholder="Tid"
            value={projectSluttid}
            isReadOnly
            bg="white"
            border="1px solid #FBD38D"
            width="90px"
          />
        </HStack>
      </HStack>
    </Box>
  )}
</Box>

  <Box overflowX="visible">
      <Flex gap={2} align="start" minW="fit-content" w="full">
    <TableContainer
      bg="rgba(255,255,255,0.96)"
      p={0}
      borderRadius="2xl"
      boxShadow="0 20px 55px rgba(15, 23, 42, 0.10)"
      border="2px solid #475569"
      overflowX="auto"
      overflowY="scroll"
      maxH="calc(100vh - 170px)"
      w="full" 
      minW="100%" 
      sx={{
        zoom: zoomLevel,
        WebkitFontSmoothing: 'subpixel-antialiased',
        MozOsxFontSmoothing: 'auto',
        textRendering: 'auto',
        '&::-webkit-scrollbar': {
          width: '12px',
          height: '12px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#E2E8F0',
          borderRadius: '999px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#64748B',
          borderRadius: '999px',
          border: '2px solid #E2E8F0',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#475569',
        },
      }}
    >
      <Table
        variant="simple"
        size="sm"
        sx={{
          'th, td': {
            border: '2px solid #475569',
            paddingX: '10px',
            paddingY: '8px',
            fontSize: '12px',
            fontWeight: '700',
            overflow: 'visible',
            position: 'relative',
            textRendering: 'auto',
          },
          thead: {
            background: 'linear-gradient(180deg, #EDF4FF 0%, #E2EBF7 100%)',
          },
          'thead tr:nth-of-type(1) th': {
            position: 'sticky',
            top: 0,
            zIndex: 8,
            background: 'linear-gradient(180deg, #EDF4FF 0%, #E2EBF7 100%)',
          },
          'thead tr:nth-of-type(2) th': {
            position: 'sticky',
            top: '34px',
            zIndex: 7,
            background: 'linear-gradient(180deg, #EDF4FF 0%, #E2EBF7 100%)',
          },
          'tbody tr:nth-of-type(even)': {
            backgroundColor: '#E2E8F0',
          },
          'tbody tr': {
            borderBottom: '2px solid #475569',
          },
          'tbody tr:hover': {
            backgroundColor: '#E9F2FF !important',
          },
          'tbody input': {
            height: '28px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#0F172A',
            WebkitFontSmoothing: 'subpixel-antialiased',
            textRendering: 'auto',
          },
          'input': {
            border: '1px solid transparent',
            boxShadow: 'none',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.72)',
            WebkitFontSmoothing: 'subpixel-antialiased',
            textRendering: 'auto',
          },
          'input:focus': {
            borderColor: '#93C5FD',
            boxShadow: '0 0 0 2px rgba(59,130,246,0.12)',
          },
        }}
      >
        <Thead bg="linear-gradient(180deg, #EDF4FF 0%, #E2EBF7 100%)">
          <Tr>
            {visibleColumns['#'] && <Th />}
            {visibleColumns.btkn && (
              <Th p={1}>
                <Input
                  size="xs"
                  variant="flushed"
                  placeholder="BTKN-prefix"
                  value={btknPrefix}
                  onChange={(e) => setBtknPrefix(e.target.value.toUpperCase())}
                />
              </Th>
            )}
            {visibleColumns.namn && <Th />}
            {visibleColumns.telefon && <Th />}
            {visibleColumns.anordning && <Th />}
            {visibleSectionIndexes.map((idx) => {
              const sec = project.sections[idx];
              const sectionWidth = columnWidths[`section-${idx}`] || columnWidths.sectionDefault || 108;
              return (
                <Th
                  key={`section-label-${idx}`}
                  w={`${sectionWidth}px`}
                  minW={`${sectionWidth}px`}
                  h="24px"
                  p={0}
                  m={0}
                  bg={idx % 2 === 0 ? 'blue.100' : 'rgba(255,255,255,0.92)'}
                  textAlign="center"
                  verticalAlign="middle"
                >
                  <Stack spacing={0} align="center" justify="center" h="100%">
                    <Text
                      fontSize="7px"
                      fontWeight="bold"
                      color="gray.700"
                      textTransform="uppercase"
                      letterSpacing="-0.01em"
                      lineHeight="1"
                    >
                      Delomr
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="extrabold"
                      color="gray.900"
                      lineHeight="1"
                    >
                      {getSectionMarker(sec, idx)}
                    </Text>
                  </Stack>
                </Th>
              );
            })}
            {visibleColumns.starttid && <Th />}
            {visibleColumns.begard && <Th />}
            <Th />
          </Tr>
          <Tr>
            {visibleColumns['#'] && (
              <Th
                width="40px"
                textAlign="center"
                py={2}
                color="gray.700"
                fontSize="sm"
                fontWeight="semibold"
                borderBottom="2px solid #CBD5E0"
      >
        #
      </Th>
    )}
    {visibleColumns.btkn && (
      <Th py={1} px={1} fontWeight="semibold" color="gray.700" width={`${columnWidths.btkn}px`}>
        <Flex align="center" gap={2}>
          <Flex align="center" gap={2}>
            <FiHash size={14} />
            BTKN
          </Flex>
        </Flex>
      </Th>
    )}
    {visibleColumns.namn && (
      <Th py={1} px={1} fontWeight="semibold" color="gray.700" width={`${columnWidths.namn}px`}>
        <Flex align="center" gap={2}>
          <Flex align="center" gap={2}>
            <FiUser size={14} />
            Namn
          </Flex>
        </Flex>
      </Th>
    )}
    {visibleColumns.telefon && (
      <Th py={1} px={1} fontWeight="semibold" color="gray.700" width={`${columnWidths.telefon}px`}>
        <Flex align="center" gap={2}>
          <Flex align="center" gap={2}>
            <FiPhone size={14} />
            Telefon
          </Flex>
        </Flex>
      </Th>
    )}
    {visibleColumns.anordning && (
      <Th py={1} px={1} fontWeight="semibold" color="gray.700" width={`${columnWidths.anordning}px`}>
        <Flex align="center" gap={2}>
          <Flex align="center" gap={2}>
            <FiAperture size={14} />
            Anordn
          </Flex>
        </Flex>
      </Th>
    )}

{visibleSectionIndexes.map((idx) => {
  const sec = project.sections[idx];
  const sectionWidth = columnWidths[`section-${idx}`] || columnWidths.sectionDefault || 108;
  const { signal, spar } = splitSectionSignalAndTrack(sec);
  const signalText = compactSectionText(signal);
  const boundaryText = compactSectionText(sec.granspunkter || signalText);
  return (
<Th
  key={idx}
  w={`${sectionWidth}px`}
  minW={`${sectionWidth}px`}
  h="34px"
  p={0}
  m="0"
  bg={idx % 2 === 0 ? 'gray.100' : 'white'}
  textAlign="center"
  verticalAlign="middle"
>
    <Box
      position="relative"
      w="100%"
      h="100%"
      cursor="help"
      overflow="visible"
      aria-label="Signalinfo"
      onMouseEnter={() =>
        setHoveredSectionInfo({
          index: idx,
          label: `Del ${getSectionMarker(sec, idx)}`,
          signal: signalText,
          boundary: boundaryText,
          track: spar || sec.spar || '',
        })
      }
      onMouseLeave={() => setHoveredSectionInfo((current) => (current?.index === idx ? null : current))}
    >
      <Flex
        direction="column"
        gap={0.5}
        align="center"
        justify="center"
        position="relative"
        zIndex={1}
        w="100%"
        h="100%"
        px={0.5}
        py={0.5}
      >
        <Text
          fontSize="8px"
          fontWeight="extrabold"
          color="black"
          lineHeight="1"
          textAlign="center"
          noOfLines={1}
          letterSpacing="-0.01em"
          px={0.5}
        >
          {signalText || 'Ej angivet'}
        </Text>
        <Text
          fontSize="7px"
          fontWeight="bold"
          color="gray.900"
          lineHeight="1"
          textAlign="center"
          noOfLines={1}
          px={0.5}
        >
          {spar || sec.spar || '—'}
        </Text>
      </Flex>
      {hoveredSectionInfo?.index === idx && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left="50%"
          transform="translateX(-50%)"
          minW="200px"
          maxW="280px"
          px={3}
          py={3}
          bg="rgba(255,255,255,0.98)"
          border="2px solid #64748B"
          borderRadius="lg"
          boxShadow="0 14px 28px rgba(15, 23, 42, 0.22)"
          zIndex={20}
          pointerEvents="none"
        >
          <Text fontSize="11px" fontWeight="extrabold" color="blue.800" mb={1.5} textAlign="left">
            {hoveredSectionInfo.label}
          </Text>
          <Text fontSize="12px" fontWeight="extrabold" color="gray.900" lineHeight="1.3" textAlign="left">
            {hoveredSectionInfo.signal || 'Ej angivet'}
          </Text>
          <Text fontSize="11px" fontWeight="bold" color="gray.700" lineHeight="1.3" textAlign="left" mt={1}>
            {hoveredSectionInfo.track || 'Ej angivet'}
          </Text>
        </Box>
      )}
    </Box>
</Th>
  );
})}
    {visibleColumns.starttid && (
      <Th py={1} px={1} fontWeight="semibold" color="gray.700" width={`${columnWidths.starttid}px`}>
        <Flex align="center" gap={2}>
          <Flex align="center" gap={2}>
            Start
          </Flex>
        </Flex>
      </Th>
    )}
    {visibleColumns.begard && (
      <Th py={1} px={1} fontWeight="semibold" color="gray.700" width={`${columnWidths.begard}px`}>
        <Flex align="center" gap={2}>
          <Flex align="center" gap={2}>
            Begärd
          </Flex>
        </Flex>
      </Th>
    )}
    <Th py={1} px={1} fontWeight="semibold" color="gray.700" width="48px">
      <Flex align="center" gap={2}>
        <FiSliders size={14} />
      </Flex>
    </Th>
  </Tr>
</Thead>

          <Tbody>
            {filteredRows
              .filter((row) => !row.avslutadRad)
              .map((row, rowIndex) => {
                const cell = (key) => getCellMeta(row, key);
                const cellIcon = (key) => getIconConfig(cell(key).icon);
                const btknMeta = cell('btkn');
	                const namnMeta = cell('namn');
	                const telefonMeta = cell('telefon');
	                const anordningMeta = cell('anordning');
	                const hotkeyMode = false;
	                const savedRowBg = row.isSavedPlan
	                  ? activeRowId === row.id
	                    ? 'green.200'
	                    : 'green.100'
	                  : null;
	                const startedBegardBg =
	                  !row.isSavedPlan && (row.startdatum || row.starttid)
	                    ? activeRowId === row.id
	                      ? 'yellow.200'
	                      : 'yellow.100'
	                    : null;

	                return (
	                <Tr
	                  key={row.id}
	                  bg={
	                    savedRowBg
	                      ? savedRowBg
	                      : activeRowId === row.id
	                        ? 'blue.100'
	                        : 'transparent'
	                  }
                  _hover={{ bg: row.isSavedPlan ? 'green.50' : 'blue.50' }}
                  cursor="default"
                  transition="background 0.2s ease, box-shadow 0.2s ease"
                  onMouseEnter={() => setActiveRowId(row.id)}
                >
                  {visibleColumns['#'] && (
                    <Td width="40px" borderRight="2px solid #6B7C8F">
                      <Text color="gray.800" fontSize="sm" textAlign="center">
                        {rowIndex + 1}
                      </Text>
                    </Td>
                  )}
{visibleColumns.btkn && (
  <Td
    width={`${columnWidths.btkn}px`}
    borderRight="2px solid #6B7C8F"
    px={1}
    py={1}
	    bg={
	      selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'btkn'
	        ? 'blue.100'
	        : btknMeta?.color || savedRowBg || 'transparent'
	    }
    onMouseDown={(e) => {
      e.stopPropagation();
      if (hotkeyMode) {
        handleCellInteraction(row, 'btkn', 'BTKN');
        return;
      }
      toggleBodyCellSelection(row.id, 'btkn');
    }}
    onContextMenu={(e) => openBodyContextMenu(e, row.id, 'btkn')}
  >
    <Flex align="center" justify="space-between" gap={2}>
      <Input
        size="xs"
        variant="flushed"
        value={row.btkn || ''}
        onChange={(e) => updateRowField(row.id, 'btkn', e.target.value)}
        isReadOnly={hotkeyMode}
        onFocus={() => setActiveRowId(row.id)}
        onBlur={() => setEditingBodyCell(null)}
        cursor="text"
        caretColor="auto"
      />
    </Flex>
  </Td>
)}

{visibleColumns.namn && (
  <Td
    maxW={`${columnWidths.namn}px`}
    borderRight="2px solid #6B7C8F"
    px={1}
    py={1}
	    bg={
	      selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'namn'
	        ? 'blue.100'
	        : namnMeta?.color || savedRowBg || 'transparent'
	    }
    onMouseDown={(e) => {
      e.stopPropagation();
      if (hotkeyMode) {
        handleCellInteraction(row, 'namn', 'Namn');
        return;
      }
      toggleBodyCellSelection(row.id, 'namn');
    }}
    onContextMenu={(e) => openBodyContextMenu(e, row.id, 'namn')}
  >
    <Flex align="center" justify="space-between" gap={2}>
      <Input
        size="xs"
        variant="flushed"
        value={row.namn || ''}
        onChange={(e) => updateRowField(row.id, 'namn', e.target.value)}
        isReadOnly={hotkeyMode}
        onFocus={() => setActiveRowId(row.id)}
        onBlur={() => setEditingBodyCell(null)}
        cursor="text"
        caretColor="auto"
      />
    </Flex>
  </Td>
)}

{visibleColumns.telefon && (
  <Td
    maxW={`${columnWidths.telefon}px`}
    borderRight="2px solid #6B7C8F"
    px={1}
    py={1}
	    bg={
	      selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'telefon'
	        ? 'blue.100'
	        : telefonMeta?.color || savedRowBg || 'transparent'
	    }
    onMouseDown={(e) => {
      e.stopPropagation();
      if (hotkeyMode) {
        handleCellInteraction(row, 'telefon', 'Telefon');
        return;
      }
      toggleBodyCellSelection(row.id, 'telefon');
    }}
    onContextMenu={(e) => openBodyContextMenu(e, row.id, 'telefon')}
  >
    <Flex align="center" justify="space-between" gap={2}>
      <Input
        size="xs"
        variant="flushed"
        value={row.telefon || ''}
        onChange={(e) => updateRowField(row.id, 'telefon', e.target.value)}
        isReadOnly={hotkeyMode}
        onFocus={() => setActiveRowId(row.id)}
        onBlur={() => setEditingBodyCell(null)}
        cursor="text"
        caretColor="auto"
        px={0}
        minW="0"
      />
    </Flex>
  </Td>
)}

{visibleColumns.anordning && (
  <Td
    maxW={`${columnWidths.anordning}px`}
    borderRight="2px solid #6B7C8F"
    px={1}
    py={1}
	    bg={
	      selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'anordning'
	        ? 'blue.100'
	        : anordningMeta?.color || savedRowBg || 'transparent'
	    }
    onMouseDown={(e) => {
      e.stopPropagation();
      if (hotkeyMode) {
        handleCellInteraction(row, 'anordning', 'Anordning');
        return;
      }
      toggleBodyCellSelection(row.id, 'anordning');
    }}
    onContextMenu={(e) => openBodyContextMenu(e, row.id, 'anordning')}
  >
    <Menu closeOnSelect isOpen={hotkeyMode ? false : undefined}>
      <MenuButton
        as={Button}
        size="xs"
        bg="transparent"
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
        _focus={{ boxShadow: 'none' }}
        isDisabled={hotkeyMode}
        onClick={() => setActiveRowId(row.id)}
        minW="0"
        px={1}
      >
        {Array.isArray(row.anordning) && row.anordning.length > 0 ? (
          <Flex gap={1} wrap="wrap" justify="center">
            {row.anordning.map((item) => {
              return (
                <Badge
                  key={item}
                  colorScheme={getAnordningColor(item)}
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="none"
                  textTransform="none"
                >
                  {formatAnordningLabel(item)}
                </Badge>
              );
            })}
          </Flex>
        ) : (
          'Välj'
        )}
      </MenuButton>
      <Portal>
        <MenuList maxHeight="240px" overflowY="auto">
          {ANORDNING_OPTIONS.map((option) => (
            <MenuItem
              key={option}
              onClick={() => {
                updateRowField(row.id, 'anordning', [option]);
                setEditingBodyCell(null);
              }}
            >
              <Badge
                colorScheme={getAnordningColor(option)}
                variant="subtle"
                fontSize="xs"
                px={2}
                py={0.5}
                borderRadius="none"
                textTransform="none"
                mr={2}
              >
                {option}
              </Badge>
              {formatAnordningLabel(option)}
            </MenuItem>
          ))}
        </MenuList>
      </Portal>
    </Menu>
  </Td>
)}

                {visibleSectionIndexes.map((secIdx) => {
                  const cellKey = `section-${secIdx}`;
                  const sectionMeta = cell(cellKey);
                  const sectionIcon = cellIcon(cellKey);
                  const sectionWidth = columnWidths[`section-${secIdx}`] || columnWidths.sectionDefault || 14;
  const baseBg = secIdx % 2 === 0 ? 'gray.100' : 'white';

  return (
    <Td
      key={secIdx}
      width={`${sectionWidth}px`}
      minW={`${sectionWidth}px`}
      px={0.5}
      py={1}
	      bg={
	        selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === cellKey
	          ? 'blue.100'
	          : sectionMeta?.color || savedRowBg || baseBg
	      }
      borderRight="2px solid #6B7C8F"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (hotkeyMode) {
          handleCellInteraction(row, cellKey, `Delområde ${getSectionMarker(project.sections[secIdx], secIdx)}`);
          return;
        }
        toggleBodyCellSelection(row.id, cellKey);
      }}
      onContextMenu={(e) => openBodyContextMenu(e, row.id, cellKey)}
      onDoubleClick={() => {
        if (hotkeyMode) {
          handleCellInteraction(row, cellKey, `Delområde ${getSectionMarker(project.sections[secIdx], secIdx)}`);
          return;
        }
        toggleDelomrade(row.id, secIdx);
      }}
    >
      <Flex align="center" justify="center" gap={1}>
        {row.selections[secIdx] === true && <HiX size={16} color="black" style={{ strokeWidth: 1.5 }} />}
        {sectionIcon?.icon && (
          <Icon as={sectionIcon.icon} color={sectionIcon.color} boxSize="13px" />
        )}
      </Flex>
      {sectionMeta?.comment && (
        <Tooltip label={sectionMeta.comment} hasArrow>
          <Icon as={FaRegCommentDots} color="gray.700" boxSize="12px" mt={0.5} />
        </Tooltip>
      )}
    </Td>
  );
})}

  {visibleColumns.starttid && (
    <Td
        minW={`${columnWidths.starttid}px`}
      borderRight="2px solid #6B7C8F"
      px={1}
      py={1}
	      bg={
	        selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'starttid'
	          ? 'blue.100'
	          : savedRowBg || 'transparent'
	      }
      onMouseDown={(e) => {
        e.stopPropagation();
        if (hotkeyMode) {
          handleCellInteraction(row, 'starttid', 'Start');
          return;
        }
        toggleBodyCellSelection(row.id, 'starttid');
      }}
      onContextMenu={(e) => openBodyContextMenu(e, row.id, 'starttid')}
    >
      <Input
        size="xs"
        type="time"
        variant="flushed"
        value={row.starttid || ''}
        onChange={(e) => updateRowField(row.id, 'starttid', e.target.value)}
        isReadOnly={hotkeyMode}
        onFocus={() => setActiveRowId(row.id)}
        width="100%"
        onBlur={() => setEditingBodyCell(null)}
        cursor="text"
        caretColor="auto"
      />
    </Td>
  )}
  {visibleColumns.begard && (
    <Td
        minW={`${columnWidths.begard}px`}
      borderRight="2px solid #6B7C8F"
      px={1}
      py={1}
	      bg={
	        selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'begard'
	          ? 'blue.100'
	          : savedRowBg || startedBegardBg || 'transparent'
	      }
      onMouseDown={(e) => {
        e.stopPropagation();
        if (hotkeyMode) {
          handleCellInteraction(row, 'begard', 'Begärd');
          return;
        }
        toggleBodyCellSelection(row.id, 'begard');
      }}
      onContextMenu={(e) => openBodyContextMenu(e, row.id, 'begard')}
	    >
	      <VStack align="stretch" spacing={0}>
	        <Input
	          size="xs"
	          type="time"
	          variant="flushed"
	          value={row.begard || ''}
	          onChange={(e) => updateRowField(row.id, 'begard', e.target.value)}
	          isReadOnly={hotkeyMode}
	          onFocus={() => setActiveRowId(row.id)}
	          width="100%"
	          onBlur={() => setEditingBodyCell(null)}
	          cursor="text"
	          caretColor="auto"
	        />
	        {row.starttid && (
	          <Text fontSize="9px" lineHeight="1.1" color="gray.700" fontWeight="semibold">
	            {`Start kl ${formatClockLabel(row.starttid)}`}
	          </Text>
	        )}
	      </VStack>
	    </Td>
	  )}
  <Td borderRight="2px solid #6B7C8F" px={1} py={1}>
    <Flex align="center" gap={1}>
      <IconButton
        size="xs"
        variant="outline"
        icon={<FiEdit2 />}
        aria-label="Redigera rad"
        onClick={() => openRowModal(row, rowIndex)}
      />
      <IconButton
        size="xs"
        variant="outline"
        icon={<FiMessageCircle />}
        aria-label="Samråd"
        onClick={() => {
          setSamradModalRow(row);
          onOpenSamradModal();
        }}
      />
    </Flex>
  </Td>
    </Tr>
  );
})}
{project?.tsmRows?.filter((row) => rowMatchesActivePlan(row)).map((row, rowIndex) => (
  <Tr
    key={`tsm-${row.id}`}
    bg="#C6F6D5"
    _hover={{ bg: '#D1FAE5' }}
    cursor="pointer"
onClick={() => {
  setEditableTsmRow({
    ...row,
    namn: row.namn || `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim(),
    telefon: row.telefon || row.user?.phone || '',
  });

  onOpenApprovalModal();
}}
  >
    {visibleColumns['#'] && <Td borderRight="1px solid rgba(0, 0, 0, 0.05)" />}
    {visibleColumns.btkn && (
      <Td borderRight="1px solid rgba(0, 0, 0, 0.1)">
        <Text />
      </Td>
    )}
    {visibleColumns.namn && (
      <Td borderRight="1px solid rgba(0, 0, 0, 0.1)">
        <Text>
          {row.user?.firstName} {row.user?.lastName}
        </Text>
      </Td>
    )}
    {visibleColumns.telefon && (
      <Td borderRight="1px solid rgba(0, 0, 0, 0.1)">
        <Text>{row.user?.phone || '-'}</Text>
      </Td>
    )}
    {visibleColumns.anordning && (
      <Td maxW="160px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
        <Flex gap={1}>
          {(Array.isArray(row.anordning)
            ? row.anordning
            : typeof row.anordning === 'string'
            ? row.anordning.split(',').map((a) => a.trim())
            : []
          ).map((item, idx) => {
            return (
              <Badge
                key={idx}
                colorScheme={getAnordningColor(item)}
                variant="subtle"
                fontSize="xs"
                px={2}
                py={0.5}
                borderRadius="none"
                textTransform="none"
              >
                {formatAnordningLabel(item)}
              </Badge>
            );
          })}
        </Flex>
      </Td>
    )}

    {/* DELOMRÅDEN (checkboxar) */}
    {visibleSectionIndexes.map((secIdx) => (
      <Td
        key={secIdx}
        width={`${columnWidths[`section-${secIdx}`] || columnWidths.sectionDefault || 140}px`}
        minW={`${columnWidths[`section-${secIdx}`] || columnWidths.sectionDefault || 140}px`}
        bg={secIdx % 2 === 0 ? 'blue.50' : 'transparent'}
        borderRight="1px solid rgba(0, 0, 0, 0.05)"
      >
        <Flex justify="center">
          {row.selections?.[secIdx] === true && <HiX size={16} color="black" />}
        </Flex>
      </Td>
    ))}

    {visibleColumns.starttid && (
      <Td borderRight="1px solid rgba(0, 0, 0, 0.05)">
        <Text fontSize="sm">{row.startTime || row.starttid || '–'}</Text>
      </Td>
    )}
	    {visibleColumns.begard && (
	      <Td borderRight="1px solid rgba(0, 0, 0, 0.05)">
	        <VStack align="start" spacing={0}>
	          <Text fontSize="sm">{row.begard || '–'}</Text>
	          {row.starttid && (
	            <Text fontSize="xs" color="gray.600" fontWeight="semibold">
	              {`Start kl ${formatClockLabel(row.starttid)}`}
	            </Text>
	          )}
	        </VStack>
	      </Td>
	    )}
    <Td borderRight="1px solid rgba(0, 0, 0, 0.05)" />
  </Tr>
))}
</Tbody>
        </Table>
</TableContainer>
</Flex>
</Box>
</Box>
</Box>

{/*Slut på table*/}

{bodyContextMenu.open && selectedBodyCell && (
  <Portal>
      <Box
        ref={bodyContextRef}
        position="fixed"
        top={`${bodyContextMenu.y}px`}
        left={`${bodyContextMenu.x}px`}
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="md"
        boxShadow="lg"
        p={3}
        zIndex={2000}
        minW="220px"
        maxH="calc(100vh - 16px)"
        overflowY="auto"
      >
      <Text fontSize="xs" color="gray.500" mb={2}>
        Cell: {selectedBodyCell.key}
      </Text>
      <Text fontSize="xs" fontWeight="semibold" mb={1}>
        Färg
      </Text>
      <SimpleGrid columns={4} spacing={1} mb={2}>
        {CELL_COLORS.map((color) => (
          <Button
            key={color.value || 'none'}
            size="xs"
            variant="outline"
            bg={color.value || 'transparent'}
            onClick={() => applyMetaToSelectedBodyCell({ color: color.value })}
          >
            {color.label}
          </Button>
        ))}
      </SimpleGrid>

      <Text fontSize="xs" fontWeight="semibold" mb={1}>
        Symbol
      </Text>
      <SimpleGrid columns={4} spacing={1} mb={2}>
        {CELL_ICONS.map((option) => (
          <Button
            key={option.key || 'none'}
            size="xs"
            variant="outline"
            onClick={() => applyMetaToSelectedBodyCell({ icon: option.key })}
          >
            {option.icon ? <Icon as={option.icon} color={option.color} /> : '–'}
          </Button>
        ))}
      </SimpleGrid>

      <Text fontSize="xs" fontWeight="semibold" mb={1}>
        Kommentar
      </Text>
      <Textarea
        size="xs"
        value={selectedBodyMeta?.comment || ''}
        onChange={(e) => applyMetaToSelectedBodyCell({ comment: e.target.value })}
        placeholder="Lägg till kommentar"
        mb={2}
      />

      <HStack justify="space-between">
        <Button size="xs" variant="ghost" onClick={closeBodyContextMenu}>
          Stäng
        </Button>
        <Button size="xs" colorScheme="red" variant="outline" onClick={() => applyMetaToSelectedBodyCell({ __clear: true })}>
          Rensa
        </Button>
      </HStack>

      <Divider my={2} />

      <Button
        size="xs"
        colorScheme="red"
        variant="solid"
        w="full"
        onClick={() => {
          if (!selectedBodyCell) return;
          showDeleteRowConfirm(selectedBodyCell.rowId);
        }}
      >
        Ta bort rad
      </Button>
    </Box>
  </Portal>
)}

<Modal isOpen={hotkeysOpen} onClose={() => setHotkeysOpen(false)} size="md">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Kortkommandon</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Stack spacing={2} fontSize="sm" color="gray.700">
        <Flex justify="space-between"><Text>T</Text><Text>Starttid = nu</Text></Flex>
        <Flex justify="space-between"><Text>Shift + T</Text><Text>Begärd = nu</Text></Flex>
        <Flex justify="space-between"><Text>Alt + T</Text><Text>Slut = nu</Text></Flex>
        <Flex justify="space-between"><Text>D</Text><Text>Avsluta rad</Text></Flex>
        <Flex justify="space-between"><Text>Shift + D</Text><Text>Begärd‑datum = idag</Text></Flex>
        <Flex justify="space-between"><Text>Shift + +</Text><Text>Zooma in</Text></Flex>
        <Flex justify="space-between"><Text>Shift + -</Text><Text>Zooma ut</Text></Flex>
        <Flex justify="space-between"><Text>⌘ + S</Text><Text>Spara</Text></Flex>
        <Flex justify="space-between"><Text>⌘ + /</Text><Text>Visa/Dölj hjälp</Text></Flex>
      </Stack>
      <Text mt={3} fontSize="xs" color="gray.500">
        Aktiva raden = senast hover/fokus.
      </Text>
    </ModalBody>
    <ModalFooter>
      <Button onClick={() => setHotkeysOpen(false)}>Stäng</Button>
    </ModalFooter>
  </ModalContent>
</Modal>


  <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} size="4xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Redigera projekt</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Flex direction={{ base: "column", md: "row" }} gap={8} align="start">
        {/* Vänsterkolumn: Fält + knappar */}
        <Box flex={2}>
          <Stack spacing={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Projektnamn</FormLabel>
                <Input value={projektNamn} onChange={(e) => setProjektNamn(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Plats</FormLabel>
                <Input value={plats} onChange={(e) => setPlats(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Startdatum</FormLabel>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Starttid</FormLabel>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Slutdatum</FormLabel>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Sluttid</FormLabel>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>FJTKL Namn</FormLabel>
                <Input value={namn} onChange={(e) => setNamn(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>FJTKL Telefonnummer</FormLabel>
                <Input value={telefonnummer} onChange={(e) => setTelefonnummer(e.target.value)} />
              </FormControl>
              <Box>
  <FormLabel>Beteckningar</FormLabel>
  {editBeteckningar.map((b, i) => (
    <Input
      key={i}
      value={b}
      onChange={(e) => {
        const updated = [...editBeteckningar];
        updated[i] = e.target.value;
        setEditBeteckningar(updated);
      }}
      placeholder={`Beteckning ${i + 1}`}
      mb={2}
    />
  ))}
  <Button
    onClick={() => setEditBeteckningar([...editBeteckningar, ''])}
    colorScheme="blue"
    variant="outline"
    size="sm"
  >
    + Lägg till beteckning
  </Button>
</Box>
            </SimpleGrid>
            

            {/* Flyttade knappar */}
            <Box>
              <FormLabel>Delområden (DP / Linje)</FormLabel>
              <Flex gap={4}>
                <Button colorScheme="blue" onClick={addEditDP}>
                  + Lägg till DP
                </Button>
                <Button colorScheme="green" onClick={addEditLinje}>
                  + Lägg till Linje
                </Button>
              </Flex>
            </Box>
          </Stack>
        </Box>

        {/* Högerkolumn: DP / Linje lista */}
        <Box flex={2}>
          {editSections.map((sec, i) => (
            <Box key={i} mb={3} p={3} bg="gray.50" borderRadius="md" borderWidth="1px">
              <Text mb={1} fontWeight="semibold">
                {getSectionLabel(sec, i)}
              </Text>
              <Input
                value={sec.signal}
                onChange={(e) => handleEditSignalChange(i, e.target.value)}
                placeholder="Signal"
              />
            </Box>
          ))}
        </Box>
      </Flex>
    </ModalBody>
    <ModalFooter>
      <Button colorScheme="blue" mr={3} onClick={updateProject}>
        Spara ändringar
      </Button>
      <Button onClick={() => setEditModalOpen(false)}>Stäng</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

<Modal isOpen={isOpen} onClose={onClose} size="4xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Redigera rad</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {selectedRow && (
        <SimpleGrid columns={2} spacing={6}>

          {/* Vänsterkolumn: formulärfält */}
          <Stack spacing={4}>
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>BTKN</FormLabel>
                <Input value={selectedRow.btkn} onChange={(e) => handleModalChange('btkn', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Namn</FormLabel>
                <Input value={selectedRow.namn} onChange={(e) => handleModalChange('namn', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Telefon</FormLabel>
                <Input value={selectedRow.telefon} onChange={(e) => handleModalChange('telefon', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel visibility="hidden">Spara</FormLabel>
                <Button
                  colorScheme="blue"
                  onClick={async () => {
                    const updatedRows = rows.map((row) =>
                      row.id === selectedRow.id
                        ? {
                            ...row,
                            ...selectedRow,
                            selectedAreas: [...selectedAreas],
                            planDate: activePlanEntry?.startDate || row.planDate || '',
                            planEntryKey: activePlanEntry?.key || row.planEntryKey || '',
                            begardDatum: selectedRow.begardDatum || activePlanEntry?.startDate || '',
                            isSavedPlan: true,
                          }
                        : row
                    );
                    await sparaProjekt(updatedRows);
                    onClose();
                  }}
                >
                  Spara
                </Button>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={4}>
<FormControl>
  <FormLabel>Delområde</FormLabel>
  <Menu closeOnSelect={false}>
    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
      {selectedAreas.length > 0
        ? `${selectedAreas.length} valda`
        : 'Välj delområden'}
    </MenuButton>
    <MenuList maxHeight="300px" overflowY="auto">
      {project.sections.map((sec, idx) => (
<MenuItem key={idx}>
	<Checkbox
	  isChecked={selectedAreas.includes(Number(idx))}
	  onChange={(e) => {
    const isChecked = e.target.checked;

    const updatedAreas = isChecked
      ? [...new Set([...selectedAreas, Number(idx)])].sort((a, b) => a - b)
      : selectedAreas.filter((i) => i !== Number(idx));

    const updatedSelections = Array(10)
      .fill(false)
      .map((_, i) => updatedAreas.includes(i));

    const newSelectedRow = {
      ...selectedRow,
      selectedAreas: updatedAreas,
      selections: updatedSelections,
    };

    setSelectedAreas(updatedAreas);
    setSelectedRow(newSelectedRow);
    console.log("🟡 selectedAreas uppdaterad:", selectedAreas);

    const newRows = Array.isArray(rows)
      ? rows.map((row) =>
          row.id === selectedRowId
            ? {
                ...row,
                selectedAreas: updatedAreas,
                selections: updatedSelections,
              }
            : row
        )
      : [];

    setRows(newRows);

    calculateSamrad(newRows);
	  }}
	>
	  {[String(getSectionLabel(sec, idx) || '').replace(/^Delområde\s*/i, 'Del '), compactSectionText(sec?.signal || sec?.name || '')].filter(Boolean).join(' ')}
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
      {Array.isArray(selectedRow.anordning) && selectedRow.anordning.length > 0
        ? `${selectedRow.anordning.length} valda`
        : 'Välj skyddsanordning'}
    </MenuButton>
    <MenuList maxHeight="300px" overflowY="auto">
      {ANORDNING_OPTIONS.map((option) => (
        <MenuItem key={option}>
          <Checkbox
            isChecked={selectedRow.anordning?.includes(option)}
            onChange={(e) => {
              const isChecked = e.target.checked;
              handleModalChange(
                'anordning',
                isChecked
                  ? [...(selectedRow.anordning || []), option]
                  : selectedRow.anordning.filter((val) => val !== option)
              );
            }}
          >
            {option} - {formatAnordningLabel(option)}
          </Checkbox>
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
</FormControl>
            </SimpleGrid>

<SimpleGrid columns={2} spacing={4}>
	  <FormControl>
	    <FormLabel>Starta</FormLabel>
	    <VStack align="stretch" spacing={1}>
	      <Button
	        colorScheme="green"
	        onClick={async () => {
	          const today = getCurrentDate();
	          const now = getCurrentTime();
	          if (!selectedRowId) return;
	          const updatedRows = rows.map((row) =>
	            row.id === selectedRowId
	              ? {
	                  ...row,
	                  startdatum: today,
	                  starttid: now,
	                  isSavedPlan: false,
	                }
	              : row
	          );
	          const nextSelectedRow = updatedRows.find((row) => row.id === selectedRowId);
	          setRows(updatedRows);
	          if (nextSelectedRow) {
	            setSelectedRow(nextSelectedRow);
	          }
	          await sparaProjekt(updatedRows);
	          onClose();
	        }}
	      >
	        Starta nu
	      </Button>
	      {selectedRow.starttid && (
	        <Text fontSize="sm" color="gray.700" fontWeight="semibold">
	          {`Start kl ${formatClockLabel(selectedRow.starttid)}`}
	        </Text>
	      )}
	    </VStack>
	  </FormControl>

  {/* Begärd till datum */}
<FormControl>
  <FormLabel>Begärd datum</FormLabel>
  {selectedRow.begardDatum === 'Tsv' ? (
    <Input value="Tillsvidare" isReadOnly />
  ) : (
    <Input
      type="date"
      value={selectedRow.begardDatum || ''}
      onChange={(e) => handleModalChange('begardDatum', e.target.value)}
    />
  )}
  <Button
    size="xs"
    mt={1}
    variant="outline"
    onClick={() =>
      handleModalChange(
        'begardDatum',
        selectedRow.begardDatum === 'Tsv' ? '' : 'Tsv'
      )
    }
  >
    Tillsvidare
  </Button>
</FormControl>

	  <FormControl>
	    <FormLabel>Avsluta</FormLabel>
		    <Button
		      colorScheme="red"
		      onClick={() => {
		        const today = getCurrentDate();
		        const now = getCurrentTime();
	        handleModalChange('avslutatDatum', today);
	        handleModalChange('avslutat', now);
	        handleModalChange('isSavedPlan', false);
	        setPendingCompletionRow({
	          ...selectedRow,
	          avslutatDatum: today,
	          avslutat: now,
	          isSavedPlan: false,
	          selectedAreas: [...selectedAreas],
	        });
	        onOpenFollowUpChoice();
		      }}
	    >
	      Avsluta nu
	    </Button>
  </FormControl>

  {/* Begärd till */}
<FormControl>
  <FormLabel>Begärd till</FormLabel>
  {selectedRow.begard === 'Tsv' ? (
    <Input value="Tillsvidare" isReadOnly />
  ) : (
    <Input
      type="time"
      value={selectedRow.begard || '00:00'}
      onChange={(e) => handleModalChange('begard', e.target.value)}
    />
  )}
  <Button
    size="xs"
    mt={1}
    variant="outline"
    onClick={() =>
      handleModalChange('begard', selectedRow.begard === 'Tsv' ? '' : 'Tsv')
    }
  >
    Tillsvidare
  </Button>
</FormControl>
</SimpleGrid>

            <FormControl>
              <FormLabel>Anteckning</FormLabel>
              <Textarea value={selectedRow?.anteckning ?? ''} onChange={(e) => handleModalChange('anteckning', e.target.value)} />
            </FormControl>
          </Stack>

          {/* Högerkolumn: Mina samråd */}
          <Box bg="gray.50" p={4} borderRadius="md" maxW="400px" border="1px solid #ccc" height="100%">
            <Text fontWeight="bold" mb={2}>Samråd</Text>
{Array.isArray(selectedRow?.samrad) && selectedRow.samrad.length > 0 ? (
  <Stack spacing={2}>
{selectedRow.samrad.map((samradItem, idx) => {
  const person = rows.find((r) => String(r.id) === String(samradItem.id));
  if (!person) return null;

  return (
    <Box key={idx} p={2} border="1px solid #ddd" borderRadius="md" bg="white">
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="sm"><strong>Namn:</strong> {person.namn}</Text>
          <Text fontSize="sm"><strong>Telefon:</strong> {person.telefon}</Text>
        </Box>
        <Checkbox
isChecked={avklaradSamrad[selectedRow.id]?.[person.id] || false}
onChange={() =>
  setAvklaradSamrad((prev) => ({
    ...prev,
    [selectedRow.id]: {
      ...prev[selectedRow.id],
      [person.id]: !prev[selectedRow.id]?.[person.id],
    },
  }))
}
        >
          Avklarad
        </Checkbox>
      </Flex>
    </Box>
  );
})}
              </Stack>
            ) : (
              <Text fontSize="sm" color="gray.500">Inga samråd.</Text>
            )}
          </Box>
          <Box bg="gray.50" p={4} borderRadius="md" maxW="400px" border="1px solid #ccc" height="100%">
            <Text fontWeight="bold" mb={2}>SMS</Text>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Välj mottagare från samråd eller valfri rad och skriv ett eget meddelande.
            </Text>
            <Stack spacing={3}>
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2}>Samråd</Text>
                {smsRecipients.samrad.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">Inga samråd att välja.</Text>
                ) : (
                  <Stack spacing={2}>
                    {smsRecipients.samrad.map((person) => (
                      <Checkbox
                        key={`sms-samrad-${person.id}`}
                        isChecked={!!smsSelection[person.id]}
                        onChange={() => toggleSmsSelection(String(person.id))}
                      >
                        {person.namn || 'Okänt namn'} {person.telefon ? `(${person.telefon})` : '(saknar telefon)'}
                      </Checkbox>
                    ))}
                  </Stack>
                )}
              </Box>
              <Divider />
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2}>Alla rader</Text>
                <Stack spacing={2} maxH="160px" overflowY="auto">
                  {smsRecipients.allRows.map((person) => (
                    <Checkbox
                      key={`sms-row-${person.id}`}
                      isChecked={!!smsSelection[person.id]}
                      onChange={() => toggleSmsSelection(String(person.id))}
                    >
                      {person.namn} {person.telefon ? `(${person.telefon})` : '(saknar telefon)'}
                    </Checkbox>
                  ))}
                </Stack>
              </Box>
              <FormControl>
                <FormLabel>Meddelande</FormLabel>
                <Textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Skriv ditt meddelande..."
                />
              </FormControl>
              <Flex gap={2}>
                <Button colorScheme="blue" onClick={sendCustomSms}>
                  Skicka SMS
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSmsSelection({});
                    setSmsMessage('');
                  }}
                >
                  Rensa
                </Button>
              </Flex>
            </Stack>
          </Box>
        </SimpleGrid>
      )}
    </ModalBody>
<ModalFooter justifyContent="space-between" width="100%">
  {/* Vänstersida: Avsluta och Ta bort */}
<Flex gap={2}>
  <Button
    colorScheme="red"
    onClick={async () => {
      const confirmed = window.confirm('Vill du ta bort denna raden permanent?');
      if (confirmed) {
        const updated = deleteRow(selectedRow.id);
        await sparaProjekt(updated);
        onClose();
      }
    }}
  >
    Ta bort
  </Button>

<Button
  colorScheme="blue"
  onClick={async () => {
    const confirmed = window.confirm('Vill du avsluta denna raden?');
    if (confirmed) {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const initials = `${currentUser?.firstName?.[0] || ''}${currentUser?.lastName?.[0] || ''}`.toUpperCase();

      const updatedRow = {
        ...selectedRow,
        avslutadRad: true,
        avslutadAv: initials,
        startDatum: selectedRow.startDatum,
        startTid: selectedRow.startTid
      };

      const updated = updateRow(updatedRow);
      await sparaProjekt(updated);
      onClose();
    }
  }}
>
  Avsluta
</Button>
</Flex>

  {/* Högersida: Stäng */}
  <Flex gap={2}>
    <Button onClick={onClose}>Stäng</Button>
  </Flex>
</ModalFooter>
  </ModalContent>
</Modal>

<Modal
  isOpen={isFollowUpChoiceOpen}
  onClose={() => {
    setPendingCompletionRow(null);
    onCloseFollowUpChoice();
  }}
  size="md"
>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Förplanera annan dag?</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Text>
        Vill du förplanera inför en annan dag/post, eller ska raden avslutas nu?
      </Text>
      {pendingCompletionRow?.btkn && (
        <Text mt={3} fontSize="sm" color="gray.600">
          Beteckning: {pendingCompletionRow.btkn}
        </Text>
      )}
    </ModalBody>
    <ModalFooter gap={2}>
      <Button
        colorScheme="blue"
        onClick={async () => {
          const targetPlanEntry = chooseFollowUpPlanEntry();
          if (!targetPlanEntry) return;
          await completeSelectedRow(targetPlanEntry);
        }}
      >
        Ja, förplanera
      </Button>
      <Button
        colorScheme="red"
        variant="outline"
        onClick={async () => {
          await completeSelectedRow(null);
        }}
      >
        Nej, avsluta nu
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          setPendingCompletionRow(null);
          onCloseFollowUpChoice();
        }}
      >
        Avbryt
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

<Modal isOpen={isSamradModalOpen} onClose={onCloseSamradModal} size="md">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Samråd</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {samradModalRow ? (
        <Stack spacing={3}>
          <Text fontWeight="semibold">{samradModalRow.namn || samradModalRow.btkn || `Rad ${samradModalRow.id}`}</Text>
          {Array.isArray(samradModalRow.samrad) && samradModalRow.samrad.length > 0 ? (
            <Stack spacing={2}>
              {samradModalRow.samrad.map((entry, idx) => {
                const person = rows.find((r) => String(r.id) === String(entry.id));
                return (
                  <Box key={idx} p={2} border="1px solid #e2e8f0" borderRadius="md" bg="gray.50">
                    <Text fontSize="sm"><strong>Namn:</strong> {person?.namn || entry.namn || 'Okänt'}</Text>
                    <Text fontSize="sm"><strong>Telefon:</strong> {person?.telefon || '-'}</Text>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Text fontSize="sm" color="gray.500">Inga samråd.</Text>
          )}
        </Stack>
      ) : (
        <Text fontSize="sm" color="gray.500">Ingen rad vald.</Text>
      )}
    </ModalBody>
    <ModalFooter>
      <Button onClick={onCloseSamradModal}>Stäng</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

<Modal isOpen={isApprovalModalOpen} onClose={onCloseApprovalModal} size="4xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Godkänn anmälan</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {editableTsmRow && (
        <SimpleGrid columns={2} spacing={6}>
          {/* Vänsterkolumn: formulärfält */}
          <Stack spacing={4}>
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Namn</FormLabel>
                <Input
                  value={editableTsmRow.namn || ''}
                  onChange={(e) => handleApprovalChange('namn', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Telefon</FormLabel>
                <Input
                  value={editableTsmRow.telefon || ''}
                  onChange={(e) => handleApprovalChange('telefon', e.target.value)}
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Delområde</FormLabel>
                <Box bg="gray.50" p={4} borderRadius="md" border="1px solid #ccc" minH="120px">
                  <SimpleGrid spacing={2}>
                    {project.sections.map((sec, idx) => (
	                      <Checkbox
	                        key={idx}
	                        isChecked={selectedApprovalAreas.includes(idx)}
	                        onChange={() => toggleApprovalArea(idx)}
	                      >
	                        {[String(getSectionLabel(sec, idx) || '').replace(/^Delområde\s*/i, 'Del '), compactSectionText(sec?.signal || sec?.name || '')].filter(Boolean).join(' ')}
	                      </Checkbox>
	                    ))}
                  </SimpleGrid>
                </Box>
              </FormControl>

              <FormControl>
                <FormLabel>Skyddsanordning</FormLabel>
                <Menu closeOnSelect={false}>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                    {Array.isArray(editableTsmRow.anordning) && editableTsmRow.anordning.length > 0
                      ? `${editableTsmRow.anordning.length} valda`
                      : 'Välj skyddsanordning'}
                  </MenuButton>
                  <MenuList maxHeight="300px" overflowY="auto">
                    {ANORDNING_OPTIONS.map((option) => (
                      <MenuItem key={option}>
                        <Checkbox
                          isChecked={editableTsmRow.anordning?.includes(option)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const updated = isChecked
                              ? [...(editableTsmRow.anordning || []), option]
                              : editableTsmRow.anordning.filter((val) => val !== option);
                            handleApprovalChange('anordning', updated);
                          }}
                        >
                          {option} - {formatAnordningLabel(option)}
                        </Checkbox>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </FormControl>

              {/* Begärd datum */}
              <FormControl>
                <FormLabel>Begärd datum</FormLabel>
                {editableTsmRow.begardDatum === 'Tsv' ? (
                  <Input value="Tillsvidare" isReadOnly />
                ) : (
                  <Input
                    type="date"
                    value={editableTsmRow.begardDatum || ''}
                    onChange={(e) => handleApprovalChange('begardDatum', e.target.value)}
                  />
                )}
                <Button
                  size="xs"
                  mt={1}
                  variant="outline"
                  onClick={() =>
                    handleApprovalChange(
                      'begardDatum',
                      editableTsmRow.begardDatum === 'Tsv' ? '' : 'Tsv'
                    )
                  }
                >
                  Tillsvidare
                </Button>
              </FormControl>

              {/* Begärd tid */}
              <FormControl>
                <FormLabel>Begärd till</FormLabel>
                {editableTsmRow.begard === 'Tsv' ? (
                  <Input value="Tillsvidare" isReadOnly />
                ) : (
                  <Input
                    type="time"
                    value={editableTsmRow.begard || ''}
                    onChange={(e) => handleApprovalChange('begard', e.target.value)}
                  />
                )}
                <Button
                  size="xs"
                  mt={1}
                  variant="outline"
                  onClick={() =>
                    handleApprovalChange(
                      'begard',
                      editableTsmRow.begard === 'Tsv' ? '' : 'Tsv'
                    )
                  }
                >
                  Tillsvidare
                </Button>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Anteckning</FormLabel>
              <Textarea
                value={editableTsmRow.anteckning || ''}
                onChange={(e) => handleApprovalChange('anteckning', e.target.value)}
              />
            </FormControl>
          </Stack>
        </SimpleGrid>
      )}
    </ModalBody>

    <ModalFooter>
      <Button variant="ghost" mr={3} onClick={onCloseApprovalModal}>
        Avbryt
      </Button>
      <Button
        colorScheme="green"
        onClick={() => {
          approveRow(editableTsmRow.id);
          onCloseApprovalModal();
        }}
      >
        Godkänn
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

<Modal isOpen={anteckningarModalOpen} onClose={() => setAnteckningarModalOpen(false)} size="lg">
  <ModalOverlay />
  <ModalContent maxW="800px">
    <ModalHeader>Anteckningar</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <VStack align="stretch" spacing={4}>
        {/* Lista anteckningar */}
        {anteckningar.length === 0 && (
          <Text color="gray.500" fontSize="sm">Inga anteckningar ännu.</Text>
        )}

        {[...anteckningar].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(note => (
          <Box
            key={note.id}
            p={4}
            bg="gray.50"
            border="1px solid #ddd"
            borderRadius="md"
          >
            <Text fontSize="md" mb={2}>{note.text}</Text>
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" color="gray.600">
                {note.timestamp && `Skapad ${new Date(note.timestamp).toLocaleString('sv-SE')}`}
                {note.author && ` av ${note.author}`}
              </Text>
              <HStack spacing={1}>
                <IconButton
                  icon={<FiEdit2 />}
                  size="xs"
                  aria-label="Redigera"
                  onClick={() => {
                    setNoteText(note.text);
                    setEditingNoteId(note.id);
                  }}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  size="xs"
                  colorScheme="red"
                  aria-label="Ta bort"
                  onClick={() => setAnteckningar(prev => prev.filter(n => n.id !== note.id))}
                />
              </HStack>
            </Flex>
          </Box>
        ))}

        {/* Inmatning + knappar */}
        <Flex direction="column" gap={3}>
          <Textarea
            placeholder="Skriv anteckning…"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={5}
            resize="vertical"
          />
          <Flex gap={2} wrap="wrap">
<Button
  colorScheme="blue"
  onClick={async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!noteText.trim()) return;

    let updatedNotes;

    if (editingNoteId === null) {
      const nextId = Math.max(0, ...anteckningar.map(n => n.id || 0)) + 1;
      updatedNotes = [
        ...anteckningar,
        {
          id: nextId,
          text: noteText.trim(),
          timestamp: new Date().toISOString(),
          author: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        },
      ];
    } else {
      updatedNotes = anteckningar.map(n =>
        n.id === editingNoteId
          ? {
              ...n,
              text: noteText.trim(),
              timestamp: new Date().toISOString(),
              author: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            }
          : n
      );
    }

    setAnteckningar(updatedNotes);
    setNoteText('');
    setEditingNoteId(null);
  }}
>
  {editingNoteId === null ? 'Lägg till' : 'Spara'}
</Button>
            {editingNoteId !== null && (
              <Button variant="ghost" onClick={() => {
                setNoteText('');
                setEditingNoteId(null);
              }}>
                Avbryt
              </Button>
            )}
          </Flex>
        </Flex>
      </VStack>
    </ModalBody>

    <ModalFooter justifyContent="space-between" gap={2} flexWrap="wrap">
      <HStack spacing={2} flexWrap="wrap">
        <Button variant="outline" colorScheme="blue" onClick={forwardAnteckningarByMail}>
          Skicka med mail
        </Button>
        <Button variant="outline" colorScheme="blue" onClick={forwardAnteckningarToOutlook}>
          Skicka med Outlook
        </Button>
      </HStack>
      <HStack spacing={2}>
        <Button
          onClick={async () => {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            if (!token) return alert('Ingen token.');

            try {
              const { data: currentProject } = await axios.get(
                apiUrl(`/api/project/${project.id}`),
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const updatedProject = {
                ...currentProject,
                anteckningar,
              };

              await axios.put(
                apiUrl(`/api/projects/${project.id}`),
                updatedProject,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              setProject({ ...currentProject, anteckningar });

              setAnteckningarModalOpen(false);
            } catch (error) {
              console.error('Kunde inte spara anteckningar:', error);
              alert('Fel vid sparande av anteckningar.');
            }
          }}
        >
          Klar
        </Button>
        <Button variant="ghost" onClick={() => setAnteckningarModalOpen(false)}>Stäng</Button>
      </HStack>
    </ModalFooter>
  </ModalContent>
</Modal>

<Modal isOpen={archivedModalOpen} onClose={() => setArchivedModalOpen(false)} size="6xl">
  <ModalOverlay />
  <ModalContent>
  <ModalHeader>Avslutade</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Stack spacing={4}>
        <Input
          placeholder="Sök efter namn, telefon eller BTKN..."
          mb={2}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

	        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
	          {archivedRowsForActivePlan
	            .filter(
	              (row) =>
	                (row.namn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
	                (row.telefon || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
	                (row.anordning?.join(', ') || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
	                (row.btkn || '').toLowerCase().includes(searchQuery.toLowerCase())
	            )
	            .map((row, index) => (
    <Box
      key={index}
      p={3}
      border="1px solid #ccc"
      borderRadius="md"
      bg="gray.50"
      fontSize="sm"
    >
      <Text><strong>Namn:</strong> {row.namn}</Text>
      <Text><strong>Telefon:</strong> {row.telefon}</Text>

    {/* ANORDNING */}
    <Flex align="center" gap={2} mb={2}>
      <Text fontWeight="semibold" whiteSpace="nowrap">Anordning:</Text>
      <Flex wrap="nowrap" overflowX="auto" gap={1}>
        {(Array.isArray(row.anordning)
          ? row.anordning
          : typeof row.anordning === 'string'
            ? row.anordning.split(',').map((a) => a.trim())
            : []
        ).map((item, idx) => {
          let color = 'gray';
          switch (item) {
            case 'A-S': color = 'blue'; break;
            case 'L-S': color = 'green'; break;
            case 'S-S': color = 'orange'; break;
            case 'E-S': color = 'red'; break;
            case 'SPF':
            case 'Spf': color = 'yellow'; break;
            case 'VXL':
            case 'Vxl': color = 'purple'; break;
            case 'TVN':
            case 'Tvn': color = 'cyan'; break;
            default: color = 'gray';
          }

          return (
            <Badge
              key={idx}
              colorScheme={color}
              variant="subtle"
              fontSize="xs"
              px={2}
              py={0.5}
              borderRadius="none"
              textTransform="none"
              whiteSpace="nowrap"
            >
              {formatAnordningLabel(item)}
            </Badge>
          );
        })}
      </Flex>
    </Flex>

    {/* BTKN */}
    <Flex align="center" gap={2} mb={2}>
      <Text fontWeight="semibold" whiteSpace="nowrap">Beteckning:</Text>
      <Tag
        size="md"
        variant="outline"
        colorScheme="teal"
        w="80px"
        justifyContent="center"
        borderRadius="md"
      >
        <TagLabel isTruncated>{row.btkn || '–'}</TagLabel>
      </Tag>
    </Flex>
	    <Text>
	      <strong>Start:</strong>{' '}
	      {row.startdatum && row.starttid ? (
        <>
          {formatDateOnly(row.startdatum)} kl. {row.starttid}
        </>
      ) : (
        <span style={{ color: 'gray' }}>Ej angivet</span>
      )}
    </Text>

    <Text>
      <strong>Avslutad:</strong>{' '}
      {row.avslutatDatum ? (
        <>
          {formatDateOnly(row.avslutatDatum)} kl. {row.avslutat}
        </>
      ) : (
        <span style={{ color: 'gray' }}>Ej angivet</span>
      )}
    </Text>

    {row.avslutadAv && (
      <Text>
        <strong>Avslutad av:</strong> {row.avslutadAv}
      </Text>
    )}

      <Button
        mt={3}
        size="sm"
        onClick={() => {
          const updatedRows = [...rows];
          const actualIndex = rows.findIndex((r) => r.id === row.id);
          updatedRows[actualIndex].avslutadRad = false;
          setRows(updatedRows);
        }}
      >
        Återställ
      </Button>
    </Box>
          ))}

	          {archivedRowsForActivePlan.filter(
	            (row) =>
	              (row.namn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
	              (row.telefon || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
	              (row.anordning?.join(', ') || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
	              (row.btkn || '').toLowerCase().includes(searchQuery.toLowerCase())
	          ).length === 0 && (
	            <Text color="gray.500">Inga träffar.</Text>
	          )}
	        </SimpleGrid>
      </Stack>
    </ModalBody>
    <ModalFooter justifyContent="space-between">
      <Button onClick={() => setArchivedModalOpen(false)}>Stäng</Button>

      <Button
        colorScheme="blue"
        onClick={async () => {
          try {
            await sparaProjekt(); // Återanvänd befintlig sparfunktion
            setArchivedModalOpen(false); // Stäng modalen efter sparande
          } catch (error) {
            console.error('Kunde inte spara ändringar:', error);
            alert('Något gick fel vid sparandet.');
          }
        }}
      >
        Spara ändringar
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
    </Box>
    
  );
};



export default Plan;
