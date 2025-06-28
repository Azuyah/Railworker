import React from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Text,
  Icon,
  Divider,
  Checkbox,
  Tooltip,
  useColorModeValue,
  Avatar,
  Tag,
  TagLabel,
  TagLeftIcon,
  Spacer,
} from "@chakra-ui/react";
import { FaTrain, FaSignal, FaFilter, FaUserTie, FaPhone, FaClock } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

const TestRailworkerUI = () => {
  const sampleData = [
    {
      id: 1,
      btkn: "MD01",
      namn: "Lars Nystedt",
      telefon: "076-115 25 68",
      anordning: "A-S",
      dpA: true,
      linjeB: true,
      dpC: false,
      linjeD: true,
      starttid: "05:00",
      begard: "05:00",
      avslutat: true,
    },
    {
      id: 2,
      btkn: "MA54",
      namn: "Johansson",
      telefon: "070-854 06 57",
      anordning: "Spf, Vxl",
      dpA: true,
      linjeB: false,
      dpC: true,
      linjeD: true,
      starttid: "07:12",
      begard: "19:00",
      avslutat: false,
    },
    {
      id: 3,
      btkn: "MA67",
      namn: "Brodin",
      telefon: "072-462 63 16",
      anordning: "Spf, Vxl",
      dpA: true,
      linjeB: false,
      dpC: true,
      linjeD: true,
      starttid: "08:31",
      begard: "20:00",
      avslutat: true,
    },
  ];

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const tableBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.200", "gray.700");

  return (
<Box
  bgImage="url('/traintrack.png')"
  bgSize="cover"
  bgRepeat="no-repeat"
  bgPosition="center"
  minH="100vh"
  p={8}
  fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
>
      <Box mb={6}>
        <Flex align="center" gap={4}>
          <Icon as={FaTrain} w={10} h={10} color="teal.300" />
          <Text fontSize="3xl" fontWeight="extrabold" color="white">
            Railworker – Planöversikt
          </Text>
        </Flex>
        <Divider mt={4} borderColor="teal.300" />
      </Box>

      <Flex justify="space-between" mb={6} wrap="wrap" gap={4}>
        <HStack spacing={4}>
          <Button colorScheme="teal" boxShadow="lg">
            Visa projekt
          </Button>
          <Button leftIcon={<FaFilter />} variant="outline" colorScheme="teal">
            Filtrera kolumner
          </Button>
        </HStack>
        <Spacer />
        <Tag size="lg" colorScheme="teal" variant="solid">
          <TagLeftIcon boxSize="20px" as={MdLocationOn} />
          <TagLabel>Tågsträcka aktiv</TagLabel>
        </Tag>
      </Flex>

      <TableContainer
        bg={tableBg}
        p={6}
        borderRadius="xl"
        boxShadow="2xl"
        border="1px solid rgba(255,255,255,0.08)"
      >
        <Table variant="simple" size="sm">
          <Thead bg={headerBg} borderRadius="xl">
            <Tr>
              <Th>BTKN</Th>
              <Th><Icon as={FaUserTie} mr={2} />Namn</Th>
              <Th><Icon as={FaPhone} mr={2} />Telefon</Th>
              <Th>Anordning <Icon as={FaSignal} ml={1} /></Th>
              <Th textAlign="center">DP A</Th>
              <Th textAlign="center">Linje B</Th>
              <Th textAlign="center">DP C</Th>
              <Th textAlign="center">Linje D</Th>
              <Th><Icon as={FaClock} mr={2} />Starttid</Th>
              <Th>Begärd till</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sampleData.map((row, i) => (
              <Tr
                key={i}
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                transition="background 0.2s ease-in-out"
              >
                <Td>
                  <Tag variant="outline" colorScheme="teal">
                    <TagLabel>{row.btkn}</TagLabel>
                  </Tag>
                </Td>
                <Td>{row.namn}</Td>
                <Td>{row.telefon}</Td>
                <Td>
                  <Badge colorScheme="purple" variant="subtle">
                    {row.anordning}
                  </Badge>
                </Td>
                <Td textAlign="center">
                  <Checkbox isChecked={row.dpA} isReadOnly colorScheme="teal" />
                </Td>
                <Td textAlign="center">
                  <Checkbox isChecked={row.linjeB} isReadOnly colorScheme="teal" />
                </Td>
                <Td textAlign="center">
                  <Checkbox isChecked={row.dpC} isReadOnly colorScheme="teal" />
                </Td>
                <Td textAlign="center">
                  <Checkbox isChecked={row.linjeD} isReadOnly colorScheme="teal" />
                </Td>
                <Td>{row.starttid}</Td>
                <Td>{row.begard}</Td>
                <Td>
                  <Badge colorScheme={row.avslutat ? "green" : "yellow"}>
                    {row.avslutat ? "Avslutat" : "Pågående"}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TestRailworkerUI;