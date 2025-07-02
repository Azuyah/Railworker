import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { Tooltip } from '@chakra-ui/react';
import { GiRailway } from 'react-icons/gi';
import { PiTrainLight } from 'react-icons/pi'
import { Tag, TagLabel } from "@chakra-ui/react";
import {
  FaUserTie,
  FaPhone,
  FaSignal,
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
  FaHashtag,
} from 'react-icons/fa';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnordning, setSelectedAnordning] = useState('');
  const [avklaradSamrad, setAvklaradSamrad] = useState({});
  const [samradData, setSamradData] = useState({ samradList: [], avklaradMap: {} });
  const [loading, setLoading] = useState(true);
  const [samradTrigger, setSamradTrigger] = useState(0);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [editBeteckningar, setEditBeteckningar] = useState([]);
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);
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

const calculateSamrad = (rows) => {
  const newSamradList = [];
  const newAvklarad = {};

  const exclusionSet = ['A-S', 'L-S', 'S-S', 'E-S'];

  rows.forEach((row, i) => {
    if (row.avslutadRad) return;

    const rowAreas = row.selections || [];
    const rowAnordningar = String(row.anordning || '').split(',').map(a => a.trim());

    for (let j = 0; j < i; j++) {
      const compareRow = rows[j];
      if (compareRow.avslutadRad) continue;

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

const addEditDP = () => {
  const newDP = { type: 'DP', name: '' }; // ändrat signal ➜ name
  setEditSections([...editSections, newDP]);
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
  };
};

const addRow = () => {
  const newRow = {
    ...createNewRow(rows, project),
    id: Date.now(),
    dp: '',
    linje: '',
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
  onOpen();
};

const toggleColumn = (col) => {
  setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
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
  .filter((row) => !row.avslutad)
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
if (loading || !project) {
  return <LoadingScreen text="Hämtar projekt..." />;
}
  return (
<Box
  bgImage="url('/traintrack.png')"
  bgSize="cover"
  bgRepeat="no-repeat"
  bgPosition="center"
  minH="100vh"
  py={10}
  px={[4, 8]}
>
      <Header />
      <Box maxW="1600px" mx="auto" mt={24}>

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

<Flex justify="space-between" align="center" mb={6} px={6} py={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="lg" backdropFilter="blur(8px)">
  {/* Vänster sida: Visa projekt + Filter */}
  <HStack spacing={6}>
    <Button
      onClick={() => setIsProjectInfoOpen(true)}
      bg="linear-gradient(to right, #4e54c8, #8f94fb)"
      color="white"
      px={6}
      py={2}
      borderRadius="full"
      _hover={{ opacity: 0.9 }}
      fontWeight="semibold"
      boxShadow="md"
    >
      Visa projekt
    </Button>

    <Flex gap={2} align="center">
      <Text fontWeight="bold" fontSize="md">Filter</Text>
      <Menu closeOnSelect={false}>
        <MenuButton
          as={IconButton}
          icon={<ChevronDownIcon />}
          variant="ghost"
        />
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
    </Flex>

    <Input
      placeholder="Sök namn eller telefon..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      width="250px"
      bg="white"
      borderRadius="full"
      px={4}
      py={2}
      boxShadow="sm"
      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #90cdf4' }}
    />
  </HStack>

  {/* Höger: Avslutade-knapp */}
  <Button
    onClick={() => setAvslutadeModalOpen(true)}
    bg="gray.800"
    color="white"
    px={5}
    py={2}
    borderRadius="full"
    _hover={{ bg: 'gray.700' }}
    boxShadow="md"
  >
    Avslutade
  </Button>
</Flex>
<Box overflowX="visible" px={2}>
  <Flex gap={2} align="start" minW="fit-content" w="full">
    <TableContainer
      bg="white"
      p={6}
      borderRadius="xl"
      boxShadow="2xl"
      border="1px solid rgba(255,255,255,0.08)"
      overflow="visible"
    >
      <Table variant="simple" size="sm">
        <Thead bg="gray.100" borderRadius="xl">
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
      <Th py={2} fontWeight="semibold" color="gray.700">
        <Flex align="center" gap={2}>
          <FaHashtag size={14} />
          BTKN
        </Flex>
      </Th>
    )}
    {visibleColumns.namn && (
      <Th py={2} fontWeight="semibold" color="gray.700">
        <Flex align="center" gap={2}>
          <FaUserTie size={14} />
          Namn
        </Flex>
      </Th>
    )}
    {visibleColumns.telefon && (
      <Th py={2} fontWeight="semibold" color="gray.700">
        <Flex align="center" gap={2}>
          <FaPhone size={14} />
          Telefon
        </Flex>
      </Th>
    )}
    {visibleColumns.anordning && (
      <Th py={2} fontWeight="semibold" color="gray.700">
        <Flex align="center" gap={2}>
          <FaSignal size={14} />
          Anordning
        </Flex>
      </Th>
    )}

{project.sections.map((sec, idx) => (
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
))}
    {visibleColumns.starttid && (
      <Th py={2} fontWeight="semibold" color="gray.700">
        <Flex align="center" gap={2}>
          <FaClock size={14} />
          Start
        </Flex>
      </Th>
    )}
    {visibleColumns.begard && (
      <Th py={2} fontWeight="semibold" color="gray.700">
        <Flex align="center" gap={2}>
          <FaCalendarAlt size={14} />
          Begärd
        </Flex>
      </Th>
    )}
    {visibleColumns.avslutat && (
      <Th py={2} fontWeight="semibold" color="gray.700">
        <Flex align="center" gap={2}>
          <FaCheckCircle size={14} />
          Slut
        </Flex>
      </Th>
    )}
  </Tr>
</Thead>

          <Tbody>
            {filteredRows
              .filter((row) => !row.avslutadRad)
              .map((row, rowIndex) => (
                <Tr
                  key={row.id}
                  bg="transparent"
                  _hover={{ bg: 'gray.100' }}
                  cursor="pointer"
                  transition="background 0.2s ease"
                  onClick={(e) => {
                    if (
                      e.target.closest(
                        'input[type="checkbox"], textarea, select, label, button, input[type="text"]'
                      )
                    )
                      return;
                    handleRowClick(row, rowIndex);
                  }}
                >
                  {visibleColumns['#'] && (
                    <Td width="40px" borderRight="1px solid rgba(0, 0, 0, 0.05)">
                      <Text color="gray.800" fontSize="sm" textAlign="center">
                        {rowIndex + 1}
                      </Text>
                    </Td>
                  )}
{visibleColumns.btkn && (
  <Td width="80px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
    <Tag
      size="md"
      variant="outline"
      colorScheme="teal"
      w="80px"
      justifyContent="center"
      borderRadius="md"
    >
      <TagLabel isTruncated>{row.btkn}</TagLabel>
    </Tag>
  </Td>
)}

{visibleColumns.namn && (
  <Td maxW="150px" borderRight="1px solid rgba(0, 0, 0, 0.05)">
    <Tooltip
      label={
        <Box p={2} maxW="300px">
          <Text fontWeight="bold" mb={1}>Anteckningar:</Text>
          {row.anteckning ? (
            <Text fontSize="sm">{row.anteckning}</Text>
          ) : (
            <Text fontSize="sm" color="gray.500">Inga anteckningar</Text>
          )}
          <Text fontWeight="bold" mt={3} mb={1}>Samråd:</Text>
          {row.samrad && row.samrad.length > 0 ? (
            <Stack spacing={0.5} align="start">
              {row.samrad.map((entry, idx) => (
                <Text key={idx} fontSize="sm">
                  {entry.namn || 'Okänt namn'}
                </Text>
              ))}
            </Stack>
          ) : (
            <Text fontSize="sm" color="gray.500">
              Inga samråd
            </Text>
          )}
        </Box>
      }
      hasArrow
      placement="top"
      bg="white"
      color="black"
      border="1px solid #ccc"
      borderRadius="md"
      shadow="md"
      p={3}
    >
      <Text
        color="gray.800"
        fontSize="sm"
        w="140px"
        isTruncated
        cursor="help"
      >
        {row.namn}
      </Text>
    </Tooltip>
  </Td>
)}

{visibleColumns.telefon && (
  <Td maxW="145px" borderRight="1px solid rgba(0, 0, 0, 0.05)">
    <Text color="gray.800" fontSize="sm" w="145px" isTruncated>
      {row.telefon}
    </Text>
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
      case 'A-S':
        color = 'blue';      // Klarblå
        break;
      case 'L-S':
        color = 'green';     // Grön istället för teal
        break;
      case 'S-S':
        color = 'orange';    // Orange istället för cyan
        break;
      case 'E-S':
        color = 'red';       // Röd istället för purple
        break;
      case 'Spf':
        color = 'yellow';      // Rosa istället för purple
        break;
      case 'Vxl':
        color = 'purple';    // Behåller lila
        break;
      default:
        color = 'gray';
    }

    return (
      <Badge
        key={idx}
        colorScheme={color}
        variant="subtle"
        fontSize="xs"
        px={2}
        py={0.5}
        borderRadius="none" // <--- Inga rundade hörn
        textTransform="none"
      >
        {item}
      </Badge>
    );
  })}
</Flex>
  </Td>
)}

{project.sections.map((_, secIdx) => (
  <Td
    key={secIdx}
    width="60px"
    bg={secIdx % 2 === 0 ? 'blue.50' : 'transparent'}
    borderRight="1px solid rgba(0, 0, 0, 0.05)"
  >
    <Flex justify="center">
      {row.selections[secIdx] === true && <HiX size={16} color="black" />}
    </Flex>
  </Td>
))}

{visibleColumns.starttid && (
  <Td maxW="150px" w="90px" borderRight="1px solid rgba(0, 0, 0, 0.05)">
    <Tooltip
      label={
        row.startdatum ? (
          <Box p={2} maxW="100px">
            <Text fontWeight="bold" mb={1}>Startdatum:</Text>
            <Text fontSize="sm">{formatDateOnly(row.startdatum)}</Text>
          </Box>
        ) : (
          <Box p={2} maxW="100px">
            <Text fontWeight="bold" mb={1}>Startdatum:</Text>
            <Text fontSize="sm" color="gray.500">Ej angivet</Text>
          </Box>
        )
      }
      hasArrow
      placement="top"
      bg="white"
      color="black"
      border="1px solid #ccc"
      borderRadius="md"
      shadow="md"
      p={3}
    >
      <Text
        color="gray.800"
        fontSize="sm"
        w="50px"
        maxW="inherit"
        isTruncated={false}
        cursor="help"
      >
        {row.starttid}
      </Text>
    </Tooltip>
  </Td>
)}

{visibleColumns.begard && (
  <Td maxW="150px" w="90px" borderRight="1px solid rgba(0, 0, 0, 0.05)">
    <Tooltip
      label={
        row.begardDatum === 'Tsv' ? (
          <Box p={2} maxW="100px">
            <Text fontWeight="bold" mb={1}>Begärd till:</Text>
            <Text fontSize="sm">Tillsvidare</Text>
          </Box>
        ) : row.begardDatum ? (
          <Box p={2} maxW="100px">
            <Text fontWeight="bold" mb={1}>Begärd till:</Text>
            <Text fontSize="sm">{formatDateOnly(row.begardDatum)}</Text>
          </Box>
        ) : (
          <Box p={2} maxW="100px">
            <Text fontWeight="bold" mb={1}>Begärd till:</Text>
            <Text fontSize="sm" color="gray.500">Ej angivet</Text>
          </Box>
        )
      }
      hasArrow
      placement="top"
      bg="white"
      color="black"
      border="1px solid #ccc"
      borderRadius="md"
      shadow="md"
      p={3}
    >
      <Text
        color="gray.800"
        fontSize="sm"
        w="50px"
        isTruncated={false}
        cursor="help"
      >
        {row.begard === 'Tsv' ? 'Tsv' : row.begard}
      </Text>
    </Tooltip>
  </Td>
)}

{visibleColumns.avslutat && (
  <Td maxW="150px" w="90px" borderRight="1px solid rgba(0, 0, 0, 0.05)">
    <Tooltip
      label={
        row.avslutatDatum ? (
          <Box p={2} maxW="100px">
            <Text fontWeight="bold" mb={1}>Avslutat:</Text>
            <Text fontSize="sm">{formatDateOnly(row.avslutatDatum)}</Text>
          </Box>
        ) : (
          <Box p={2} maxW="100px">
            <Text fontWeight="bold" mb={1}>Avslutat:</Text>
            <Text fontSize="sm" color="gray.500">Ej angivet</Text>
          </Box>
        )
      }
      hasArrow
      placement="top"
      bg="white"
      color="black"
      border="1px solid #ccc"
      borderRadius="md"
      shadow="md"
      p={3}
    >
      <Text
        color="gray.800"
        fontSize="sm"
        w="50px"
        isTruncated={false}
        cursor="help"
      >
        {row.avslutat}
      </Text>
    </Tooltip>
  </Td>
)}
    </Tr>
  ))}
</Tbody>
        </Table>
        <Button
  onClick={() => {
    addRow();
    onOpen(); // öppnar modalen direkt
  }}
  colorScheme="blue"
  mt={4}
>
  + Lägg till rad
</Button>
      </TableContainer>
</Flex>
</Box>

{/*Slut på table*/}

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
      value={selectedRow.starttid || ''}
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
      value={selectedRow.begard || ''}
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
      value={selectedRow.avslutat || ''}
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
        avslutadAv: initials, // ✅ endast detta läggs till
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
  {row.startDatum && row.startTid ? (
    <>
      {formatDateOnly(row.startDatum)} kl. {row.startTid}
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
    </Box>
    </Box>
    
  );
};



export default Plan;