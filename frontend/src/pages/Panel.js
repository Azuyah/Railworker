import { useEffect, useState } from 'react';
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
  Text,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  VStack,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import Header from '../components/Header';
import LoadingScreen from '../components/LoadingScreen';

export default function Panel() {
  const { isOpen, onOpen, onClose } = useDisclosure(); // ✅ FLYTTAD HIT
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userDataRaw = localStorage.getItem('user');
  const user = userDataRaw ? JSON.parse(userDataRaw) : null;
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);
  const [datum, setDatum] = useState('');
  const [begardDatum, setBegardDatum] = useState('');
  const [begardTid, setBegardTid] = useState('');
  const [anteckning, setAnteckning] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [anordning, setAnordning] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else {
      fetchAllProjects();
    }
  }, []);
const handleSelfEnroll = async () => {
  try {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')).token
      : null;

    // Skapa selections-array: t.ex. [true, false, true, false, false, true]
    const selections = selectedProject.sections.map((sec) =>
      selectedSectionIds.includes(sec.id)
    );

        // 🛠 Konvertera datum + tid till ISO-strängar
    const datumISO = datum ? new Date(datum).toISOString() : null;
    const begardDatumISO = begardDatum ? new Date(begardDatum).toISOString() : null;

    // Kombinera begärd datum + tid om du har båda
    const combinedBegard = begardDatum && begardTid
      ? new Date(`${begardDatum}T${begardTid}`).toISOString()
      : null;

    const response = await axios.post(
      'https://railworker-production.up.railway.app/api/row/self-enroll',
      {
        datum,
        anordning,
        selections,
        begard: begardTid || '',
        begardDatum: begardDatum || '',
        anteckning, 
        projectId: selectedProject.id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast({
      title: 'Du har anmält dig.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    onClose();
    setDatum('');
    setBegardTid('');
    setBegardDatum('');
    setAnteckning('');
    setAnordning([]);
    setSelectedSectionIds([]);
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

const fetchAllProjects = async () => {
  try {
    const token = localStorage.getItem('token'); // 🟢 Du behöver detta!

    const response = await axios.get('https://railworker-production.up.railway.app/api/projects', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setProjects(response.data);

  } catch (error) {
    console.error('❌ Kunde inte hämta projekt:', error);
    setProjects([]);
  }
};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Menu */}
      <Header />

      {/* Projects List Only */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4">Alla projekt</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">Inga projekt hittades.</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="border rounded p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-600">{project.plats}</p>
                    )}
                  </div>
                  {user?.role === 'TSM' && (
<Button
  onClick={() => {
    setSelectedProject(project); // 🔵 Spara valt projekt
    onOpen();
  }}
  colorScheme="blue"
>
  Anmäl dig
</Button>
)}
<button
  onClick={() => navigate(`/plan/${project.id}`)}
  className="text-blue-600 hover:underline"
>
  Visa projekt
</button>
<Modal isOpen={isOpen} onClose={onClose} size="xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Anmäl dig till projektet</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Stack spacing={6}>
        {/* RAD 1 */}
        <SimpleGrid columns={2} spacing={4}>
          <FormControl>
            <FormLabel>Namn</FormLabel>
            <Input value={user?.firstName + ' ' + user?.lastName} isDisabled />
          </FormControl>

          <FormControl>
            <FormLabel>Telefon</FormLabel>
            <Input value={user?.phone || ''} isDisabled />
          </FormControl>
        </SimpleGrid>

        {/* RAD 2 */}
        <SimpleGrid columns={2} spacing={4}>
          <FormControl>
            <FormLabel>Anordning</FormLabel>
            <Menu closeOnSelect={false}>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {anordning.length > 0 ? `${anordning.length} valda` : 'Välj anordning'}
              </MenuButton>
              <MenuList maxHeight="300px" overflowY="auto">
                {['A-S', 'L-S', 'S-S', 'E-S', 'Spf', 'Vxl'].map((option) => (
                  <MenuItem key={option}>
                    <Checkbox
                      isChecked={anordning.includes(option)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setAnordning((prev) =>
                          isChecked ? [...prev, option] : prev.filter((v) => v !== option)
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
            <FormLabel>Delområden</FormLabel>
            <Menu closeOnSelect={false} portal={false}>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {selectedSectionIds.length > 0
                  ? `${selectedSectionIds.length} valda`
                  : 'Välj delområden'}
              </MenuButton>
              <MenuList
                maxH="300px"
                overflowY="auto"
                zIndex={9999}
                sx={{
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                  },
                }}
              >
                {selectedProject?.sections?.map((sec, idx) => (
                  <MenuItem key={sec.id} whiteSpace="normal">
                    <Checkbox
                      isChecked={selectedSectionIds.includes(sec.id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const updated = isChecked
                          ? [...selectedSectionIds, sec.id]
                          : selectedSectionIds.filter((id) => id !== sec.id);
                        setSelectedSectionIds(updated);
                      }}
                    >
                      {sec.type} {String.fromCharCode(65 + idx)} ({sec.name})
                    </Checkbox>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>
        </SimpleGrid>

        {/* RAD 3 */}
        <SimpleGrid columns={2} spacing={4}>

          <FormControl>
            <FormLabel>Begärd till (datum)</FormLabel>
            <Input
              type="date"
              value={begardDatum}
              onChange={(e) => setBegardDatum(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Begärd till (tid)</FormLabel>
            <Input
              type="time"
              value={begardTid}
              onChange={(e) => setBegardTid(e.target.value)}
            />
          </FormControl>
        </SimpleGrid>

        {/* ANTECKNINGAR */}
        <FormControl>
          <FormLabel>Anteckningar</FormLabel>
          <Textarea
            placeholder="Ange anteckningar..."
            value={anteckning}
            onChange={(e) => setAnteckning(e.target.value)}
          />
        </FormControl>
      </Stack>
    </ModalBody>
    <ModalFooter>
<Button
  colorScheme="blue"
  onClick={handleSelfEnroll}
  isDisabled={
    !begardDatum || !begardTid || anordning.length === 0 || selectedSectionIds.length === 0
  }
>
  Skicka
</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}