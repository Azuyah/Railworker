import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { Tooltip } from '@chakra-ui/react';
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
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  SimpleGrid,
  FormControl,
  FormLabel,
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
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);
const openProjectInfoModal = () => setIsProjectInfoOpen(true);
const closeProjectInfoModal = () => setIsProjectInfoOpen(false);
  const [visibleColumns, setVisibleColumns] = useState({
    namn: true,
    telefon: true,
    anordning: true,
    starttid: true,
    begard: true,
    avslutat: true,
    anteckning: true,
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

        newSamradList.push({ from: i, to: j });
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

// Kopiera aktuell rad
const current = preparedRows[selectedRow.index];

// Skapa ny version med rätt selectedAreas direkt från state
preparedRows[selectedRow.index] = {
  ...current,
  selectedAreas: [...selectedAreas], // <- detta fångar aktuell state korrekt
};

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
  if (!rows || rows.length === 0) return;

  const updated = rows.map((row, index) => {
    if (
      !row.anordning ||
      (!row.anordning.includes('Spf') && !row.anordning.includes('Vxl'))
    ) {
      return { ...row, samrad: [] };
    }

    const matching = rows.slice(0, index).filter((prevRow) => {
      return (
        !prevRow.avslutadRad &&
        prevRow.anordning &&
        (prevRow.anordning.includes('Dp') || prevRow.anordning.includes('Linje')) &&
        prevRow.dp === row.dp &&
        prevRow.linje === row.linje &&
        typeof prevRow.namn === 'string'
      );
    });

    const samradList = matching.map((match) => ({
      id: match.id,
      namn: match.namn,
      dp: match.dp,
      linje: match.linje,
    }));

return {
  ...row,
  samrad: samradList,
  selections: row.selections || Array(project.sections.length).fill(false),
};
  });

  setRows(updated);
}, [rows.length]);

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
}, [project]);

useEffect(() => {
  const hasValidAnordning =
    Array.isArray(selectedRow?.anordning) &&
    selectedRow.anordning.length > 0;

  const hasValidAreas =
    Array.isArray(selectedAreas) &&
    selectedAreas.length > 0;

  if (!hasValidAnordning || !hasValidAreas || !rows || !selectedRow || selectedRow.index === undefined) {
    setSamrad([]);
    return;
  }

  // Skapa temporär rad med användarens aktuella val
  const tempRow = {
    ...selectedRow,
    selections: Array(project.sections.length).fill(false),
    anordning: selectedRow.anordning,
  };

  selectedAreas.forEach((idx) => {
    tempRow.selections[idx] = true;
  });

  const tempRows = [...rows];
  tempRows[selectedRow.index] = tempRow;

  const result = calculateSamrad(tempRows);

  const related = result.samradList
    .filter((entry) => entry.from === selectedRow.index)
    .map((entry) => tempRows[entry.to]);

  setSamrad(related);
}, [selectedAreas, selectedRow, rows, project]);

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
  const newRow = createNewRow(rows, project);

  const updatedRows = [...rows, newRow];
  const newIndex = updatedRows.length - 1;

  setRows(updatedRows);

  setSelectedRow({
    ...newRow,
    dp: '',
    linje: '',
    index: newIndex, 
  });

  setSelectedRowIndex(newIndex);

  //  Fyll selectedAreas från selections (om de finns)
  setSelectedAreas(
    newRow.selections
      ?.map((selected, index) => (selected ? index : null))
      .filter(index => index !== null) || []
  );

  setSelectedAnordning('');
  onOpen();
};

  const toggleColumn = (col) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

const handleRowClick = (row, rowIndex) => {
  setSelectedRow({
    ...row,
    dp: row.dp || '',
    linje: row.linje || '',
    index: rowIndex,
  });

  // Sätt rätt delområden från selections
  setSelectedAreas(
    row.selections?.map((val, idx) => (val ? idx : null)).filter((v) => v !== null) || []
  );

  // Sätt rätt anordning-array
  setSelectedAnordning(Array.isArray(row.anordning) ? row.anordning : []);

  onOpen();
};

const handleModalChange = (field, value) => {
  const updated = [...rows];
  if (selectedRowIndex === null) return;

  if (field === 'dp' || field === 'linje') {
    value = parseInt(value);
  }

  updated[selectedRowIndex][field] = value;
  setRows(updated);
  setSelectedRow((prev) => ({ ...prev, [field]: value }));
};


const [samrad, setSamrad] = useState([]);
const filteredRows = rows
  .filter((row) => !row.avslutad) // Visa inte avslutade i huvudtabellen
  .filter((row) =>
    filterValue === 'all' || row.namn.toLowerCase() === filterValue.toLowerCase()
  )
  .filter((row) =>
    row.namn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.telefon?.toLowerCase().includes(searchQuery.toLowerCase())
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
    <Box bg="gray.100" minH="100vh" py={10} px={[4, 8]}>
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

<Flex justify="space-between" align="center" mb={4}>
  {/* Vänster sida: Visa projekt + Filter */}
  <HStack spacing={4}>
    <Button colorScheme="blue" onClick={() => setIsProjectInfoOpen(true)}>
      Visa projekt
    </Button>
    <Flex gap={2} align="center">
      <Text fontWeight="semibold">Filter</Text>
      <Menu closeOnSelect={false}>
        <MenuButton as={IconButton} icon={<ChevronDownIcon />}>
          Kolumner
        </MenuButton>
        <MenuList>
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
    />
  </HStack>

  {/* Höger: Avslutade-knapp */}
<Button onClick={() => setAvslutadeModalOpen(true)}>Avslutade</Button>
</Flex>
<Flex gap={6} align="start" overflowX="auto">
  <Box overflowX="auto" w="100%">
    <Box minW="fit-content" w="full">
      <TableContainer bg="white" p={4} borderRadius="lg" boxShadow="md">
        <Table variant="simple" size="sm">
          <Thead bg="gray.200">
            <Tr>
              <Th width="40px" textAlign="center" py={3}>#</Th>
              <Th>BTKN</Th>
              {visibleColumns.namn && <Th>Namn</Th>}
              {visibleColumns.telefon && <Th>Telefon</Th>}
              {visibleColumns.anordning && <Th>Anordning</Th>}
              {project.sections.map((sec, idx) => (
                <Th key={idx} minW="40px" maxW="40" bg={idx % 2 === 0 ? 'yellow.100' : 'transparent'}>
                  <Flex direction="column" align="center">
                    <Text fontSize="sm">{String.fromCharCode(65 + idx)}</Text>
                  </Flex>
                </Th>
              ))}
              {visibleColumns.starttid && <Th>Starttid</Th>}
              {visibleColumns.begard && <Th>Begärd till</Th>}
              {visibleColumns.avslutat && <Th>Avslutat</Th>}
            </Tr>
          </Thead>
<Tbody>
{filteredRows
  .filter((row) => !row.avslutadRad)
  .map((row, rowIndex) => (
<Tr
  key={row.id}
  bg={rowIndex % 2 === 0 ? 'white' : 'gray.100'}
  onClick={(e) => {
    if (e.target.closest('input[type="checkbox"], textarea, select, label, button, input[type="text"]')) return;
    handleRowClick(row, rowIndex);
  }}
  _hover={{ bg: 'blue.50' }}
  cursor="pointer"
>
<Td width="40px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
  <Text color="black" fontSize="md" w="40px" textAlign="center">
    {rowIndex + 1}
  </Text>
</Td>

      <Td width="80px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
        <Text color="black" fontSize="md" w="80px" isTruncated>
          {row.btkn}
        </Text>
      </Td>

{visibleColumns.namn && (
  <Td minW="140px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
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
    color="black"
    fontSize="md"
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
        <Td maxW="145px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
          <Text color="black" fontSize="md" w="145px" isTruncated>
            {row.telefon}
          </Text>
        </Td>
      )}

{visibleColumns.anordning && (
  <Td maxW="100px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
    <Text color="black" fontSize="md" w="100px" isTruncated>
      {Array.isArray(row.anordning) ? row.anordning.join(', ') : row.anordning}
    </Text>
  </Td>
)}
{project.sections.map((_, secIdx) => (
  <Td
    key={secIdx}
    width="100px"
    bg={secIdx % 2 === 0 ? 'yellow.50' : 'transparent'}
    borderRight="1px solid rgba(0, 0, 0, 0.1)"
    onClick={(e) => e.stopPropagation()} // Hindrar att modalen öppnas
  >
    <Flex justify="center">
      <Checkbox
        isChecked={row.selections[secIdx]}
onChange={(e) => {
  const updatedRows = [...rows];
  if (!updatedRows[rowIndex]) return;

  const updatedSelections = [...(updatedRows[rowIndex].selections || [])];
  updatedSelections[secIdx] = e.target.checked;
  updatedRows[rowIndex].selections = updatedSelections;
  setRows(updatedRows);
}}
      />
    </Flex>
  </Td>
))}
      {visibleColumns.starttid && (
        <Td width="90px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
          <Text color="black" fontSize="md" w="90px" isTruncated>
            {row.starttid}
          </Text>
        </Td>
      )}

      {visibleColumns.begard && (
        <Td width="90px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
          <Text color="black" fontSize="md" w="90px" isTruncated>
            {row.begard}
          </Text>
        </Td>
      )}

      {visibleColumns.avslutat && (
        <Td width="90px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
          <Text color="black" fontSize="md" w="90px" isTruncated>
            {row.avslutat}
          </Text>
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
    </Box>
  </Box>
</Flex>

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
            isChecked={selectedAreas.includes(idx)}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setSelectedAreas((prev) =>
                isChecked
                  ? [...prev, idx]
                  : prev.filter((i) => i !== idx)
              );
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
              <FormControl>
                <FormLabel>Starttid</FormLabel>
                <Input type="time" value={selectedRow.starttid} onChange={(e) => handleModalChange('starttid', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Begärd till</FormLabel>
                <Input type="time" value={selectedRow.begard} onChange={(e) => handleModalChange('begard', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Avslutat</FormLabel>
                <Input type="time" value={selectedRow.avslutat} onChange={(e) => handleModalChange('avslutat', e.target.value)} />
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
            {samrad.length > 0 ? (
              <Stack spacing={2}>
{samrad.map((row, idx) => (
  <Box key={idx} p={2} border="1px solid #ddd" borderRadius="md" bg="white">
    <Flex justify="space-between" align="center">
      <Box>
        <Text fontSize="sm"><strong>Namn:</strong> {row.namn}</Text>
        <Text fontSize="sm"><strong>Telefon:</strong> {row.telefon}</Text>
      </Box>
      <Checkbox
        isChecked={avklaradSamrad[row.id] || false}
        onChange={() =>
          setAvklaradSamrad((prev) => ({
            ...prev,
            [row.id]: !prev[row.id],
          }))
        }
      >
        Avklarad
      </Checkbox>
    </Flex>
  </Box>
))}
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
        const updatedRow = { ...selectedRow, avslutadRad: true };
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
<Modal isOpen={avslutadeModalOpen} onClose={() => setAvslutadeModalOpen(false)} size="lg">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Avslutade poster</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Input
        placeholder="Sök efter namn eller telefon..."
        mb={4}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Stack spacing={4}>
        {rows
          .filter(
            (row) =>
              row.avslutadRad === true &&
              (row.namn.toLowerCase().includes(searchQuery.toLowerCase()) ||
               row.telefon.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((row, index) => (
            <Box key={index} p={3} border="1px solid #ccc" borderRadius="md">
              <Text><strong>Namn:</strong> {row.namn}</Text>
              <Text><strong>Telefon:</strong> {row.telefon}</Text>
              <Button
                mt={2}
                size="sm"
                onClick={() => {
                  const updatedRows = [...rows];
                  const actualIndex = rows.findIndex(
                    (r) => r.id === row.id
                  );
                  updatedRows[actualIndex].avslutadRad = false;
                  setRows(updatedRows);
                }}
              >
                Återställ
              </Button>
            </Box>
          ))
        }

        {rows.filter(
          (row) =>
            row.avslutadRad === true &&
            (row.namn.toLowerCase().includes(searchQuery.toLowerCase()) ||
             row.telefon.toLowerCase().includes(searchQuery.toLowerCase()))
        ).length === 0 && (
          <Text color="gray.500">Inga träffar.</Text>
        )}
      </Stack>
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