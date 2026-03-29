import React from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';

const examples = [
  {
    id: 'A',
    title: 'Exempel A',
    label: 'Starkast och mest premium',
    description: 'Stor Vallakra-logga i mörk signaturruta med tydlig närvaro. Bra om märket ska kännas som huvudavsändaren.',
    render: () => (
      <Flex
        align="center"
        gap={4}
        px={6}
        py={4}
        borderRadius="26px"
        bg="linear-gradient(135deg, #113a75 0%, #1e4d96 55%, #3566b5 100%)"
        boxShadow="0 28px 50px rgba(17,58,117,0.28)"
        border="1px solid rgba(255,255,255,0.14)"
      >
        <Flex
          align="center"
          justify="center"
          w="220px"
          h="84px"
          borderRadius="24px"
          bg="rgba(4,8,15,0.72)"
          boxShadow="0 12px 30px rgba(7,15,30,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
          backdropFilter="blur(10px)"
          px={5}
        >
          <Image
            src="/vallakra-logo.png"
            alt="Vallakra logo"
            maxW="100%"
            maxH="58px"
            objectFit="contain"
            filter="drop-shadow(0 0 18px rgba(220,68,56,0.32))"
          />
        </Flex>
        <Stack spacing={0.5}>
          <Text color="whiteAlpha.800" fontSize="xs" letterSpacing="0.32em" textTransform="uppercase">
            Mobil Header
          </Text>
          <Heading color="white" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="0.18em" textTransform="uppercase">
            Railworker
          </Heading>
        </Stack>
      </Flex>
    ),
  },
  {
    id: 'B',
    title: 'Exempel B',
    label: 'Renast och mest app-lik',
    description: 'Ljus logobricka med mörk ram. Bra om du vill att själva Vallakra-märket ska bli lättare att se direkt på mindre skärmar.',
    render: () => (
      <Flex
        align="center"
        justify="space-between"
        gap={5}
        px={6}
        py={4}
        borderRadius="24px"
        bg="#0f2749"
        border="1px solid #365b8f"
        boxShadow="0 22px 46px rgba(15,39,73,0.32)"
      >
        <Flex align="center" gap={4}>
          <Box
            w="4px"
            alignSelf="stretch"
            borderRadius="full"
            bg="linear-gradient(180deg, #f59e0b 0%, #f97316 100%)"
          />
          <Flex
            align="center"
            justify="center"
            w="210px"
            h="78px"
            borderRadius="18px"
            bg="#f8fafc"
            boxShadow="0 14px 24px rgba(0,0,0,0.18)"
            px={4}
          >
            <Image
              src="/vallakra-logo.png"
              alt="Vallakra logo"
              maxW="100%"
              maxH="52px"
              objectFit="contain"
            />
          </Flex>
          <Stack spacing={0}>
            <Heading color="white" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="0.14em" textTransform="uppercase">
              Railworker
            </Heading>
            <Text color="#bfd4f4" fontSize="sm">
              Tydlig, kompakt och lätt att känna igen i mobilen
            </Text>
          </Stack>
        </Flex>
      </Flex>
    ),
  },
  {
    id: 'C',
    title: 'Exempel C',
    label: 'Mjukare och vänligare',
    description: 'Ljus banderoll där Vallakra-loggan får bred plats. Bra om du vill ha tydlig logo men lugnare helhetskänsla.',
    render: () => (
      <Flex
        align="center"
        gap={4}
        px={6}
        py={4}
        borderRadius="24px"
        bg="linear-gradient(135deg, #1d3f74 0%, #274a80 100%)"
        boxShadow="0 22px 46px rgba(22,52,95,0.28)"
      >
        <Flex
          align="center"
          gap={3}
          px={5}
          py={3}
          borderRadius="20px"
          bg="rgba(255,255,255,0.95)"
          color="#153864"
          boxShadow="0 16px 26px rgba(8,21,44,0.2)"
        >
          <Image
            src="/vallakra-logo.png"
            alt="Vallakra logo"
            w="170px"
            maxW="42vw"
            objectFit="contain"
            filter="drop-shadow(0 0 6px rgba(21,56,100,0.14))"
          />
          <Heading fontSize={{ base: 'xl', md: '2xl' }} letterSpacing="0.14em" textTransform="uppercase">
            Railworker
          </Heading>
        </Flex>
        <Text color="whiteAlpha.820" fontSize="sm" maxW="260px">
          Lättläst och tydlig även när headern blir kompakt på mindre skärmar.
        </Text>
      </Flex>
    ),
  },
];

export default function LogoPreview() {
  return (
    <Box minH="100vh" bg="linear-gradient(180deg, #eef4fb 0%, #dce9f7 100%)" py={{ base: 10, md: 14 }}>
      <Container maxW="6xl">
        <Stack spacing={3} mb={10}>
          <Text color="#9a3412" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase" fontSize="xs">
            Logoexempel
          </Text>
          <Heading color="#102a43" fontSize={{ base: '3xl', md: '4xl' }}>
            Tydligare Railworker-logo
          </Heading>
          <Text color="#36536b" fontSize="lg" maxW="3xl">
            Här är tre olika sätt att göra Vallåkra-loggan synligare i appen utan att byta märkets uttryck. Alla exempel använder den riktiga logofilen.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {examples.map((example) => (
            <Box
              key={example.id}
              bg="white"
              borderRadius="30px"
              border="1px solid #d9e5f3"
              boxShadow="0 24px 40px rgba(27,54,93,0.08)"
              p={6}
            >
              <Stack spacing={4}>
                <Flex align="baseline" justify="space-between" gap={4}>
                  <Heading fontSize="xl" color="#102a43">
                    {example.title}
                  </Heading>
                  <Text color="#c2410c" fontWeight="700" fontSize="sm">
                    {example.label}
                  </Text>
                </Flex>
                {example.render()}
                <Text color="#486581" fontSize="sm" lineHeight="1.7">
                  {example.description}
                </Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
