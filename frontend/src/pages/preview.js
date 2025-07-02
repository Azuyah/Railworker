import React, { useState } from 'react';
import { CheckIcon } from '@chakra-ui/icons';
import {
  ChakraProvider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Stack,
  Text,
  Box,
  Flex,
  useDisclosure,
  SlideFade,
  Icon,
} from '@chakra-ui/react';
import { ChevronDownIcon, CalendarIcon, TimeIcon, PhoneIcon, EditIcon, InfoIcon } from '@chakra-ui/icons';

const Preview = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedRow, setSelectedRow] = useState({
    id: 1,
    btkn: '',
    namn: '',
    telefon: '',
    anordning: [],
    anteckning: '',
    samrad: [{ id: 2 }, { id: 3 }],
    startdatum: '',
    begardDatum: '',
    avslutatDatum: '',
    starttid: '',
    begard: '',
    avslutat: '',
    selectedAreas: [],
    selections: Array(10).fill(false),
  });

  const [rows, setRows] = useState([
    { id: 2, namn: 'Anna Andersson', telefon: '0701234567' },
    { id: 3, namn: 'Björn Berg', telefon: '0737654321' },
  ]);

  const [selectedAreas, setSelectedAreas] = useState([]);
  const [avklaradSamrad, setAvklaradSamrad] = useState({});

  const handleModalChange = (field, value) => {
    setSelectedRow((prev) => ({ ...prev, [field]: value }));
  };

  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => new Date().toTimeString().split(':').slice(0, 2).join(':');

  return (
    <ChakraProvider>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="5xl" motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" boxShadow="dark-lg" border="1px solid #ccc" bg="white">
          <ModalHeader fontSize="2xl" fontWeight="bold" borderBottom="1px solid #eee">
            <Flex align="center" gap={2}><Icon as={EditIcon} />Redigera rad</Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SlideFade in={isOpen} offsetY="20px">
              <SimpleGrid columns={2} spacing={8}>
                <Stack spacing={4}>
                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel>BTKN</FormLabel>
                      <Input value={selectedRow.btkn} onChange={(e) => handleModalChange('btkn', e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Anordning</FormLabel>
                      <Menu closeOnSelect={false}>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}> {selectedRow.anordning.length > 0 ? `${selectedRow.anordning.length} valda` : 'Välj anordning(ar)'} </MenuButton>
<MenuList maxHeight="300px" overflowY="auto">
  {['A-S', 'L-S', 'S-S', 'E-S', 'Spf', 'Vxl'].map((option) => {
    let color = 'gray';
    switch (option) {
      case 'A-S':
        color = 'blue';
        break;
      case 'L-S':
        color = 'green';
        break;
      case 'S-S':
        color = 'orange';
        break;
      case 'E-S':
        color = 'red';
        break;
      case 'Spf':
        color = 'yellow';
        break;
      case 'Vxl':
        color = 'purple';
        break;
      default:
        color = 'gray';
    }

    return (
      <MenuItem key={option}>
        <Checkbox
          isChecked={selectedRow.anordning.includes(option)}
          onChange={(e) => {
            const isChecked = e.target.checked;
            handleModalChange(
              'anordning',
              isChecked
                ? [...selectedRow.anordning, option]
                : selectedRow.anordning.filter((val) => val !== option)
            );
          }}
        >
          <Flex align="center" gap={2}>
            <Box w="10px" h="10px" borderRadius="full" bg={`${color}.500`} />
            {option}
          </Flex>
        </Checkbox>
      </MenuItem>
    );
  })}
</MenuList>
                      </Menu>
                    </FormControl>
                    <FormControl>
                      <FormLabel><Icon as={InfoIcon} mr={1} />Namn</FormLabel>
                      <Input value={selectedRow.namn} onChange={(e) => handleModalChange('namn', e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel><Icon as={PhoneIcon} mr={1} />Telefon</FormLabel>
                      <Input value={selectedRow.telefon} onChange={(e) => handleModalChange('telefon', e.target.value)} />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={3} spacing={4}>
                    {['startdatum', 'begardDatum', 'avslutatDatum'].map((field) => (
                      <FormControl key={field}>
                        <FormLabel><Icon as={CalendarIcon} mr={1} />{field === 'startdatum' ? 'Startdatum' : field === 'begardDatum' ? 'Begärd datum' : 'Avslutat datum'}</FormLabel>
                        <Input type="date" value={selectedRow[field]} onChange={(e) => handleModalChange(field, e.target.value)} />
                        <Button size="xs" mt={1} onClick={() => handleModalChange(field, getCurrentDate())}>Sätt dagens datum</Button>
                      </FormControl>
                    ))}
                  </SimpleGrid>

                  <SimpleGrid columns={3} spacing={4}>
                    {['starttid', 'begard', 'avslutat'].map((field) => (
                      <FormControl key={field}>
                        <FormLabel><Icon as={TimeIcon} mr={1} />{field === 'starttid' ? 'Starttid' : field === 'begard' ? 'Begärd till' : 'Avslutat'}</FormLabel>
                        <Input type="time" value={selectedRow[field]} onChange={(e) => handleModalChange(field, e.target.value)} />
                        <Button size="xs" mt={1} onClick={() => handleModalChange(field, getCurrentTime())}>Sätt aktuell tid</Button>
                      </FormControl>
                    ))}
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Anteckning</FormLabel>
                    <Textarea value={selectedRow.anteckning} onChange={(e) => handleModalChange('anteckning', e.target.value)} />
                  </FormControl>
                </Stack>

<Box
  bg="gray.50"
  p={3}
  borderRadius="md"
  boxShadow="sm"
>
  <Text fontWeight="semibold" fontSize="md" mb={2}>
    Samråd
  </Text>

  {selectedRow?.samrad?.length > 0 ? (
    <SimpleGrid columns={2} spacing={3}>
      {selectedRow.samrad.map((samradItem, idx) => {
        const person = rows.find((r) => r.id === samradItem.id);
        if (!person) return null;

        const isActive = avklaradSamrad[selectedRow.id]?.[person.id] || false;

        return (
          <Box
            key={idx}
            position="relative"
            p={3}
            pr={8} // plats för ikon till höger
            border="1px solid #ccc"
            borderRadius="md"
            bg="white"
            boxShadow="xs"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: 'gray.100' }}
            onClick={() =>
              setAvklaradSamrad((prev) => ({
                ...prev,
                [selectedRow.id]: {
                  ...prev[selectedRow.id],
                  [person.id]: !isActive,
                },
              }))
            }
          >
            {/* Check icon when active */}
            {isActive && (
              <Flex
                position="absolute"
                right="10px"
                top="50%"
                transform="translateY(-50%)"
                align="center"
                justify="center"
                color="black"
              >
                <CheckIcon boxSize={4} />
              </Flex>
            )}
            <Text fontSize="sm" fontWeight="medium">
              {person.namn}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {person.telefon}
            </Text>
          </Box>
        );
      })}
    </SimpleGrid>
  ) : (
    <Text fontSize="sm" color="gray.500">
      Inga samråd.
    </Text>
  )}
</Box>
              </SimpleGrid>
            </SlideFade>
          </ModalBody>
          <ModalFooter justifyContent="space-between">
            <Flex gap={2}>
              <Button colorScheme="red">Ta bort</Button>
              <Button colorScheme="blue" variant="outline">Avsluta</Button>
            </Flex>
            <Flex gap={2}>
              <Button colorScheme="green">Spara</Button>
              <Button onClick={() => setIsOpen(false)}>Stäng</Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default Preview;