import React, { useState, useEffect, useMemo } from 'react';
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
  FaPalette,
  FaRegCommentDots,
} from 'react-icons/fa';
import { FiHash, FiUser, FiPhone, FiAperture, FiClock, FiSliders, FiEyeOff, FiEdit2, FiMessageCircle, FiChevronsRight } from 'react-icons/fi';
import { HiX } from "react-icons/hi";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
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
  Select,
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
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Header from '../components/Header';

const Plan = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [rows, setRows] = useState([]);
  const [countdown, setCountdown] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [avslutadeModalOpen, setAvslutadeModalOpen] = useState(false);
  const [hiddenRowsModalOpen, setHiddenRowsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnordning, setSelectedAnordning] = useState('');
  const [avklaradSamrad, setAvklaradSamrad] = useState({});
  const [samradData, setSamradData] = useState({ samradList: [], avklaradMap: {} });
  const [loading, setLoading] = useState(true);
  const [samradTrigger, setSamradTrigger] = useState(0);
  const [cellEditMode, setCellEditMode] = useState(false);
  const [activeCell, setActiveCell] = useState(null);
  const [smsSelection, setSmsSelection] = useState({});
  const [smsMessage, setSmsMessage] = useState('');
  const [editableTsmRow, setEditableTsmRow] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [editBeteckningar, setEditBeteckningar] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [selectedApprovalAreas, setSelectedApprovalAreas] = useState([]);
  const [anteckningar, setAnteckningar] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [anteckningarModalOpen, setAnteckningarModalOpen] = useState(false);
  const [selectedTsmRow, setSelectedTsmRow] = useState(null);
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);
  const [samradModalRow, setSamradModalRow] = useState(null);
  const [sectionHeaderNotes, setSectionHeaderNotes] = useState([]);
  const [sectionHeaderNotes2, setSectionHeaderNotes2] = useState([]);
  const [begardDefaultTime, setBegardDefaultTime] = useState('');
  const [begardDefaultDate, setBegardDefaultDate] = useState('');
  const [activeRowId, setActiveRowId] = useState(null);
  const [hotkeysOpen, setHotkeysOpen] = useState(false);
  const [colorHotkey, setColorHotkey] = useState(null);
  const [iconHotkey, setIconHotkey] = useState(null);
  const [btknPrefix, setBtknPrefix] = useState('');
  const [columnWidths, setColumnWidths] = useState({
    btkn: 90,
    namn: 180,
    telefon: 150,
    anordning: 180,
    tider: 260,
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const openProjectInfoModal = () => setIsProjectInfoOpen(true);
  const closeProjectInfoModal = () => setIsProjectInfoOpen(false);
  const tableBg = useColorModeValue("white", "gray.800");
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
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
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
  const [editSections, setEditSections] = useState(project?.sections || []);
  const tokenData = localStorage.getItem('user');
  const user = tokenData ? JSON.parse(tokenData).user : null;

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

const updateRow = (updatedRow) => {
  const updatedRows = rows.map((row) =>
    row.id === updatedRow.id ? updatedRow : row
  );
  setRows(updatedRows);
  return updatedRows; // Returnera nya rows
};

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

const {
  isOpen: isCellEditorOpen,
  onOpen: onOpenCellEditor,
  onClose: onCloseCellEditor,
} = useDisclosure();

const calculateSamrad = (rows) => {
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
};

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

const COLOR_HOTKEYS = {
  1: 'yellow.100',
  2: 'green.100',
  3: 'blue.100',
  4: 'red.100',
  5: 'purple.100',
  6: 'gray.100',
};

const ICON_HOTKEYS = {
  q: 'check',
  w: 'alert',
  e: 'flag',
  r: 'bolt',
};

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

const openCellEditor = (row, cellKey, label) => {
  setActiveCell({
    rowId: row.id,
    key: cellKey,
    label,
    rowName: row.namn || row.btkn || `Rad ${row.id}`,
  });
  onOpenCellEditor();
};

const closeCellEditor = () => {
  setActiveCell(null);
  onCloseCellEditor();
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

const handleCellInteraction = (row, cellKey, label) => {
  if (colorHotkey) {
    updateCellMeta(row.id, cellKey, { color: colorHotkey });
    return;
  }
  if (iconHotkey) {
    updateCellMeta(row.id, cellKey, { icon: iconHotkey });
    return;
  }
  if (cellEditMode) {
    openCellEditor(row, cellKey, label);
  }
};

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

const activeCellRow = useMemo(() => {
  if (!activeCell?.rowId) return null;
  return rows.find((row) => row.id === activeCell.rowId) || null;
}, [activeCell, rows]);

const activeCellMeta = useMemo(() => {
  if (!activeCell || !activeCellRow) return {};
  return getCellMeta(activeCellRow, activeCell.key);
}, [activeCell, activeCellRow]);

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
  const indexToInsert =
    editSections.findIndex(
      (sec) =>
        sec.type === 'DP' &&
        !editSections.some(
          (s, i) => i > editSections.indexOf(sec) && s.type === 'Linje'
        )
    ) + 1;

  const updated = [...editSections];
  updated.splice(indexToInsert, 0, { type: 'Linje', name: '' });
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

const getCurrentDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`; // Exempel: "28/06/2025"
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // Exempel: "15:12"
};


const sparaProjekt = async (customRows = rows) => {
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
    };

rowsWithSamrad.forEach((row, index) => {
});

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
};

useEffect(() => {
  fetchProject();
}, []);

useEffect(() => {
  if (selectedTsmRow) {
    setEditableTsmRow({ ...selectedTsmRow });
  }
}, [selectedTsmRow]);

useEffect(() => {
  if (selectedTsmRow?.selections) {
    const initialAreas = selectedTsmRow.selections
      .map((val, idx) => (val ? idx : null))
      .filter((idx) => idx !== null);
    setSelectedApprovalAreas(initialAreas);
  }
}, [selectedTsmRow]);

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
}, [project]);

useEffect(() => {
  if (selectedRow?.id) {
    setSelectedRow((prev) => ({
      ...prev,
      selectedAreas: [...selectedAreas],
    }));
  }
}, [selectedAreas]);

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
}, [project?.sections]);

useEffect(() => {
  if (!selectedRowId) return;
  setSmsSelection({});
  setSmsMessage('');
}, [selectedRowId]);

useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.key === 'Meta') {
      setCellEditMode(true);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Meta') {
      setCellEditMode(false);
    }
  };

  const handleBlur = () => {
    setCellEditMode(false);
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', handleBlur);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('blur', handleBlur);
  };
}, []);

useEffect(() => {
  const handleHotkeys = (event) => {
    const target = event.target;
    const isTyping =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable);

    if (!isTyping) {
      const key = event.key.toLowerCase();
      if (COLOR_HOTKEYS[key]) {
        setColorHotkey(COLOR_HOTKEYS[key]);
        return;
      }
      if (ICON_HOTKEYS[key]) {
        setIconHotkey(ICON_HOTKEYS[key]);
        return;
      }
    }

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
        const confirmed = window.confirm('Vill du dölja den här raden?');
        if (confirmed) {
          hideRow(row);
        }
      }
      return;
    }

    if (event.shiftKey && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      const today = getCurrentDate();
      updateRowField(activeRowId, 'begardDatum', today);
    }
  };

  const handleKeyUp = (event) => {
    const key = event.key.toLowerCase();
    if (COLOR_HOTKEYS[key]) {
      setColorHotkey(null);
    }
    if (ICON_HOTKEYS[key]) {
      setIconHotkey(null);
    }
  };

  window.addEventListener('keydown', handleHotkeys);
  window.addEventListener('keyup', handleKeyUp);
  return () => {
    window.removeEventListener('keydown', handleHotkeys);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [activeRowId, rows]);

useEffect(() => {
  if (!rows || rows.length === 0 || !project?.sections) return;

  // Kontroll: vänta tills alla rader har ett namn
  const allHaveNames = rows.every(row => typeof row.namn === 'string' && row.namn.trim() !== '');
  if (!allHaveNames) return; // Vänta tills namn är laddade

  const result = calculateSamrad(rows);

  const updated = rows.map((row, index) => {
    const related = result.samradList
      .filter((entry) => entry.from === index)
      .map((entry) => {
        const match = rows[entry.to];
        return {
          id: match?.id,
          namn: match?.namn && match.namn.trim() !== '' ? match.namn : 'Okänt namn',
        };
      });

return {
  ...row,
  samrad: related,
  selections: row.selections || Array(project.sections.length).fill(false),
};
  });

  // Endast uppdatera om något faktiskt ändrats
  const changed = updated.some((row, i) =>
    JSON.stringify(row.samrad) !== JSON.stringify(rows[i].samrad)
  );

  if (changed) {
    setRows(updated);
  }
}, [rows, project]);

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
}, [selectedAreas, selectedRow?.id, project?.sections?.length]);

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

  setRows(updated);
}, [project]); // ❗️Byt till [project, rows]

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

  const fetchProject = async () => {
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
      
      
const enrichedRows = (current.rows || []).map((row) => {
  const selectedAreas = Array.isArray(row.selections)
    ? row.selections.map((val, idx) => (val ? idx : null)).filter((i) => i !== null)
    : [];

  return { ...row, selectedAreas };
});

setRows(enrichedRows);


      const interval = setInterval(() => {
        const target = new Date(`${current.endDate}T${current.endTime}`);
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) {
          setCountdown('Dispositionsarbetsplan stängd!');
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${h}h ${m}m ${s}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Kunde inte hämta projekt:', error);
    } finally {
    setLoading(false);
    }

  };

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

  setSelectedAnordning('');
};

const updateRowField = (rowId, field, value) => {
  setRows((prev) =>
    prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
  );
  if (['dp', 'linje', 'anordning'].includes(field)) {
    setSamradTrigger((prev) => prev + 1);
  }
};


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

const hideRow = async (row) => {
  const updatedRow = {
    ...row,
    hiddenRow: true,
    avslutadRad: true,
    avslutatDatum: getCurrentDate(),
    avslutat: getCurrentTime(),
  };
  const updated = updateRow(updatedRow);
  await sparaProjekt(updated);
};

const unhideRow = async (row) => {
  const updatedRow = {
    ...row,
    hiddenRow: false,
    avslutadRad: false,
  };
  const updated = updateRow(updatedRow);
  await sparaProjekt(updated);
};

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

const toggleColumnWidth = (key, expanded) => {
  setColumnWidths((prev) => ({
    ...prev,
    [key]: prev[key] < expanded ? expanded : Math.max(expanded - 60, 90),
  }));
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

  setSelectedRowIndex(rowIndex);
  setSelectedRowId(row.id);

 setSelectedAreas(
  row.selections
    ?.map((selected, index) => (selected === true ? index : null))
    .filter((index) => index !== null) || []
);

  setSelectedAnordning(Array.isArray(row.anordning) ? row.anordning : [])

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

  if (['dp', 'linje', 'anordning'].includes(field)) {
    setSamradTrigger((prev) => prev + 1);
  }
};

const [samrad, setSamrad] = useState([]);
const filteredRows = rows
  .filter((row) => !row.hiddenRow)
  .filter((row) =>
    filterValue === 'all' || (row.namn || '').toLowerCase() === filterValue.toLowerCase()
  )
  .filter((row) =>
    (row.namn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.telefon || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
const { dpOptions, linjeOptions } = useMemo(() => {
  const dp = [];
  const linje = [];
  let letterIndex = 0;

  if (project?.sections) {
    project.sections.forEach((sec) => {
      const letter = String.fromCharCode(65 + letterIndex);
      const labeledSection = { ...sec, label: `${sec.type} ${letter}`, letterIndex };

      if (sec.type === 'DP') dp.push(labeledSection);
      else if (sec.type === 'Linje') linje.push(labeledSection);

      letterIndex++;
    });
  }

  return { dpOptions: dp, linjeOptions: linje };
}, [project]);
const visibleSectionIndexes = useMemo(() => {
  if (!project?.sections?.length) return [];
  return project.sections
    .map((_, index) => {
      const hasSelection = rows.some((row) => row.selections?.[index]);
      const hasHeaderText = Boolean(sectionHeaderNotes?.[index]?.trim() || sectionHeaderNotes2?.[index]?.trim());
      return hasSelection || hasHeaderText ? index : null;
    })
    .filter((index) => index !== null);
}, [project?.sections, rows, sectionHeaderNotes, sectionHeaderNotes2]);
if (loading || !project) {
  return <LoadingScreen text="Hämtar projekt..." />;
}
const isCellModeActive = cellEditMode || colorHotkey || iconHotkey;
  return (
<Box
  minH="100vh"
  bg="linear-gradient(135deg, #F6F7FB 0%, #EFF2F7 45%, #E9EEF5 100%)"
  py={10}
  px={[4, 8]}
>
  <Box position="fixed" inset={0} bg="linear-gradient(135deg, #F6F7FB 0%, #EFF2F7 45%, #E9EEF5 100%)" zIndex={0} />
  <Box position="relative" zIndex={1}>
      <Header />
      <Box maxW="1600px" mx="auto" mt={20}>
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          wrap="wrap"
          gap={4}
        >
          <Box>
            <Heading fontSize="2xl" fontWeight="700" color="gray.900">
              Dispositionsarbetsplan
            </Heading>
            <Text color="gray.600" fontSize="sm">
              {project.name} · {project.plats}
            </Text>
          </Box>
          <Box
            bg="white"
            borderRadius="2xl"
            px={5}
            py={3}
            border="1px solid #E2E8F0"
            boxShadow="sm"
          >
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
              Planen stänger
            </Text>
            <Text fontSize="lg" fontWeight="600" color="blue.600">
              {countdown}
            </Text>
          </Box>
        </Flex>

<Modal isOpen={isProjectInfoOpen} onClose={() => setIsProjectInfoOpen(false)} size="xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold">Projektinformation</Text>
        <Box textAlign="right">
          <Text fontSize="sm" fontWeight="semibold">Dispositionsarbetsplan avslutas:</Text>
          <Text fontSize="lg" fontWeight="bold" color="blue.500">{countdown}</Text>
        </Box>
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

<Box>
  <Flex
    align="center"
    justify="space-between"
    bg="white"
    border="1px solid #E2E8F0"
    borderRadius="2xl"
    px={5}
    py={4}
    boxShadow="sm"
    mb={4}
    wrap="wrap"
    gap={4}
  >
    <Box>
      <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
        Projekt
      </Text>
      <Text fontSize="lg" fontWeight="600" color="gray.900">
        {project.name}
      </Text>
      <Text fontSize="sm" color="gray.600">
        {project.plats}
      </Text>
    </Box>
    <HStack spacing={3} wrap="wrap">
      <Button onClick={() => setIsProjectInfoOpen(true)} variant="outline" borderRadius="full">
        Visa projekt
      </Button>
      <Button onClick={() => sparaProjekt()} bg="gray.900" color="white" borderRadius="full" _hover={{ bg: 'gray.800' }}>
        Spara
      </Button>
      <Button variant="outline" borderRadius="full" onClick={() => addRow()}>
        + Lägg till rad
      </Button>
      <Button variant="outline" borderRadius="full" onClick={() => setAnteckningarModalOpen(true)}>
        Anteckningar
      </Button>
      <Button variant="outline" borderRadius="full" onClick={() => setHiddenRowsModalOpen(true)}>
        Visa dolda
      </Button>
      <Button variant="outline" borderRadius="full" onClick={() => setAvslutadeModalOpen(true)}>
        Avslutade
      </Button>
    </HStack>
  </Flex>

  <Box flex="1" overflowX="visible">
    <Flex
      align="center"
      justify="space-between"
      bg="white"
      border="1px solid #E2E8F0"
      borderRadius="2xl"
      px={5}
      py={3}
      boxShadow="sm"
      mb={4}
      wrap="wrap"
      gap={3}
    >
      <HStack spacing={3} wrap="wrap">
        <Menu closeOnSelect={false}>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="outline"
            borderRadius="full"
          >
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
          width="260px"
          bg="gray.50"
          borderRadius="full"
          px={4}
          py={2}
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
        />
      </HStack>

      <HStack spacing={3}>
        <Button
          leftIcon={<FaPalette />}
          variant={isCellModeActive ? 'solid' : 'outline'}
          colorScheme={isCellModeActive ? 'purple' : 'gray'}
          onClick={() => setCellEditMode((prev) => !prev)}
          borderRadius="full"
        >
          Cell‑läge
        </Button>
        <Button variant="outline" borderRadius="full" onClick={() => setHotkeysOpen(true)}>
          Kortkommandon
        </Button>
      </HStack>
    </Flex>

    <Box overflowX="visible">
      <Flex gap={2} align="start" minW="fit-content" w="full">
    <TableContainer
      bg="white"
      p={4}
      borderRadius="2xl"
      boxShadow="xl"
      border="1px solid #E2E8F0"
      overflow="visible"
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
            borderBottom: '1px solid #E2E8F0',
            paddingY: '6px',
          },
          thead: {
            position: 'sticky',
            top: 0,
            zIndex: 1,
          },
          'tbody tr': {
            borderBottom: '1px solid #CBD5E0',
          },
          'tbody tr:nth-of-type(even)': {
            backgroundColor: '#F8FAFC',
          },
          'tbody input': {
            height: '24px',
            fontSize: '12px',
          },
        }}
      >
        <Thead bg="gray.100" borderRadius="xl">
          <Tr>
            <Th />
            {visibleColumns['#'] && <Th />}
            {visibleColumns.btkn && (
              <Th>
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
              <Th key={`note2-${secIdx}`} p={1} bg={secIdx % 2 === 0 ? 'blue.50' : 'transparent'}>
                <Input
                  size="xs"
                  variant="flushed"
                  placeholder="Text"
                  value={sectionHeaderNotes2[secIdx] || ''}
                  onChange={(e) =>
                    setSectionHeaderNotes2((prev) => {
                      const next = [...prev];
                      next[secIdx] = e.target.value;
                      return next;
                    })
                  }
                />
              </Th>
            ))}
            <Th />
            <Th />
          </Tr>
          <Tr>
            <Th />
            {visibleColumns['#'] && <Th />}
            {visibleColumns.btkn && <Th />}
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
            <Th p={1}>
              <Flex gap={2}>
                <Input
                  size="xs"
                  type="date"
                  variant="flushed"
                  value={begardDefaultDate}
                  onChange={(e) => setBegardDefaultDate(e.target.value)}
                />
                <Input
                  size="xs"
                  type="time"
                  variant="flushed"
                  placeholder="Tid"
                  value={begardDefaultTime}
                  onChange={(e) => setBegardDefaultTime(e.target.value)}
                />
              </Flex>
            </Th>
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
          <IconButton
            size="xs"
            variant="ghost"
            icon={<FiChevronsRight />}
            aria-label="Expandera BTKN"
            onClick={() => toggleColumnWidth('btkn', 140)}
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
          <IconButton
            size="xs"
            variant="ghost"
            icon={<FiChevronsRight />}
            aria-label="Expandera Namn"
            onClick={() => toggleColumnWidth('namn', 260)}
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
          <IconButton
            size="xs"
            variant="ghost"
            icon={<FiChevronsRight />}
            aria-label="Expandera Telefon"
            onClick={() => toggleColumnWidth('telefon', 220)}
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
          <IconButton
            size="xs"
            variant="ghost"
            icon={<FiChevronsRight />}
            aria-label="Expandera Anordning"
            onClick={() => toggleColumnWidth('anordning', 240)}
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
    <Th py={2} fontWeight="semibold" color="gray.700">
      <Flex align="center" gap={2}>
        <FiClock size={14} />
        Tider
      </Flex>
    </Th>
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
                const hotkeyMode = cellEditMode || colorHotkey || iconHotkey;

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
    bg={btknMeta?.color || 'transparent'}
    onClick={(e) => {
      e.stopPropagation();
      handleCellInteraction(row, 'btkn', 'BTKN');
    }}
  >
    <Flex align="center" justify="space-between" gap={2}>
      <Input
        size="xs"
        variant="flushed"
        value={row.btkn || ''}
        onChange={(e) => updateRowField(row.id, 'btkn', e.target.value)}
        isReadOnly={hotkeyMode}
        onFocus={() => setActiveRowId(row.id)}
      />
    </Flex>
  </Td>
)}

{visibleColumns.namn && (
  <Td
    maxW={`${columnWidths.namn}px`}
    borderRight="1px solid rgba(0, 0, 0, 0.05)"
    bg={namnMeta?.color || 'transparent'}
    onClick={(e) => {
      e.stopPropagation();
      handleCellInteraction(row, 'namn', 'Namn');
    }}
  >
    <Flex align="center" justify="space-between" gap={2}>
      <Input
        size="xs"
        variant="flushed"
        value={row.namn || ''}
        onChange={(e) => updateRowField(row.id, 'namn', e.target.value)}
        isReadOnly={hotkeyMode}
        onFocus={() => setActiveRowId(row.id)}
      />
    </Flex>
  </Td>
)}

{visibleColumns.telefon && (
  <Td
    maxW={`${columnWidths.telefon}px`}
    borderRight="1px solid rgba(0, 0, 0, 0.05)"
    bg={telefonMeta?.color || 'transparent'}
    onClick={(e) => {
      e.stopPropagation();
      handleCellInteraction(row, 'telefon', 'Telefon');
    }}
  >
    <Flex align="center" justify="space-between" gap={2}>
      <Input
        size="xs"
        variant="flushed"
        value={row.telefon || ''}
        onChange={(e) => updateRowField(row.id, 'telefon', e.target.value)}
        isReadOnly={hotkeyMode}
        onFocus={() => setActiveRowId(row.id)}
      />
    </Flex>
  </Td>
)}

{visibleColumns.anordning && (
  <Td
    maxW={`${columnWidths.anordning}px`}
    borderRight="1px solid rgba(0, 0, 0, 0.1)"
    bg={anordningMeta?.color || 'transparent'}
    onClick={(e) => {
      e.stopPropagation();
      handleCellInteraction(row, 'anordning', 'Anordning');
    }}
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
            <MenuItem key={option}>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => updateRowField(row.id, 'anordning', [option])}
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
              </Button>
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
                  const baseBg = secIdx % 2 === 0 ? 'blue.50' : 'transparent';

  return (
    <Td
      key={secIdx}
      width="60px"
      bg={sectionMeta?.color || baseBg}
      borderRight="1px solid rgba(0, 0, 0, 0.05)"
      onClick={() => {
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

  <Td
    minW={`${columnWidths.tider}px`}
    borderRight="1px solid rgba(0, 0, 0, 0.05)"
    bg="transparent"
  >
    <Stack spacing={1}>
      <HStack spacing={3} fontSize="xs" color="gray.500">
        {visibleColumns.starttid && <Text minW="70px">Start</Text>}
        {visibleColumns.begard && <Text minW="70px">Begärd</Text>}
        {visibleColumns.avslutat && <Text minW="70px">Avslutad</Text>}
      </HStack>
      <HStack spacing={3}>
        {visibleColumns.starttid && (
          <Input
            size="xs"
            type="time"
            variant="flushed"
            value={row.starttid || ''}
            onChange={(e) => updateRowField(row.id, 'starttid', e.target.value)}
            isReadOnly={hotkeyMode}
            onFocus={() => setActiveRowId(row.id)}
            width="70px"
          />
        )}
        {visibleColumns.begard && (
          <Input
            size="xs"
            type="time"
            variant="flushed"
            value={row.begard || ''}
            onChange={(e) => updateRowField(row.id, 'begard', e.target.value)}
            isReadOnly={hotkeyMode}
            onFocus={() => setActiveRowId(row.id)}
            width="70px"
          />
        )}
        {visibleColumns.avslutat && (
          <Input
            size="xs"
            type="time"
            variant="flushed"
            value={row.avslutat || ''}
            onChange={(e) => updateRowField(row.id, 'avslutat', e.target.value)}
            isReadOnly={hotkeyMode}
            onFocus={() => setActiveRowId(row.id)}
            width="70px"
          />
        )}
      </HStack>
    </Stack>
  </Td>
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
  if (cellEditMode) return;
  setEditableTsmRow({
    ...row,
    namn: row.namn || `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim(),
    telefon: row.telefon || row.user?.phone || '',
  });

  onOpenApprovalModal();
}}
  >
    <Td borderRight="1px solid rgba(0, 0, 0, 0.05)" />
    {/* BTKN */}
    <Td borderRight="1px solid rgba(0, 0, 0, 0.1)">
      <Text>
      </Text>
    </Td>

    {/* NAMN */}
    <Td borderRight="1px solid rgba(0, 0, 0, 0.1)">
      <Text>
        {row.user?.firstName} {row.user?.lastName}
      </Text> {/* Namn visas ej för TSM-rad */}
    </Td>

    {/* TELEFON */}
    <Td borderRight="1px solid rgba(0, 0, 0, 0.1)">
      <Text>{row.user?.phone || '-'}</Text>
    </Td>

    {/* ANORDNING */}
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

    <Td borderRight="1px solid rgba(0, 0, 0, 0.05)">
      <Stack spacing={1}>
        <Flex align="center" justify="space-between">
          <Text fontSize="xs" color="gray.500">Start</Text>
          <Text fontSize="sm">{row.startTime || '–'}</Text>
        </Flex>
        <Flex align="center" justify="space-between">
          <Text fontSize="xs" color="gray.500">Begärd</Text>
          <Text fontSize="sm">{row.begard || '–'}</Text>
        </Flex>
        <Flex align="center" justify="space-between">
          <Text fontSize="xs" color="gray.500">Slut</Text>
          <Text fontSize="sm">{row.endTime || '–'}</Text>
        </Flex>
      </Stack>
    </Td>
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

<Modal isOpen={hotkeysOpen} onClose={() => setHotkeysOpen(false)} size="md">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Kortkommandon</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Stack spacing={2} fontSize="sm" color="gray.700">
        <Flex justify="space-between"><Text>⌘ (håll)</Text><Text>Cell‑läge</Text></Flex>
        <Flex justify="space-between"><Text>T</Text><Text>Starttid = nu</Text></Flex>
        <Flex justify="space-between"><Text>Shift + T</Text><Text>Begärd = nu</Text></Flex>
        <Flex justify="space-between"><Text>Alt + T</Text><Text>Slut = nu</Text></Flex>
        <Flex justify="space-between"><Text>D</Text><Text>Dölj rad</Text></Flex>
        <Flex justify="space-between"><Text>Shift + D</Text><Text>Begärd‑datum = idag</Text></Flex>
        <Flex justify="space-between"><Text>Håll 1–6</Text><Text>Färga cell</Text></Flex>
        <Flex justify="space-between"><Text>Håll Q/W/E/R</Text><Text>Sätt ikon</Text></Flex>
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

    const result = calculateSamrad(newRows);
    setSamrad(result.samradList);
    setSamradTrigger((prev) => prev + 1);
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

<Modal isOpen={isCellEditorOpen} onClose={closeCellEditor} size="lg">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Cellinställningar</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {activeCell ? (
        <Stack spacing={4}>
          <Box>
            <Text fontSize="sm" color="gray.600">
              {activeCell.rowName} • {activeCell.label}
            </Text>
          </Box>
          <Box>
            <Text fontWeight="semibold" mb={2}>Färg</Text>
            <Flex wrap="wrap" gap={2}>
              {CELL_COLORS.map((color) => (
                <Button
                  key={color.value || 'none'}
                  size="sm"
                  variant={activeCellMeta?.color === color.value ? 'solid' : 'outline'}
                  colorScheme={color.value ? 'gray' : 'gray'}
                  onClick={() =>
                    updateCellMeta(activeCell.rowId, activeCell.key, { color: color.value })
                  }
                  leftIcon={
                    <Box
                      w="12px"
                      h="12px"
                      borderRadius="full"
                      bg={color.value || 'transparent'}
                      border="1px solid #CBD5E0"
                    />
                  }
                >
                  {color.label}
                </Button>
              ))}
            </Flex>
          </Box>
          <Divider />
          <Box>
            <Text fontWeight="semibold" mb={2}>Ikon</Text>
            <Flex wrap="wrap" gap={2}>
              {CELL_ICONS.map((option) => (
                <Button
                  key={option.key || 'none'}
                  size="sm"
                  variant={activeCellMeta?.icon === option.key ? 'solid' : 'outline'}
                  onClick={() =>
                    updateCellMeta(activeCell.rowId, activeCell.key, { icon: option.key })
                  }
                  leftIcon={
                    option.icon ? <Icon as={option.icon} color={option.color} /> : undefined
                  }
                >
                  {option.label}
                </Button>
              ))}
            </Flex>
          </Box>
          <Divider />
          <FormControl>
            <FormLabel>Kommentar</FormLabel>
            <Textarea
              value={activeCellMeta?.comment || ''}
              onChange={(e) =>
                updateCellMeta(activeCell.rowId, activeCell.key, { comment: e.target.value })
              }
              placeholder="Skriv en kommentar som visas som tooltip."
            />
          </FormControl>
        </Stack>
      ) : (
        <Text fontSize="sm" color="gray.500">Ingen cell vald.</Text>
      )}
    </ModalBody>
    <ModalFooter justifyContent="space-between">
      <Button
        variant="outline"
        onClick={() => {
          if (!activeCell) return;
          updateCellMeta(activeCell.rowId, activeCell.key, { __clear: true });
        }}
      >
        Rensa cell
      </Button>
      <Button onClick={closeCellEditor}>Stäng</Button>
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

<Modal isOpen={avslutadeModalOpen} onClose={() => setAvslutadeModalOpen(false)} size="6xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Avslutade poster</ModalHeader>
    <ModalCloseButton />
<ModalBody>
  <Input
    placeholder="Sök efter namn, telefon eller BTKN..."
    mb={4}
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
</ModalBody>
    <ModalFooter justifyContent="space-between">
<Button onClick={() => setAvslutadeModalOpen(false)}>Stäng</Button>

<Button
  colorScheme="blue"
  onClick={async () => {
    try {
      await sparaProjekt(); // Återanvänd befintlig sparfunktion
      setAvslutadeModalOpen(false); // Stäng modalen efter sparande
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

<Modal isOpen={hiddenRowsModalOpen} onClose={() => setHiddenRowsModalOpen(false)} size="6xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Dolda rader</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Stack spacing={3}>
        {rows.filter((row) => row.hiddenRow).length === 0 ? (
          <Text color="gray.500">Inga dolda rader.</Text>
        ) : (
          rows
            .filter((row) => row.hiddenRow)
            .map((row) => (
              <Flex
                key={`hidden-${row.id}`}
                justify="space-between"
                align="center"
                p={3}
                border="1px solid #E2E8F0"
                borderRadius="md"
                bg="gray.50"
              >
                <Box>
                  <Text fontWeight="semibold">{row.namn || row.btkn || `Rad ${row.id}`}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {row.telefon || '—'} · {row.anordning || '—'}
                  </Text>
                </Box>
                <Button size="sm" onClick={() => unhideRow(row)}>
                  Visa igen
                </Button>
              </Flex>
            ))
        )}
      </Stack>
    </ModalBody>
    <ModalFooter>
      <Button onClick={() => setHiddenRowsModalOpen(false)}>Stäng</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
    </Box>
    </Box>
    </Box>
    
  );
};



export default Plan;
