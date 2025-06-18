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
  const [editingRow, setEditingRow] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [showAvslutade, setShowAvslutade] = useState(false);
  const [avslutadeModalOpen, setAvslutadeModalOpen] = useState(false);
const [avslutadeRows, setAvslutadeRows] = useState([]);
const { isOpen: isAvslutadeOpen, onOpen: onOpenAvslutade, onClose: onCloseAvslutade } = useDisclosure();
const [searchQuery, setSearchQuery] = useState('');
const [currentProject, setCurrentProject] = useState(null);
  const [avklaradSamrad, setAvklaradSamrad] = useState({});
  const [loading, setLoading] = useState(true);
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
  const [selectedAreas, setSelectedAreas] = useState([]);


const sparaProjekt = async () => {
  try {
    const tokenData = localStorage.getItem('user');
    const token = tokenData ? JSON.parse(tokenData).token : null;

    if (!project || !project.id) {
      console.error('❌ Projekt är null eller saknar id');
      toast({
        title: 'Fel',
        description: 'Ingen giltig projektdata att spara.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedProject = {
      id: project.id,
      name: project.name || '',
      startDate: project.startDate || '',
      startTime: project.startTime || '',
      endDate: project.endDate || '',
      endTime: project.endTime || '',
      plats: project.plats || '',
      namn: project.namn || '',
      telefonnummer: project.telefonnummer || '',
      sections: project.sections || [],
      rows: rows || [],
    };

    await axios.put(
      `https://railworker-production.up.railway.app/api/projects/${project.id}`,
      updatedProject,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast({
      title: 'Projekt sparat',
      description: 'Alla ändringar har sparats.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  } catch (error) {
    console.error('Fel vid sparning:', error);
    if (error.response) {
      console.error('Statuskod:', error.response.status);
      console.error('Svar:', error.response.data);
    }

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
  if (!rows || selectedRow === null) return;

  const shared = rows.filter((row, i) => {
    if (i === selectedRow.index) return false;
    return selectedAreas.some((area) => row.selections[area]);
  });

  setSamrad(shared);
}, [selectedAreas, rows, selectedRow]);

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
      setProject(current);
      
setRows(current.rows && current.rows.length > 0 ? current.rows : [
  {
    id: 1,
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
    selections: current.sections.map(() => false),
    samrad: [],
  },
]);


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

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
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
      },
    ]);
    setSelectedAreas([]);
  };

  const toggleColumn = (col) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

const handleRowClick = (row, rowIndex) => {
  setSelectedRow({
    ...row,
    index: rowIndex,
    dp: row.dp || '',
    linje: row.linje || ''
  });
  setSelectedAreas(row.selectedAreas || []);
  onOpen();
};

const handleModalChange = (field, value) => {
  const updated = [...rows];
  const index = selectedRow.index;

  if (field === 'dp' || field === 'linje') {
    value = parseInt(value);
  }

  updated[index][field] = value;
  setRows(updated);
  setSelectedRow((prev) => ({ ...prev, [field]: value }));
};

const getSharedContacts = () => {
  if (!selectedRow) return [];

  return rows.filter((row) => {
    if (row.id === selectedRow.id) return false;
    return row.selections?.some(
      (val, idx) => val && selectedRow.selections?.[idx]
    );
  });
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

const handleModalSave = () => {
  const updatedRows = [...rows];
  const index = selectedRow.index;

  updatedRows[index] = {
    ...updatedRows[index],
    ...selectedRow, // Kopiera över namn, anteckning, telefon etc.
    selections: Array(project.sections.length).fill(false),
    selectedAreas: [...selectedAreas],
  };

  // Markera valda områden
  selectedAreas.forEach((idx) => {
    updatedRows[index].selections[idx] = true;
  });
  updatedRows[index].samrad = samrad.filter((s) =>
  selectedAreas.some((idx) => s.selections?.[idx])
);

  setRows(updatedRows);
  onClose();
};

  return (
    <Box bg="gray.100" minH="100vh" py={10} px={[4, 8]}>
      <Header />
      <Box maxW="1600px" mx="auto" mt={24}>
        <Flex bg="white" p={6} borderRadius="lg" boxShadow="xl" justify="space-between" mb={6}>
          <Box>
            <Heading size="lg" mb={2}>Projektnamn: {project.name}</Heading>
            <Text><strong>Plats:</strong> {project.plats}</Text>
            <Text><strong>Startdatum:</strong> {project.startDate} {project.startTime}</Text>
            <Text><strong>Slutdatum:</strong> {project.endDate} {project.endTime}</Text>
            <Text><strong>FJTKL:</strong> {project.namn} ({project.telefonnummer})</Text>
            <Text><strong>Beteckningar:</strong> {project.beteckningar.map(b => b.value).join(', ')}</Text>
          </Box>
          <Box textAlign="right">
            <Text fontWeight="bold">Dispositionsarbetsplan avslutas:</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">{countdown}</Text>
          </Box>
        </Flex>

        <Flex gap={4} mb={4} align="center">
          <Button colorScheme="red" onClick={async () => {
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
          }}>Ta bort projekt</Button>

          <Button colorScheme="blue" onClick={() => toast({
            title: 'Redigering',
            description: 'Redigeringsfunktion kommer snart!',
            status: 'info',
            duration: 3000,
            isClosable: true,
          })}>
            Redigera projekt
          </Button>
        </Flex>

<Flex justify="space-between" align="center" mb={4}>

  {/* Vänster: Filter + Sökfält */}

  <HStack spacing={4}>
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
              <Th>BTKN</Th>
              {visibleColumns.namn && <Th>Namn</Th>}
              {visibleColumns.telefon && <Th>Telefon</Th>}
              {visibleColumns.anordning && <Th>Anordning</Th>}
              {project.sections.map((sec, idx) => (
                <Th key={idx} minW="40px" maxW="40" bg={idx % 2 === 0 ? 'yellow.100' : 'transparent'}>
                  <Flex direction="column" align="center">
                    <Textarea
                      value={sec.signal ?? ''}
                      onChange={(e) => {
                        const updatedSections = [...project.sections];
                        updatedSections[idx].signal = e.target.value;
                        setProject({ ...project, sections: updatedSections });
                      }}
                      resize="none"
                      rows={2}
                      textAlign="center"
                      fontWeight="bold"
                      fontSize="xs"
                      borderColor="gray.300"
                      mb={1}
                      px={1}
                      py={1}
                    />
                    <Text fontSize="sm">{sec.type} {String.fromCharCode(65 + idx)}</Text>
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
onClick={(e) => {
  if (e.target.closest('input[type="checkbox"], textarea, select, label, button, input[type="text"]')) return;
  handleRowClick(row, rowIndex);
}}
      _hover={{ bg: 'blue.50' }}
      cursor="pointer"
    >
      <Td width="80px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
        <Text color="black" fontSize="md" w="80px" isTruncated>
          {row.btkn}
        </Text>
      </Td>

{visibleColumns.namn && (
  <Td minW="130px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
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
    {row.samrad.map((r, idx) => (
      <Text key={idx} fontSize="sm">{r.namn}</Text>
    ))}
  </Stack>
) : (
  <Text fontSize="sm" color="gray.500">Inga samråd</Text>
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
    w="130px"
    isTruncated
    cursor="help"
  >
    {row.namn}
  </Text>
</Tooltip>
  </Td>
)}

      {visibleColumns.telefon && (
        <Td maxW="115px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
          <Text color="black" fontSize="md" w="160px" isTruncated>
            {row.telefon}
          </Text>
        </Td>
      )}

      {visibleColumns.anordning && (
        <Td maxW="100px" borderRight="1px solid rgba(0, 0, 0, 0.1)">
          <Text color="black" fontSize="md" w="100px" isTruncated>
            {row.anordning}
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
        <Button onClick={addRow} colorScheme="blue" mt={4}>+ Lägg till rad</Button>
        <Button onClick={sparaProjekt} colorScheme="blue" mt={4} ml={4}>
  Spara
</Button>
      </TableContainer>
    </Box>
  </Box>
</Flex>

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
                <Input value={selectedRow.anordning} onChange={(e) => handleModalChange('anordning', e.target.value)} />
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
<FormControl mt={6}>
  <Checkbox
    isChecked={selectedRow?.avslutadRad || false}
    onChange={(e) => handleModalChange('avslutadRad', e.target.checked)}
  >
    Avslutad
  </Checkbox>
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
    <ModalFooter>
      <Button colorScheme="blue" mr={3} onClick={handleModalSave}>Spara</Button>
      <Button onClick={onClose}>Stäng</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
<Modal isOpen={avslutadeModalOpen} onClose={() => setAvslutadeModalOpen(false)} size="lg">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Avslutade poster</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Stack spacing={4}>
        {rows
          .filter((row) => row.avslutadRad)
          .map((row, index) => (
            <Box key={index} p={3} border="1px solid #ccc" borderRadius="md">
              <Text><strong>Namn:</strong> {row.namn}</Text>
              <Text><strong>Telefon:</strong> {row.telefon}</Text>
              <Button
                mt={2}
                size="sm"
                onClick={() => {
                  const updatedRows = [...rows];
                  updatedRows[index].avslutadRad = false;
                  setRows(updatedRows);
                }}
              >
                Återställ
              </Button>
            </Box>
          ))}
      </Stack>
    </ModalBody>
    <ModalFooter>
      <Button onClick={() => setAvslutadeModalOpen(false)}>Stäng</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
    </Box>
    </Box>

    
  );
};

export default Plan;