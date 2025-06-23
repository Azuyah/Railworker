import React, { useState, useEffect } from 'react';
import {
  Box, Button, Input, FormControl, FormLabel,
  VStack, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Text
} from '@chakra-ui/react';
import axios from 'axios';
import Header from '../components/Header';

const Profil = () => {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [error, setError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('https://railworker-production.up.railway.app/api/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUser(res.data);
        setLocalUser(res.data);
      } catch (err) {
        console.error('❌ Kunde inte hämta användare:', err);
        setError('Fel vid hämtning av användare');
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
      onClose();
    } catch (err) {
      console.error('❌ Fel vid sparande:', err);
      setError('Kunde inte spara användarinfo');
    }
  };

  const labels = {
    company: 'Företag',
    name: 'Namn',
    phone: 'Telefon',
    email: 'E-post',
    password: 'Lösenord',
  };

  return (
    <Box minH="100vh" bg="gray.100">
      <Header />
      <Box pt="120px" px={6} maxW="lg" mx="auto">
        <Box bg="white" p={8} rounded="md" shadow="md">
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
      </Box>

      {/* Modal */}
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