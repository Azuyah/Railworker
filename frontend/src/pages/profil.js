import React, { useState, useEffect } from 'react';
import {
  Box, Button, Input, FormControl, FormLabel, VStack, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Text, Flex, useToast, Divider
} from '@chakra-ui/react';
import axios from 'axios';
import Header from '../components/Header';
import { apiUrl } from '../lib/api';

const Profil = () => {
  const [editing, setEditing] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(apiUrl('/api/user'), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLocalUser(res.data);
        fetchEmployees();
      } catch (err) {
        console.error('Kunde inte hämta användare:', err);
        toast({ title: 'Fel vid hämtning av användare', status: 'error', duration: 3000, isClosable: true });
      }
    };

    const fetchEmployees = async () => {
      try {
        const res = await axios.get(apiUrl('/api/employees'), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEmployees(res.data);
      } catch (err) {
        console.error('Kunde inte hämta anställda:', err);
      }
    };

    fetchUser();
  }, [toast]);

  const handleChange = (field, value) => {
    setLocalUser(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteEmployee = async (employeeId) => {
  try {
    await axios.delete(apiUrl(`/api/employees/${employeeId}`), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  } catch (err) {
    console.error('Kunde inte ta bort anställd:', err);
  }
};

  const handleSave = async () => {
    try {
      const res = await axios.put(apiUrl('/api/user'), localUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedUser = res.data;
      setLocalUser(updatedUser);
      const existingStoredUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (existingStoredUser?.token) {
        localStorage.setItem('user', JSON.stringify({
          ...existingStoredUser,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          company: updatedUser.company,
          signature: updatedUser.signature,
          role: updatedUser.role,
        }));
      }
      setEditing(false);
      onClose();
      toast({ title: 'Ändringar sparade', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      console.error('Fel vid sparande:', err);
      toast({ title: 'Kunde inte spara användarinfo', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleAddEmployee = async () => {
    try {
      const res = await axios.post(apiUrl('/api/employees'), {
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

  const isTsm = localUser?.role === 'TSM';
  const profileFields = isTsm
    ? [
        { key: 'firstName', label: 'Förnamn', type: 'text' },
        { key: 'lastName', label: 'Efternamn', type: 'text' },
        { key: 'company', label: 'Företag', type: 'text' },
        { key: 'phone', label: 'Telefon', type: 'text' },
      ]
    : [
        { key: 'firstName', label: 'Förnamn', type: 'text' },
        { key: 'lastName', label: 'Efternamn', type: 'text' },
        { key: 'company', label: 'Företag', type: 'text' },
        { key: 'phone', label: 'Telefon', type: 'text' },
        { key: 'email', label: 'E-post', type: 'text' },
        { key: 'password', label: 'Lösenord', type: 'password' },
      ];

  return (
    <Box minH="100vh" bg="gray.100">
      <Header />
      <Flex pt="120px" px={6} pb={12} maxW="6xl" mx="auto" gap={6} align="flex-start" direction={{ base: 'column', xl: 'row' }}>

        {/* Profilsektion */}
        <Box flex={1} bg="white" p={8} rounded="2xl" shadow="lg" border="1px solid" borderColor="blue.100">
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.32em" color="blue.700" fontWeight="700">Profil</Text>
          <Text fontSize="2xl" fontWeight="bold" mb={2} mt={2}>Min profil</Text>
          <Text fontSize="sm" color="gray.600" mb={6}>
            Håll dina uppgifter uppdaterade så att namn, signatur och kontaktvägar blir rätt i appen.
          </Text>

          <VStack spacing={4} align="stretch">
            {profileFields.map(({ key, label, type }) => (
              <FormControl key={key}>
                <FormLabel color="gray.800" fontWeight="600">{label}</FormLabel>
                <Input
                  type={type}
                  value={localUser?.[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  isDisabled={!editing && key !== 'password'}
                  borderRadius="xl"
                  bg={!editing && key !== 'password' ? 'gray.50' : 'white'}
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
        {!isTsm && (
        <Box flex={1} bg="white" p={8} rounded="2xl" shadow="lg" border="1px solid" borderColor="emerald.100">
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.32em" color="emerald.700" fontWeight="700">Team</Text>
          <Text fontSize="2xl" fontWeight="bold" mb={2} mt={2}>Mina anställda</Text>
          <Text fontSize="sm" color="gray.600" mb={6}>
            Lägg till och hantera de personer som ska finnas tillgängliga i ert arbetsflöde.
          </Text>

          <FormControl mb={4}>
            <FormLabel color="gray.800" fontWeight="600">Lägg till med e-postadress</FormLabel>
            <Flex>
              <Input
                placeholder="E-postadress"
                value={newEmployeeEmail}
                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                borderRadius="xl"
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
<Box
  borderWidth="1px"
  borderRadius="xl"
  p={4}
  mb={4}
  bg="gray.50"
  display="flex"
  justifyContent="space-between"
  alignItems="center"
>
  <Box>
    <Text> Namn: <strong>{emp.employee?.name || 'Okänd'}</strong> </Text>
    <Text> Telefon: <strong>{emp.employee?.phone || 'Okänd'}</strong> </Text>
    <Text> E-post: <strong>{emp.employee?.email || 'Okänd'}</strong> </Text>
  </Box>

  <Button
    colorScheme="red"
    size="sm"
    onClick={() => handleDeleteEmployee(emp.id)}
  >
    Ta bort
  </Button>
</Box>
              ))
            )}
          </VStack>
        </Box>
        )}
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
