import React, { useState, useEffect } from 'react';
import {
  Box, Button, Input, FormControl, FormLabel, VStack, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Text, Flex, useToast, Divider
} from '@chakra-ui/react';
import axios from 'axios';
import Header from '../components/Header';

const Profil = () => {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('https://railworker-production.up.railway.app/api/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUser(res.data);
        setLocalUser(res.data);
        fetchEmployees();
      } catch (err) {
        console.error('Kunde inte hämta användare:', err);
        setError('Fel vid hämtning av användare');
      }
    };

    const fetchEmployees = async () => {
      try {
        const res = await axios.get('https://railworker-production.up.railway.app/api/employees', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEmployees(res.data);
      } catch (err) {
        console.error('Kunde inte hämta anställda:', err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (field, value) => {
    setLocalUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put('https://railworker-production.up.railway.app/api/user', localUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUser(localUser);
      setEditing(false);
      setSuccess(true);
      onClose();
      toast({ title: 'Ändringar sparade', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      console.error('Fel vid sparande:', err);
      setError('Kunde inte spara användarinfo');
    }
  };

  const handleAddEmployee = async () => {
    try {
      const res = await axios.post('https://railworker-production.up.railway.app/api/employees', {
        email: newEmployeeEmail
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEmployees([...employees, res.data]);
      setNewEmployeeEmail('');
      toast({ title: 'Anställd tillagd', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      console.error('Kunde inte lägga till anställd:', err);
      toast({ title: 'Fel: Användaren finns inte eller går inte att lägga till', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const labels = {
    company: 'Företag',
    name: 'Namn',
    phone: 'Telefon',
    email: 'E-post',
    password: 'Lösenord'
  };

  return (
    <Box minH="100vh" bg="gray.100">
      <Header />
      <Flex pt="100px" px={6} maxW="6xl" mx="auto" gap={6} align="flex-start">

        {/* Profilsektion */}
        <Box flex={1} bg="white" p={8} rounded="md" shadow="md">
          <Text fontSize="2xl" fontWeight="bold" mb={6}>Min profil</Text>

          <VStack spacing={4} align="stretch">
            {Object.keys(labels).map((field) => (
              <FormControl key={field}>
                <FormLabel>{labels[field]}</FormLabel>
                <Input
                  type={field === 'password' ? 'password' : 'text'}
                  value={localUser?.[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  isDisabled={!editing && field !== 'password'}
                />
              </FormControl>
            ))}
          </VStack>

          <Box mt={6} textAlign="center">
            {!editing ? (
              <Button colorScheme="blue" onClick={() => setEditing(true)}>
                Ändra uppgifter
              </Button>
            ) : (
              <Button colorScheme="green" onClick={onOpen}>
                Spara ändringar
              </Button>
            )}
          </Box>
        </Box>

        {/* Anställda */}
        <Box flex={1} bg="white" p={8} rounded="md" shadow="md">
          <Text fontSize="2xl" fontWeight="bold" mb={6}>Mina anställda</Text>

          <FormControl mb={4}>
            <FormLabel>Lägg till med e-postadress</FormLabel>
            <Flex>
              <Input
                placeholder="E-postadress"
                value={newEmployeeEmail}
                onChange={(e) => setNewEmployeeEmail(e.target.value)}
              />
              <Button ml={2} colorScheme="blue" onClick={handleAddEmployee}>
                Lägg till
              </Button>
            </Flex>
          </FormControl>

          <Divider my={4} />

          <VStack align="stretch" spacing={3}>
            {employees.length === 0 ? (
              <Text>Inga anställda ännu.</Text>
            ) : (
              employees.map(emp => (
                <Box key={emp.id} p={3} borderWidth={1} rounded="md">
                  <Text><strong>Namn:</strong> {emp.name || 'Okänd'}</Text>
                  <Text><strong>E-post:</strong> {emp.email}</Text>
                </Box>
              ))
            )}
          </VStack>
        </Box>
      </Flex>

      {/* Bekräftelsemodal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bekräfta ändringar</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Är du säker på att du vill spara ändringarna?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleSave}>
              Ja, spara
            </Button>
            <Button onClick={onClose}>Avbryt</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profil;