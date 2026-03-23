import { useCallback, useEffect, useState } from 'react';
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

  const userIsInProject = useCallback(
    (project) => Array.isArray(project.rows) && project.rows.some((row) => row.userId === user?.id),
    [user?.id]
  );

  const handleSelfEnroll = async () => {
    try {
      const token = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')).token
        : null;

      const selections = selectedProject.sections.map((sec) =>
        selectedSectionIds.includes(sec.id)
      );

      await axios.post(
        'http://localhost:4000/api/row/self-enroll',
        {
          anordning,
          selections,
          begard,
          begardDatum,
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

      toast({
        title: 'Du har anmält dig.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setBegard('');
      setBegardDatum('');
      setAnteckning('');
      setAnordning([]);
      setSelectedSectionIds([]);
      setEnrolledProjects((prev) => [...prev, selectedProject]);
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
        'http://localhost:4000/api/projects',
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
                          Anmäl dig
                        </Button>
                      )}
                      <button
                        onClick={() => navigate(`/plan/${project.id}`)}
                        className="text-blue-600 underline-link font-medium"
                      >
                        Visa projekt
                      </button>
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
                    className="border rounded p-4 flex justify-between items-center transition duration-200 hover:shadow-md"
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">{project.plats}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/plan/${project.id}`)}
                      className="text-blue-600 underline-link font-medium"
                    >
                      Visa projekt
                    </button>
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
          <ModalHeader>Anmäl dig till projektet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Namn</FormLabel>
                  <Input value={`${user?.firstName || ''} ${user?.lastName || ''}`} isDisabled />
                </FormControl>
                <FormControl>
                  <FormLabel>Telefon</FormLabel>
                  <Input value={user?.phone || ''} isDisabled />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Anordning</FormLabel>
                  <Menu closeOnSelect={false}>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      {anordning.length ? `${anordning.length} valda` : 'Välj anordning'}
                    </MenuButton>
                    <MenuList>
                      {['A-S', 'L-S', 'S-S', 'E-S', 'Spf', 'Vxl'].map(opt => (
                        <MenuItem key={opt}>
                          <Checkbox
                            isChecked={anordning.includes(opt)}
                            onChange={e =>
                              setAnordning(prev =>
                                e.target.checked ? [...prev, opt] : prev.filter(v => v !== opt),
                              )
                            }
                          >
                            {opt}
                          </Checkbox>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>

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
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Begärd tid</FormLabel>
                  <Input type="time" value={begard} onChange={e => setBegard(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Begärd datum</FormLabel>
                  <Input
                    type="date"
                    value={begardDatum}
                    onChange={e => setBegardDatum(e.target.value)}
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
