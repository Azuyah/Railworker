import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { Tooltip } from '@chakra-ui/react';
import { GiRailway } from 'react-icons/gi';
import { DeleteIcon } from '@chakra-ui/icons';
import { PiTrainLight } from 'react-icons/pi'
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
  const [headerSelection, setHeaderSelection] = useState(null);
  const [headerEditKey, setHeaderEditKey] = useState(null);
  const [selectedHeaderCell, setSelectedHeaderCell] = useState(null);
  const [selectedBodyCell, setSelectedBodyCell] = useState(null);
  const [editingBodyCell, setEditingBodyCell] = useState(null);
  const [bodyContextMenu, setBodyContextMenu] = useState({ open: false, x: 0, y: 0 });
  const bodyContextRef = useRef(null);
  const [begardDefaultTime, setBegardDefaultTime] = useState('');
  const [begardDefaultDate, setBegardDefaultDate] = useState('');
  const [activeRowId, setActiveRowId] = useState(null);
  const [hotkeysOpen, setHotkeysOpen] = useState(false);
  const [btknPrefix, setBtknPrefix] = useState('');
  const [columnWidths, setColumnWidths] = useState({
    btkn: 90,
    namn: 180,
    telefon: 150,
    anordning: 180,
    starttid: 110,
    begard: 110,
    avslutat: 110,
  });
  const [resizingColumn, setResizingColumn] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState({
    '#': false,
    btkn: true,
    namn: true,
    telefon: true,
    anordning: true,
    starttid: true,
    begard: true,
    avslutat: true,
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedAreas, setSelectedAreas] = useState([]);
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
  const [avslutningstid, setAvslutningstid] = useState(project?.avslutningstid || '');
  const [avslutningssignatur, setAvslutningssignatur] = useState(project?.avslutningssignatur || '');
  const [editSections, setEditSections] = useState(project?.sections || []);

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

const calculateSamrad = useCallback((rows) => {
  const newSamradList = [];
  const newAvklarad = {};

  const exclusionSet = ['A-S', 'L-S', 'S-S', 'E-S'];
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

  rows.forEach((row, i) => {
    if (row.avslutadRad) return;
    if (isRowExpired(row)) return;

    const rowAreas = row.selections || [];
    const rowAnordningar = String(row.anordning || '').split(',').map(a => a.trim());

    for (let j = 0; j < i; j++) {
      const compareRow = rows[j];
      if (compareRow.avslutadRad) continue;
      if (isRowExpired(compareRow)) continue;

      const compareAreas = compareRow.selections || [];
      const compareAnordningar = String(compareRow.anordning || '').split(',').map(a => a.trim());

      const sharedAreas = rowAreas.some((selected, index) => selected && compareAreas[index]);

      if (sharedAreas) {
        const allExcludedA = rowAnordningar.every(an => exclusionSet.includes(an));
        const allExcludedB = compareAnordningar.every(an => exclusionSet.includes(an));
        if (allExcludedA && allExcludedB) continue;

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
}, []);

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

const toggleSectionHeaderType = (index) => {
  setSectionHeaderNotes((prev) => {
    const next = [...prev];
    const current = (next[index] || '').toLowerCase();
    next[index] = current === 'linje' ? 'DP' : 'Linje';
    return next;
  });
};

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

const addSectionQuick = async (type = 'Linje') => {
  if (!project) return;
  const newSections = buildSectionsWithInsert(project.sections, type);
  const updatedRows = (rows || []).map((row) => ({
    ...row,
    selections: Array.isArray(row.selections) ? [...row.selections, false] : Array(newSections.length).fill(false),
    selectedAreas: Array.isArray(row.selectedAreas) ? [...row.selectedAreas] : [],
  }));

  const updatedProject = {
    ...project,
    sections: newSections,
    rows: updatedRows,
  };

  try {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    await axios.put(
      `https://railworker-production.up.railway.app/api/projects/${project.id}`,
      updatedProject,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setProject(updatedProject);
    setRows(updatedRows);
    setEditSections(newSections);
    setSectionHeaderNotes((prev) => {
      const next = [...prev];
      next[newSections.length - 1] = type === 'DP' ? 'DP' : 'Linje';
      return next;
    });
    setSectionHeaderNotes2((prev) => {
      const next = [...prev];
      if (next.length < newSections.length) next.length = newSections.length;
      return next.map((value) => value || '');
    });
    setSectionHeaderNotes3((prev) => {
      const next = [...prev];
      if (next.length < newSections.length) next.length = newSections.length;
      return next.map((value) => value || '');
    });
  } catch (error) {
    console.error('Kunde inte lägga till delområde:', error);
    toast({
      title: 'Fel',
      description: 'Kunde inte lägga till delområde.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
};

const fetchProject = useCallback(async () => {
  try {
    setLoading(true);

    const tokenData = localStorage.getItem('user');
    const token = tokenData ? JSON.parse(tokenData).token : null;

    const response = await axios.get(`https://railworker-production.up.railway.app/api/project/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const current = response.data;
    setProject({
      ...current,
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
    setUttagningstid(current.uttagningstid || '');
    setAvslutningstid(current.avslutningstid || '');
    setAvslutningssignatur(current.avslutningssignatur || '');

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
      `https://railworker-production.up.railway.app/api/row/approve/${rowId}`,
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
  setProjektNamn(project.name);
  setPlats(project.plats);
  setStartDate(project.startDate);
  setStartTime(project.startTime);
  setEndDate(project.endDate);
  setEndTime(project.endTime);
    setNamn(project.namn);
    setTelefonnummer(project.telefonnummer);
    setAvstamt(Boolean(project.avstamt));
    setObjekt(project.objekt || '');
    setAvslutaSkyddTid(project.avslutaSkyddTid || '');
    setUttagningstid(project.uttagningstid || '');
    setSignatur(project.signatur || '');
    setAvslutningstid(project.avslutningstid || '');
    setAvslutningssignatur(project.avslutningssignatur || '');
  setEditSections(project.sections || []);
  setEditModalOpen(true);
  setEditBeteckningar(project.beteckningar?.map(b => b.label) || []);
};

const updateProject = async () => {
  const updated = {
    name: projektNamn,
    plats,
    startDate,
    startTime,
    endDate,
    endTime,
    namn,
    telefonnummer,
    sections: editSections,
    rows,
    beteckningar: editBeteckningar.map(b => ({ label: b })),
    avstamt,
    objekt,
    avslutaSkyddTid,
    uttagningstid,
    signatur,
    avslutningstid,
    avslutningssignatur,
  };

  const token = JSON.parse(localStorage.getItem('user'))?.token;
  if (!token) return alert('Ingen token.');

  try {
    await axios.put(
      `https://railworker-production.up.railway.app/api/projects/${id}`,
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
    });

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
      rows: rowsWithSamrad,
      sectionHeaderNotes,
      sectionHeaderNotes2,
      sectionHeaderNotes3,
      headerNotesTop,
      headerNotesMid,
      headerMerges,
      avstamt,
      objekt,
      avslutaSkyddTid,
      uttagningstid,
      signatur,
      avslutningstid,
      avslutningssignatur,
    };

    rowsWithSamrad.forEach(() => {});

// ✅ Skicka till backend
await axios.put(
  `https://railworker-production.up.railway.app/api/projects/${project.id}`,
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
  avslutningstid,
  avslutningssignatur,
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
}, [project, rows]);

useEffect(() => {
  if (selectedRow?.id) {
    setSelectedRow((prev) => ({
      ...prev,
      selectedAreas: [...selectedAreas],
    }));
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

  const result = calculateSamrad(tempRows);

  const relatedSamrad = result.samradList
    .filter((entry) => entry.from === realIndex)
    .map((entry) => {
      const r = tempRows[entry.to];
      return {
        id: r.id,
        namn: r.namn,
        dp: r.dp,
        linje: r.linje,
        btkn: r.btkn,
        bt: r.bt,
      };
    });

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
}, [rows, selectedAreas, selectedRow, project?.sections, calculateSamrad]);

useEffect(() => {
  if (selectedRowId == null) return;

  const matchingRow = rows.find((r) => r.id === selectedRowId);
  if (matchingRow) {
    setSelectedRow((prev) => ({
      ...prev,
      samrad: matchingRow.samrad || [],
    }));
  }
}, [rows, selectedRowId]);

useEffect(() => {
  if (!rows || !project?.sections) return;

  const result = calculateSamrad(rows); // ✅ Använd rows, inte project.rows

  const updated = rows.map((row, index) => {
    const related = result.samradList
      .filter((entry) => entry.from === index)
      .map((entry) => {
        const match = rows[entry.to];
        return {
          id: match?.id,
          namn: match?.namn || 'Okänt namn',
          dp: match?.dp || '',
          linje: match?.linje || '',
        };
      });

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
}, [project, rows, calculateSamrad]);

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

  setSelectedRow(match);
}, [selectedRowId, rows]);

const createNewRow = (rows, project) => {
  const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
  return {
    id: nextId,
    btkn: '',
    namn: '',
    telefon: '',
    anordning: '',
    bt: '',
    linje: '',
    starttid: '',
    begard: '',
    avslutat: '',
    avslutadRad: false,
    anteckning: '',
    selections: project.sections.map(() => false),
    selectedAreas: [],
    cellMeta: {},
  };
};

const addRow = () => {
  const getNextBtkn = (prefix) => {
    if (!prefix) return '';
    const safePrefix = prefix.trim();
    const regex = new RegExp(`^${safePrefix}(\\d+)$`);
    let max = 0;
    rows.forEach((row) => {
      const match = String(row.btkn || '').match(regex);
      if (match && match[1]) {
        max = Math.max(max, parseInt(match[1], 10));
      }
    });
    const next = String(max + 1).padStart(2, '0');
    return `${safePrefix}${next}`;
  };

  const newRow = {
    ...createNewRow(rows, project),
    id: Date.now(),
    dp: '',
    linje: '',
    btkn: btknPrefix ? getNextBtkn(btknPrefix) : '',
  };

  const sameDP = newRow.dp;
  const sameLinje = newRow.linje;
  const isRelevant = ['Spf', 'Vxl'].includes(
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

const updateRowField = useCallback((rowId, field, value) => {
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

const formatAnordningLabel = (item) => {
  if (!item) return '';
  const upper = item.toUpperCase();
  return upper === 'SPF' ? 'SPF' : upper === 'VXL' ? 'VXL' : item;
};

const toggleColumn = (col) => {
  setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
};

const beginColumnResize = (key, event) => {
  event.preventDefault();
  event.stopPropagation();
  setResizingColumn({
    key,
    startX: event.clientX,
    startWidth: columnWidths[key] || 120,
  });
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

const autoGrowTextarea = (event) => {
  const el = event.currentTarget;
  el.style.height = '0px';
  el.style.height = `${el.scrollHeight}px`;
};

const HeaderNoteInput = ({ value, onChange, isEditing, onRequestEdit, onSelect }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <Box
      position="relative"
      w="100%"
      h="100%"
      cursor={isEditing ? 'text' : 'pointer'}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onRequestEdit?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      <Textarea
        ref={inputRef}
        size="xs"
        variant="unstyled"
        value={value}
        onChange={onChange}
        isReadOnly={!isEditing}
        pointerEvents={isEditing ? 'auto' : 'none'}
        onBlur={() => {
          if (isEditing) onRequestEdit?.(null);
        }}
        onInput={autoGrowTextarea}
        resize="none"
        overflow="hidden"
        rows={1}
        w="100%"
        minH="24px"
        px={2}
        py={1}
        lineHeight="1.2"
        bg="transparent"
        cursor={isEditing ? 'text' : 'pointer'}
        caretColor={isEditing ? 'auto' : 'transparent'}
      />
    </Box>
  );
};

const getHeaderCellValue = useCallback((rowIdx, colKey) => {
  if (colKey.startsWith('section-')) {
    const idx = Number(colKey.split('-')[1]);
    return rowIdx === 0 ? sectionHeaderNotes3[idx] || '' : sectionHeaderNotes2[idx] || '';
  }
  if (rowIdx === 0) return headerNotesTop[colKey] || '';
  return headerNotesMid[colKey] || '';
}, [headerNotesMid, headerNotesTop, sectionHeaderNotes2, sectionHeaderNotes3]);

const setHeaderCellValue = (rowIdx, colKey, value) => {
  if (colKey.startsWith('section-')) {
    const idx = Number(colKey.split('-')[1]);
    if (rowIdx === 0) {
      setSectionHeaderNotes3((prev) => {
        const next = [...prev];
        next[idx] = value;
        return next;
      });
    } else {
      setSectionHeaderNotes2((prev) => {
        const next = [...prev];
        next[idx] = value;
        return next;
      });
    }
    return;
  }
  if (rowIdx === 0) {
    setHeaderNotesTop((prev) => ({ ...prev, [colKey]: value }));
  } else {
    setHeaderNotesMid((prev) => ({ ...prev, [colKey]: value }));
  }
};

const getHeaderColBg = (colKey) => {
  if (colKey.startsWith('section-')) {
    const idx = Number(colKey.split('-')[1]);
    const sectionPalette = ['blue.50', 'teal.50', 'purple.50', 'orange.50', 'green.50', 'pink.50'];
    return sectionPalette[idx % sectionPalette.length];
  }
  if (colKey === 'btkn' || colKey === 'namn') return 'purple.50';
  if (colKey === 'telefon' || colKey === 'anordning') return 'teal.50';
  if (colKey === 'starttid' || colKey === 'begard' || colKey === 'avslutat') return 'blue.50';
  return 'white';
};

const updateMergeText = (id, value) => {
  setHeaderMerges((prev) =>
    prev.map((merge) => (merge.id === id ? { ...merge, text: value } : merge))
  );
};

const renderMergedCellContent = (merge) => {
  return (
    <HeaderNoteInput
      value={merge.text || ''}
      onChange={(e) => updateMergeText(merge.id, e.target.value)}
      isEditing={headerEditKey === `merge:${merge.id}`}
      onRequestEdit={(val) => setHeaderEditKey(val === null ? null : `merge:${merge.id}`)}
      onSelect={() => setSelectedHeaderCell({ row: merge.rowStart, colKey: merge.colStartKey })}
    />
  );
};

const renderHeaderCellContent = (rowIdx, colKey) => {
  if (rowIdx === 0 && colKey === 'begard') {
    return (
      <HStack spacing={2} px={2} py={1}>
        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
          Avsluta senast
        </Text>
        <Input
          size="xs"
          type="time"
          value={avslutaSkyddTid}
          onChange={(e) => setAvslutaSkyddTid(e.target.value)}
          width="90px"
        />
      </HStack>
    );
  }
  return (
    <HeaderNoteInput
      value={getHeaderCellValue(rowIdx, colKey)}
      onChange={(e) => setHeaderCellValue(rowIdx, colKey, e.target.value)}
      isEditing={headerEditKey === `${rowIdx}:${colKey}`}
      onRequestEdit={(val) => setHeaderEditKey(val === null ? null : `${rowIdx}:${colKey}`)}
      onSelect={() => setSelectedHeaderCell({ row: rowIdx, colKey })}
    />
  );
};

const isBodyCellEditing = (rowId, key) =>
  editingBodyCell && editingBodyCell.rowId === rowId && editingBodyCell.key === key;

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
  // 🔁 Skapa en temporärt uppdaterad lista där aktuell rad speglar vad som syns i modalen
const tempRows = rows.map((r) =>
  r.id === row.id
    ? {
        ...r,
        selectedAreas: selectedAreas,
        anordning: Array.isArray(row.anordning) ? row.anordning : [],
      }
    : r
);

const result = calculateSamrad(tempRows);

  // ✅ Identifiera korrekt index baserat på ID
  const fromIndex = rows.findIndex(r => r.id === row.id);

  const matched = result.samradList
    .filter((entry) => entry.from === fromIndex)
    .map((entry) => {
      const match = rows[entry.to];
      return {
        id: match?.id,
        namn: match?.namn && match.namn.trim() !== '' ? match.namn : 'Okänt namn',
      };
    });


  setSelectedRow({
    ...row,
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

  const updatedRows = rows.map((r) =>
    r.id === selectedRowId ? { ...r, [field]: value } : r
  );

  setRows(updatedRows);
  setSelectedRow((prev) => ({ ...prev, [field]: value }));
};

const filteredRows = rows
  .filter((row) =>
    filterValue === 'all' || (row.namn || '').toLowerCase() === filterValue.toLowerCase()
  )
  .filter((row) =>
    (row.namn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.telefon || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
const visibleSectionIndexes = useMemo(() => {
  if (!project?.sections?.length) return [];
  return project.sections
    .map((_, index) => {
      const hasSelection = rows.some((row) => row.selections?.[index]);
      const hasHeaderText = Boolean(
        sectionHeaderNotes?.[index]?.trim() ||
        sectionHeaderNotes2?.[index]?.trim() ||
        sectionHeaderNotes3?.[index]?.trim()
      );
      return hasSelection || hasHeaderText ? index : null;
    })
    .filter((index) => index !== null);
}, [project?.sections, rows, sectionHeaderNotes, sectionHeaderNotes2, sectionHeaderNotes3]);

const headerColumns = useMemo(() => {
  const cols = [];
  if (visibleColumns['#']) cols.push({ key: '#', label: '#' });
  if (visibleColumns.btkn) cols.push({ key: 'btkn', label: 'BTKN' });
  if (visibleColumns.namn) cols.push({ key: 'namn', label: 'Namn' });
  if (visibleColumns.telefon) cols.push({ key: 'telefon', label: 'Telefon' });
  if (visibleColumns.anordning) cols.push({ key: 'anordning', label: 'Anordning' });
  visibleSectionIndexes.forEach((idx) => cols.push({ key: `section-${idx}`, label: `section-${idx}` }));
  if (visibleColumns.starttid) cols.push({ key: 'starttid', label: 'Start' });
  if (visibleColumns.begard) cols.push({ key: 'begard', label: 'Begärd' });
  if (visibleColumns.avslutat) cols.push({ key: 'avslutat', label: 'Avslutad' });
  cols.push({ key: 'actions', label: 'Åtgärder' });
  return cols;
}, [visibleColumns, visibleSectionIndexes]);

const headerColumnIndex = useMemo(() => {
  const map = {};
  headerColumns.forEach((col, idx) => {
    map[col.key] = idx;
  });
  return map;
}, [headerColumns]);

const getMergeIndices = useCallback((merge) => {
  const startIdx = headerColumnIndex[merge.colStartKey];
  const endIdx = headerColumnIndex[merge.colEndKey];
  if (startIdx === undefined || endIdx === undefined) return null;
  return {
    colStart: Math.min(startIdx, endIdx),
    colEnd: Math.max(startIdx, endIdx),
  };
}, [headerColumnIndex]);

const getMergeForCell = (rowIdx, colIdx) => {
  for (const merge of headerMerges) {
    const indices = getMergeIndices(merge);
    if (!indices) continue;
    if (
      rowIdx >= merge.rowStart &&
      rowIdx <= merge.rowEnd &&
      colIdx >= indices.colStart &&
      colIdx <= indices.colEnd
    ) {
      return { merge, indices };
    }
  }
  return null;
};

const isCellSelected = (rowIdx, colIdx) => {
  if (!headerSelection?.active) return false;
  const rowStart = Math.min(headerSelection.start.row, headerSelection.end.row);
  const rowEnd = Math.max(headerSelection.start.row, headerSelection.end.row);
  const colStart = Math.min(headerSelection.start.col, headerSelection.end.col);
  const colEnd = Math.max(headerSelection.start.col, headerSelection.end.col);
  return rowIdx >= rowStart && rowIdx <= rowEnd && colIdx >= colStart && colIdx <= colEnd;
};

const beginHeaderSelection = (rowIdx, colIdx, event) => {
  if (event.button !== 0) return;
  if (event.detail > 1) return;
  if (event.target.closest('input, textarea, button')) return;
  if (headerEditKey) return;
  setHeaderSelection({
    active: true,
    start: { row: rowIdx, col: colIdx },
    end: { row: rowIdx, col: colIdx },
  });
};

const updateHeaderSelection = (rowIdx, colIdx) => {
  if (!headerSelection?.active) return;
  if (headerEditKey) return;
  setHeaderSelection((prev) => ({
    ...prev,
    end: { row: rowIdx, col: colIdx },
  }));
};

const finalizeHeaderSelection = useCallback(() => {
  if (!headerSelection?.active) return;
  const rowStart = Math.min(headerSelection.start.row, headerSelection.end.row);
  const rowEnd = Math.max(headerSelection.start.row, headerSelection.end.row);
  const colStart = Math.min(headerSelection.start.col, headerSelection.end.col);
  const colEnd = Math.max(headerSelection.start.col, headerSelection.end.col);
  if (rowStart === rowEnd && colStart === colEnd) {
    setHeaderSelection(null);
    return;
  }

  const colStartKey = headerColumns[colStart]?.key;
  const colEndKey = headerColumns[colEnd]?.key;
  if (!colStartKey || !colEndKey) {
    setHeaderSelection(null);
    return;
  }

  const newMerge = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    rowStart,
    rowEnd,
    colStartKey,
    colEndKey,
    type: 'text',
    text: getHeaderCellValue(rowStart, colStartKey) || '',
  };

  setHeaderMerges((prev) => {
    const filtered = prev.filter((merge) => {
      const indices = getMergeIndices(merge);
      if (!indices) return true;
      const overlaps =
        rowStart <= merge.rowEnd &&
        rowEnd >= merge.rowStart &&
        colStart <= indices.colEnd &&
        colEnd >= indices.colStart;
      return !overlaps;
    });
    return [...filtered, newMerge];
  });

  setHeaderSelection(null);
}, [getHeaderCellValue, getMergeIndices, headerColumns, headerSelection]);

useEffect(() => {
  if (!headerSelection?.active) return;
  const handleMouseUp = () => finalizeHeaderSelection();
  window.addEventListener('mouseup', handleMouseUp);
  return () => window.removeEventListener('mouseup', handleMouseUp);
}, [headerSelection, finalizeHeaderSelection]);

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
  bg="#F5F6F8"
  py={6}
  px={[2, 4]}
>
  <Box position="fixed" inset={0} bg="#F5F6F8" zIndex={0} />
  <Box position="relative" zIndex={1}>
      <Header />
      <Box maxW="1800px" mx="auto" mt={2} pt="52px">

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
    <Text><strong>Startdatum:</strong> {project.startDate} {project.startTime}</Text>
    <Text><strong>Slutdatum:</strong> {project.endDate} {project.endTime}</Text>
    <Text><strong>FJTKL:</strong> {project.namn} ({project.telefonnummer})</Text>
<Text>
  <strong>Beteckningar:</strong>{' '}
  {project.beteckningar.map((b) => b.label).join(', ')}
</Text>
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
              await axios.delete(`https://railworker-production.up.railway.app/api/project/${id}`, {
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

<Box
  bg="white"
  border="1px solid #CBD5E0"
  borderRadius="md"
  px={3}
  py={2}
  boxShadow="none"
  mb={2}
>
  <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
    <Box>
      <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
        Projekt
      </Text>
      <Text fontSize="lg" fontWeight="800" color="gray.900">
        {project.name}
      </Text>
      <Text fontSize="sm" color="gray.600">
        {project.plats}
      </Text>
    </Box>

    <HStack spacing={2} wrap="wrap">
      <Button onClick={() => setIsProjectInfoOpen(true)} variant="outline" borderRadius="full" size="sm">
        Visa projekt
      </Button>
      <Button onClick={() => sparaProjekt()} bg="gray.900" color="white" borderRadius="full" _hover={{ bg: 'gray.800' }} size="sm">
        Spara
      </Button>
      <Button variant="outline" borderRadius="full" onClick={() => addRow()} size="sm">
        + Lägg till rad
      </Button>
      <Button
        variant="outline"
        borderRadius="full"
        size="sm"
        onClick={() => addSectionQuick('Linje')}
      >
        + Lägg till delområde
      </Button>
      <Button variant="outline" borderRadius="full" onClick={() => setAnteckningarModalOpen(true)} size="sm">
        Anteckningar
      </Button>
      <Button variant="outline" borderRadius="full" onClick={() => setArchivedModalOpen(true)} size="sm">
        Avslutade
      </Button>
    </HStack>

    <HStack spacing={2} wrap="wrap">
      <Menu closeOnSelect={false}>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="outline" borderRadius="full" size="sm">
          Kolumner
        </MenuButton>
        <MenuList borderRadius="md" shadow="lg">
          {Object.keys(visibleColumns).map((col) => (
            <MenuItem key={col}>
              <Checkbox isChecked={visibleColumns[col]} onChange={() => toggleColumn(col)}>
                {col.charAt(0).toUpperCase() + col.slice(1)}
              </Checkbox>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Input
        placeholder="Sök namn eller telefon..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        width="220px"
        bg="gray.50"
        borderRadius="full"
        px={4}
        py={2}
        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
      />

      <HStack spacing={2} bg="white" border="1px solid #E2E8F0" borderRadius="full" px={3} py={1}>
        <Input
          size="xs"
          type="date"
          variant="flushed"
          value={begardDefaultDate}
          onChange={(e) => setBegardDefaultDate(e.target.value)}
          width="100px"
        />
        <Input
          size="xs"
          type="time"
          variant="flushed"
          placeholder="Tid"
          value={begardDefaultTime}
          onChange={(e) => setBegardDefaultTime(e.target.value)}
          width="60px"
        />
      </HStack>

      <Button variant="outline" borderRadius="full" onClick={() => setHotkeysOpen(true)} size="sm">
        Kortkommandon
      </Button>
    </HStack>
  </Flex>

  <Divider my={2} />

  <HStack spacing={3} wrap="wrap">
    <HStack spacing={2}>
      <Text fontSize="xs" color="gray.500">Avstämt</Text>
      <Checkbox isChecked={avstamt} onChange={(e) => setAvstamt(e.target.checked)} />
    </HStack>

    <HStack spacing={2}>
      <Text fontSize="xs" color="gray.500">FJTKL</Text>
      <Input
        size="xs"
        placeholder="Namn"
        value={namn}
        onChange={(e) => setNamn(e.target.value)}
        width="140px"
      />
      <Input
        size="xs"
        placeholder="Telefon"
        value={telefonnummer}
        onChange={(e) => setTelefonnummer(e.target.value)}
        width="120px"
      />
    </HStack>

    <HStack spacing={2}>
      <Text fontSize="xs" color="gray.500">Objekt</Text>
      <Input
        size="xs"
        placeholder="Objekt"
        value={objekt}
        onChange={(e) => setObjekt(e.target.value)}
        width="140px"
      />
    </HStack>

    <HStack spacing={2}>
      <Text fontSize="xs" color="gray.500">Uttagningstid</Text>
      <Input
        size="xs"
        type="time"
        placeholder="Tid"
        value={uttagningstid}
        onChange={(e) => setUttagningstid(e.target.value)}
        width="90px"
      />
    </HStack>

    <HStack spacing={2}>
      <Text fontSize="xs" color="gray.500">Signatur</Text>
      <Input
        size="xs"
        placeholder="Signatur"
        value={signatur}
        onChange={(e) => setSignatur(e.target.value)}
        width="120px"
      />
    </HStack>

    <HStack spacing={2}>
      <Text fontSize="xs" color="gray.500">Avslutningstid</Text>
      <Input
        size="xs"
        type="time"
        placeholder="Tid"
        value={avslutningstid}
        onChange={(e) => setAvslutningstid(e.target.value)}
        width="90px"
      />
    </HStack>

    <HStack spacing={2}>
      <Text fontSize="xs" color="gray.500">Avslutningssignatur</Text>
      <Input
        size="xs"
        placeholder="Signatur"
        value={avslutningssignatur}
        onChange={(e) => setAvslutningssignatur(e.target.value)}
        width="140px"
      />
    </HStack>
  </HStack>
</Box>

  <Box overflowX="visible">
      <Flex gap={2} align="start" minW="fit-content" w="full">
    <TableContainer
      bg="white"
      p={0}
      borderRadius="md"
      boxShadow="none"
      border="1px solid #C9D4E1"
      overflow="auto"
      w="full" 
      minW="100%" 
      transform={`scale(${zoomLevel})`}
      transformOrigin="top left"
    >
      <Table
        variant="simple"
        size="sm"
        sx={{
          'th, td': {
            border: '1px solid #C9D4E1',
            paddingX: '8px',
            paddingY: '6px',
            fontSize: '12px',
            fontWeight: '800',
            overflow: 'visible',
            position: 'relative',
          },
          thead: {
            background: '#F2F6FF',
          },
          'tbody tr:nth-of-type(even)': {
            backgroundColor: '#F7FBFF',
          },
          'tbody tr:hover': {
            backgroundColor: '#E8F7FF !important',
          },
          'tbody input': {
            height: '20px',
            fontSize: '12px',
          },
          'input': {
            border: 'none',
            boxShadow: 'none',
          },
        }}
      >
        <Thead bg="#EEF2F7">
          {[0, 1].map((rowIdx) => (
            <Tr key={`header-notes-${rowIdx}`}>
              {headerColumns.map((col, colIdx) => {
                if (
                  rowIdx === 0 &&
                  col.key === 'avslutat' &&
                  visibleColumns.begard &&
                  visibleColumns.avslutat
                ) {
                  return null;
                }

                const mergeInfo = getMergeForCell(rowIdx, colIdx);
                if (mergeInfo) {
                  const isTopLeft =
                    rowIdx === mergeInfo.merge.rowStart && colIdx === mergeInfo.indices.colStart;
                  if (!isTopLeft) return null;
                  const colSpan = mergeInfo.indices.colEnd - mergeInfo.indices.colStart + 1;
                  const rowSpan = mergeInfo.merge.rowEnd - mergeInfo.merge.rowStart + 1;
                  const selected =
                    isCellSelected(rowIdx, colIdx) ||
                    (selectedHeaderCell &&
                      selectedHeaderCell.row === rowIdx &&
                      selectedHeaderCell.colKey === col.key);
                  return (
                    <Th
                      key={`merge-${mergeInfo.merge.id}`}
                      colSpan={colSpan}
                      rowSpan={rowSpan}
                      p={0}
                      bg={selected ? 'blue.100' : getHeaderColBg(col.key)}
                      verticalAlign="top"
                      onMouseDown={(e) => beginHeaderSelection(rowIdx, colIdx, e)}
                      onMouseEnter={() => updateHeaderSelection(rowIdx, colIdx)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setHeaderEditKey(`merge:${mergeInfo.merge.id}`);
                      }}
                    >
                      {renderMergedCellContent(mergeInfo.merge)}
                    </Th>
                  );
                }

                const selected =
                  isCellSelected(rowIdx, colIdx) ||
                  (selectedHeaderCell &&
                    selectedHeaderCell.row === rowIdx &&
                    selectedHeaderCell.colKey === col.key);

                if (
                  rowIdx === 0 &&
                  col.key === 'begard' &&
                  visibleColumns.avslutat
                ) {
                  return (
                    <Th
                      key={`${rowIdx}-${col.key}-span`}
                      colSpan={2}
                      p={0}
                      bg={selected ? 'blue.100' : getHeaderColBg(col.key)}
                      verticalAlign="top"
                      onMouseDown={(e) => beginHeaderSelection(rowIdx, colIdx, e)}
                      onMouseEnter={() => updateHeaderSelection(rowIdx, colIdx)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setHeaderEditKey(`${rowIdx}:${col.key}`);
                      }}
                    >
                      {renderHeaderCellContent(rowIdx, col.key)}
                    </Th>
                  );
                }
                return (
                  <Th
                    key={`${rowIdx}-${col.key}`}
                    p={0}
                    bg={selected ? 'blue.100' : getHeaderColBg(col.key)}
                    verticalAlign="top"
                    onMouseDown={(e) => beginHeaderSelection(rowIdx, colIdx, e)}
                    onMouseEnter={() => updateHeaderSelection(rowIdx, colIdx)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setHeaderEditKey(`${rowIdx}:${col.key}`);
                    }}
                  >
                    {renderHeaderCellContent(rowIdx, col.key)}
                  </Th>
                );
              })}
            </Tr>
          ))}
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
            {visibleSectionIndexes.map((secIdx) => (
              <Th key={`note1-${secIdx}`} p={1} bg={secIdx % 2 === 0 ? 'blue.50' : 'transparent'}>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => toggleSectionHeaderType(secIdx)}
                >
                  {sectionHeaderNotes[secIdx] || 'Linje'}
                </Button>
              </Th>
            ))}
            {visibleColumns.starttid && <Th />}
            {visibleColumns.begard && <Th />}
            {visibleColumns.avslutat && <Th />}
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
      <Th py={2} fontWeight="semibold" color="gray.700" width={`${columnWidths.btkn}px`}>
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" gap={2}>
            <FiHash size={14} />
            BTKN
          </Flex>
          <Box
            onMouseDown={(e) => beginColumnResize('btkn', e)}
            cursor="col-resize"
            w="2px"
            h="14px"
            borderRadius="full"
            bg="gray.500"
            _hover={{ bg: 'gray.700' }}
          />
        </Flex>
      </Th>
    )}
    {visibleColumns.namn && (
      <Th py={2} fontWeight="semibold" color="gray.700" width={`${columnWidths.namn}px`}>
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" gap={2}>
            <FiUser size={14} />
            Namn
          </Flex>
          <Box
            onMouseDown={(e) => beginColumnResize('namn', e)}
            cursor="col-resize"
            w="2px"
            h="14px"
            borderRadius="full"
            bg="gray.500"
            _hover={{ bg: 'gray.700' }}
          />
        </Flex>
      </Th>
    )}
    {visibleColumns.telefon && (
      <Th py={2} fontWeight="semibold" color="gray.700" width={`${columnWidths.telefon}px`}>
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" gap={2}>
            <FiPhone size={14} />
            Telefon
          </Flex>
          <Box
            onMouseDown={(e) => beginColumnResize('telefon', e)}
            cursor="col-resize"
            w="2px"
            h="14px"
            borderRadius="full"
            bg="gray.500"
            _hover={{ bg: 'gray.700' }}
          />
        </Flex>
      </Th>
    )}
    {visibleColumns.anordning && (
      <Th py={2} fontWeight="semibold" color="gray.700" width={`${columnWidths.anordning}px`}>
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" gap={2}>
            <FiAperture size={14} />
            Anordning
          </Flex>
          <Box
            onMouseDown={(e) => beginColumnResize('anordning', e)}
            cursor="col-resize"
            w="2px"
            h="14px"
            borderRadius="full"
            bg="gray.500"
            _hover={{ bg: 'gray.700' }}
          />
        </Flex>
      </Th>
    )}

{visibleSectionIndexes.map((idx) => {
  const sec = project.sections[idx];
  return (
<Th
  key={idx}
  w="40px"
  h="40px"
  p="0"
  m="0"
  bg={idx % 2 === 0 ? 'blue.50' : 'transparent'}
  position="relative"
  textAlign="center"
>
  <Tooltip
    hasArrow
    placement="top"
    bg="white"
    color="black"
    border="1px solid #ccc"
    borderRadius="md"
    shadow="md"
    p={3}
    label={
      <Box p={2} maxW="300px">
        <Text fontWeight="bold" mb={1}>Signal:</Text>
        {sec.name ? (
          <Text fontSize="sm">{sec.name}</Text>
        ) : (
          <Text fontSize="sm" color="gray.500">Ej angivet</Text>
        )}
      </Box>
    }
    aria-label="Signal tooltip"
  >
    <Box position="relative" w="100%" h="100%" cursor="help" overflow="hidden">
      {/* Bakgrundsikon */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={0}
        opacity={0.12}
      >
        <Icon
          as={sec.type === 'DP' ? PiTrainLight : GiRailway}
          boxSize="32px"
          color="gray.600"
        />
      </Box>

      {/* Bokstav */}
      <Flex
        align="center"
        justify="center"
        position="relative"
        zIndex={1}
        w="100%"
        h="100%"
      >
        <Text fontSize="xs" fontWeight="bold">
          {String.fromCharCode(65 + idx)}
        </Text>
      </Flex>
    </Box>
  </Tooltip>
</Th>
  );
})}
    {visibleColumns.starttid && (
      <Th py={2} fontWeight="semibold" color="gray.700" width={`${columnWidths.starttid}px`}>
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" gap={2}>
            Start
          </Flex>
          <Box
            onMouseDown={(e) => beginColumnResize('starttid', e)}
            cursor="col-resize"
            w="2px"
            h="14px"
            borderRadius="full"
            bg="gray.500"
            _hover={{ bg: 'gray.700' }}
          />
        </Flex>
      </Th>
    )}
    {visibleColumns.begard && (
      <Th py={2} fontWeight="semibold" color="gray.700" width={`${columnWidths.begard}px`}>
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" gap={2}>
            Begärd
          </Flex>
          <Box
            onMouseDown={(e) => beginColumnResize('begard', e)}
            cursor="col-resize"
            w="2px"
            h="14px"
            borderRadius="full"
            bg="gray.500"
            _hover={{ bg: 'gray.700' }}
          />
        </Flex>
      </Th>
    )}
    {visibleColumns.avslutat && (
      <Th py={2} fontWeight="semibold" color="gray.700" width={`${columnWidths.avslutat}px`}>
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" gap={2}>
            Avslutad
          </Flex>
          <Box
            onMouseDown={(e) => beginColumnResize('avslutat', e)}
            cursor="col-resize"
            w="2px"
            h="14px"
            borderRadius="full"
            bg="gray.500"
            _hover={{ bg: 'gray.700' }}
          />
        </Flex>
      </Th>
    )}
    <Th py={2} fontWeight="semibold" color="gray.700">
      <Flex align="center" gap={2}>
        <FiSliders size={14} />
        Åtgärder
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

                return (
                <Tr
                  key={row.id}
                  bg={activeRowId === row.id ? 'blue.50' : 'transparent'}
                  _hover={{ bg: 'blue.50' }}
                  cursor="default"
                  transition="background 0.2s ease"
                  onMouseEnter={() => setActiveRowId(row.id)}
                >
                  {visibleColumns['#'] && (
                    <Td width="40px" borderRight="1px solid rgba(0, 0, 0, 0.05)">
                      <Text color="gray.800" fontSize="sm" textAlign="center">
                        {rowIndex + 1}
                      </Text>
                    </Td>
                  )}
{visibleColumns.btkn && (
  <Td
    width={`${columnWidths.btkn}px`}
    borderRight="1px solid rgba(0, 0, 0, 0.1)"
    bg={
      selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'btkn'
        ? 'blue.100'
        : btknMeta?.color || 'transparent'
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
        isReadOnly={hotkeyMode || !isBodyCellEditing(row.id, 'btkn')}
        onFocus={() => setActiveRowId(row.id)}
        onBlur={() => setEditingBodyCell(null)}
        onDoubleClick={() => setEditingBodyCell({ rowId: row.id, key: 'btkn' })}
        cursor={isBodyCellEditing(row.id, 'btkn') ? 'text' : 'pointer'}
        caretColor={isBodyCellEditing(row.id, 'btkn') ? 'auto' : 'transparent'}
      />
    </Flex>
  </Td>
)}

{visibleColumns.namn && (
  <Td
    maxW={`${columnWidths.namn}px`}
    borderRight="1px solid rgba(0, 0, 0, 0.05)"
    bg={
      selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'namn'
        ? 'blue.100'
        : namnMeta?.color || 'transparent'
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
        isReadOnly={hotkeyMode || !isBodyCellEditing(row.id, 'namn')}
        onFocus={() => setActiveRowId(row.id)}
        onBlur={() => setEditingBodyCell(null)}
        onDoubleClick={() => setEditingBodyCell({ rowId: row.id, key: 'namn' })}
        cursor={isBodyCellEditing(row.id, 'namn') ? 'text' : 'pointer'}
        caretColor={isBodyCellEditing(row.id, 'namn') ? 'auto' : 'transparent'}
      />
    </Flex>
  </Td>
)}

{visibleColumns.telefon && (
  <Td
    maxW={`${columnWidths.telefon}px`}
    borderRight="1px solid rgba(0, 0, 0, 0.05)"
    bg={
      selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'telefon'
        ? 'blue.100'
        : telefonMeta?.color || 'transparent'
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
        isReadOnly={hotkeyMode || !isBodyCellEditing(row.id, 'telefon')}
        onFocus={() => setActiveRowId(row.id)}
        onBlur={() => setEditingBodyCell(null)}
        onDoubleClick={() => setEditingBodyCell({ rowId: row.id, key: 'telefon' })}
        cursor={isBodyCellEditing(row.id, 'telefon') ? 'text' : 'pointer'}
        caretColor={isBodyCellEditing(row.id, 'telefon') ? 'auto' : 'transparent'}
      />
    </Flex>
  </Td>
)}

{visibleColumns.anordning && (
  <Td
    maxW={`${columnWidths.anordning}px`}
    borderRight="1px solid rgba(0, 0, 0, 0.1)"
    bg={
      selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'anordning'
        ? 'blue.100'
        : anordningMeta?.color || 'transparent'
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
        rightIcon={<ChevronDownIcon />}
        bg="transparent"
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
        _focus={{ boxShadow: 'none' }}
        isDisabled={hotkeyMode}
        onClick={() => setActiveRowId(row.id)}
      >
        {Array.isArray(row.anordning) && row.anordning.length > 0 ? (
          <Flex gap={1} wrap="wrap">
            {row.anordning.map((item) => {
              let color = 'gray';
              switch (item) {
                case 'A-S': color = 'blue'; break;
                case 'L-S': color = 'green'; break;
                case 'S-S': color = 'orange'; break;
                case 'E-S': color = 'red'; break;
                case 'Spf': color = 'yellow'; break;
                case 'Vxl': color = 'purple'; break;
                default: color = 'gray';
              }
              return (
                <Badge
                  key={item}
                  colorScheme={color}
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
          {['A-S', 'L-S', 'S-S', 'E-S', 'Spf', 'Vxl'].map((option) => (
            <MenuItem
              key={option}
              onClick={() => {
                updateRowField(row.id, 'anordning', [option]);
                setEditingBodyCell(null);
              }}
            >
              <Badge
                colorScheme={
                  option === 'A-S'
                    ? 'blue'
                    : option === 'L-S'
                    ? 'green'
                    : option === 'S-S'
                    ? 'orange'
                    : option === 'E-S'
                    ? 'red'
                    : option === 'Spf'
                    ? 'yellow'
                    : option === 'Vxl'
                    ? 'purple'
                    : 'gray'
                }
                variant="subtle"
                fontSize="xs"
                px={2}
                py={0.5}
                borderRadius="none"
                textTransform="none"
                mr={2}
              >
                {formatAnordningLabel(option)}
              </Badge>
              {option}
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
  const sectionPalette = ['blue.50', 'teal.50', 'purple.50', 'orange.50', 'green.50', 'pink.50'];
  const baseBg = sectionPalette[secIdx % sectionPalette.length];

  return (
    <Td
      key={secIdx}
      width="60px"
      bg={
        selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === cellKey
          ? 'blue.100'
          : sectionMeta?.color || baseBg
      }
      borderRight="1px solid rgba(0, 0, 0, 0.05)"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (hotkeyMode) {
          handleCellInteraction(row, cellKey, `Delområde ${String.fromCharCode(65 + secIdx)}`);
          return;
        }
        toggleBodyCellSelection(row.id, cellKey);
      }}
      onContextMenu={(e) => openBodyContextMenu(e, row.id, cellKey)}
      onDoubleClick={() => {
        if (hotkeyMode) {
          handleCellInteraction(row, cellKey, `Delområde ${String.fromCharCode(65 + secIdx)}`);
          return;
        }
        toggleDelomrade(row.id, secIdx);
      }}
    >
      <Flex align="center" justify="center" gap={2}>
        {row.selections[secIdx] === true && <HiX size={16} color="black" />}
        {sectionIcon?.icon && (
          <Icon as={sectionIcon.icon} color={sectionIcon.color} boxSize="14px" />
        )}
      </Flex>
      {sectionMeta?.comment && (
        <Tooltip label={sectionMeta.comment} hasArrow>
          <Icon as={FaRegCommentDots} color="gray.500" boxSize="14px" mt={1} />
        </Tooltip>
      )}
    </Td>
  );
})}

  {visibleColumns.starttid && (
    <Td
      minW={`${columnWidths.starttid}px`}
      borderRight="1px solid rgba(0, 0, 0, 0.05)"
      bg={
        selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'starttid'
          ? 'blue.100'
          : 'transparent'
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
        isReadOnly={hotkeyMode || !isBodyCellEditing(row.id, 'starttid')}
        onFocus={() => setActiveRowId(row.id)}
        width="100%"
        onBlur={() => setEditingBodyCell(null)}
        onDoubleClick={() => setEditingBodyCell({ rowId: row.id, key: 'starttid' })}
        cursor={isBodyCellEditing(row.id, 'starttid') ? 'text' : 'pointer'}
        caretColor={isBodyCellEditing(row.id, 'starttid') ? 'auto' : 'transparent'}
      />
    </Td>
  )}
  {visibleColumns.begard && (
    <Td
      minW={`${columnWidths.begard}px`}
      borderRight="1px solid rgba(0, 0, 0, 0.05)"
      bg={
        selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'begard'
          ? 'blue.100'
          : 'transparent'
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
      <Input
        size="xs"
        type="time"
        variant="flushed"
        value={row.begard || ''}
        onChange={(e) => updateRowField(row.id, 'begard', e.target.value)}
        isReadOnly={hotkeyMode || !isBodyCellEditing(row.id, 'begard')}
        onFocus={() => setActiveRowId(row.id)}
        width="100%"
        onBlur={() => setEditingBodyCell(null)}
        onDoubleClick={() => setEditingBodyCell({ rowId: row.id, key: 'begard' })}
        cursor={isBodyCellEditing(row.id, 'begard') ? 'text' : 'pointer'}
        caretColor={isBodyCellEditing(row.id, 'begard') ? 'auto' : 'transparent'}
      />
    </Td>
  )}
  {visibleColumns.avslutat && (
    <Td
      minW={`${columnWidths.avslutat}px`}
      borderRight="1px solid rgba(0, 0, 0, 0.05)"
      bg={
        selectedBodyCell?.rowId === row.id && selectedBodyCell?.key === 'avslutat'
          ? 'blue.100'
          : 'transparent'
      }
      onMouseDown={(e) => {
        e.stopPropagation();
        if (hotkeyMode) {
          handleCellInteraction(row, 'avslutat', 'Avslutad');
          return;
        }
        toggleBodyCellSelection(row.id, 'avslutat');
      }}
      onContextMenu={(e) => openBodyContextMenu(e, row.id, 'avslutat')}
    >
      <Input
        size="xs"
        type="time"
        variant="flushed"
        value={row.avslutat || ''}
        onChange={(e) => updateRowField(row.id, 'avslutat', e.target.value)}
        isReadOnly={hotkeyMode || !isBodyCellEditing(row.id, 'avslutat')}
        onFocus={() => setActiveRowId(row.id)}
        width="100%"
        onBlur={() => setEditingBodyCell(null)}
        onDoubleClick={() => setEditingBodyCell({ rowId: row.id, key: 'avslutat' })}
        cursor={isBodyCellEditing(row.id, 'avslutat') ? 'text' : 'pointer'}
        caretColor={isBodyCellEditing(row.id, 'avslutat') ? 'auto' : 'transparent'}
      />
    </Td>
  )}
  <Td borderRight="1px solid rgba(0, 0, 0, 0.05)">
    <Flex align="center" gap={2}>
      <IconButton
        size="xs"
        variant="outline"
        icon={<FiEdit2 />}
        aria-label="Redigera rad"
        onClick={() => openRowModal(row, rowIndex)}
      />
      <Button
        size="xs"
        variant="outline"
        leftIcon={<FiMessageCircle />}
        onClick={() => {
          setSamradModalRow(row);
          onOpenSamradModal();
        }}
      >
        Samråd
      </Button>
    </Flex>
  </Td>
    </Tr>
  );
})}
{project?.tsmRows?.map((row, rowIndex) => (
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
            let color = 'gray';
            switch (item) {
              case 'A-S': color = 'blue'; break;
              case 'L-S': color = 'green'; break;
              case 'S-S': color = 'orange'; break;
              case 'E-S': color = 'red'; break;
              case 'Spf': color = 'yellow'; break;
              case 'Vxl': color = 'purple'; break;
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
              >
                {item}
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
        width="60px"
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
        <Text fontSize="sm">{row.begard || '–'}</Text>
      </Td>
    )}
    {visibleColumns.avslutat && (
      <Td borderRight="1px solid rgba(0, 0, 0, 0.05)">
        <Text fontSize="sm">{row.endTime || row.avslutat || '–'}</Text>
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
                {sec.type} {String.fromCharCode(65 + i)}
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
  <FormLabel>Anordning</FormLabel>
  <Menu closeOnSelect={false}>
    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
      {Array.isArray(selectedRow.anordning) && selectedRow.anordning.length > 0
        ? `${selectedRow.anordning.length} valda`
        : 'Välj anordning(ar)'}
    </MenuButton>
    <MenuList maxHeight="300px" overflowY="auto">
      {['A-S', 'L-S', 'S-S', 'E-S', 'Spf', 'Vxl'].map((option) => (
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
            {option}
          </Checkbox>
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
</FormControl>
              <FormControl>
                <FormLabel>Namn</FormLabel>
                <Input value={selectedRow.namn} onChange={(e) => handleModalChange('namn', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Telefon</FormLabel>
                <Input value={selectedRow.telefon} onChange={(e) => handleModalChange('telefon', e.target.value)} />
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
  {sec.type} {String.fromCharCode(65 + idx)}
</Checkbox>
</MenuItem>
      ))}
    </MenuList>
  </Menu>
</FormControl>
            </SimpleGrid>

<SimpleGrid columns={3} spacing={4}>
  {/* Startdatum */}
  <FormControl>
    <FormLabel>Startdatum</FormLabel>
    <Input
      type="date"
      value={selectedRow.startdatum || ''}
      onChange={(e) => handleModalChange('startdatum', e.target.value)}
    />
    <Button size="xs" mt={1} onClick={() => handleModalChange('startdatum', getCurrentDate())}>
      Sätt dagens datum
    </Button>
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

  {/* Avslutat datum */}
  <FormControl>
    <FormLabel>Avslutat datum</FormLabel>
    <Input
      type="date"
      value={selectedRow.avslutatDatum || ''}
      onChange={(e) => handleModalChange('avslutatDatum', e.target.value)}
    />
    <Button size="xs" mt={1} onClick={() => handleModalChange('avslutatDatum', getCurrentDate())}>
      Sätt dagens datum
    </Button>
  </FormControl>

  {/* Starttid */}
  <FormControl>
    <FormLabel>Starttid</FormLabel>
    <Input
      type="time"
      value={selectedRow.starttid || '00:00'}
      onChange={(e) => handleModalChange('starttid', e.target.value)}
    />
    <Button size="xs" mt={1} onClick={() => handleModalChange('starttid', getCurrentTime())}>
      Sätt aktuell tid
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

  {/* Avslutat */}
  <FormControl>
    <FormLabel>Avslutat</FormLabel>
    <Input
      type="time"
      value={selectedRow.avslutat || '00:00'}
      onChange={(e) => handleModalChange('avslutat', e.target.value)}
    />
    <Button size="xs" mt={1} onClick={() => handleModalChange('avslutat', getCurrentTime())}>
      Sätt aktuell tid
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

  {/* Högersida: Spara och Stäng */}
  <Flex gap={2}>
<Button
  colorScheme="blue"
  onClick={async () => {
    await sparaProjekt(); // Vänta på sparande
    onClose(); // Stäng modalen
  }}
>
  Spara
</Button>
    <Button onClick={onClose}>Stäng</Button>
  </Flex>
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
              <FormControl>
                <FormLabel>Anordning</FormLabel>
                <Menu closeOnSelect={false}>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                    {Array.isArray(editableTsmRow.anordning) && editableTsmRow.anordning.length > 0
                      ? `${editableTsmRow.anordning.length} valda`
                      : 'Välj anordning(ar)'}
                  </MenuButton>
                  <MenuList maxHeight="300px" overflowY="auto">
                    {['A-S', 'L-S', 'S-S', 'E-S', 'Spf', 'Vxl'].map((option) => (
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
                          {option}
                        </Checkbox>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={4}>
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

          {/* Högerkolumn: Delområden */}
          <Box bg="gray.50" p={4} borderRadius="md" maxW="400px" border="1px solid #ccc" height="100%">
            <Text fontWeight="bold" mb={2}>Delområden</Text>
            <SimpleGrid spacing={2}>
              {project.sections.map((sec, idx) => (
                <Checkbox
                  key={idx}
                  isChecked={selectedApprovalAreas.includes(idx)}
                  onChange={() => toggleApprovalArea(idx)}
                >
                  {sec.type} {String.fromCharCode(65 + idx)}
                </Checkbox>
              ))}
            </SimpleGrid>
          </Box>
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

    <ModalFooter>
<Button
  onClick={async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) return alert('Ingen token.');

    try {
      // 1. Hämta nuvarande projekt från backend
      const { data: currentProject } = await axios.get(
        `https://railworker-production.up.railway.app/api/project/${project.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 2. Uppdatera enbart anteckningar
      const updatedProject = {
        ...currentProject,
        anteckningar,
      };

      // 3. Skicka tillbaka till korrekt PUT-endpoint
      await axios.put(
        `https://railworker-production.up.railway.app/api/projects/${project.id}`,
        updatedProject,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 4. Uppdatera lokal state med backend-data + nya anteckningar
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
          {rows
            .filter(
              (row) =>
                row.avslutadRad === true &&
                (
                  (row.namn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (row.telefon || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (row.anordning?.join(', ') || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (row.btkn || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
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
            case 'Spf': color = 'yellow'; break;
            case 'Vxl': color = 'purple'; break;
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
              {item}
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
    {row.startDatum && row.startTid && (
      <Text>
        <strong>Start:</strong> {formatDateOnly(row.startDatum)} kl. {row.startTid}
      </Text>
    )}
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

          {rows.filter(
            (row) =>
              row.avslutadRad === true &&
              (
                (row.namn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (row.telefon || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (row.anordning?.join(', ') || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (row.btkn || '').toLowerCase().includes(searchQuery.toLowerCase())
              )
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
