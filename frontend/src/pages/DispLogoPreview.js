import React from 'react';
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';

const coverText = {
  title: 'Dispositionsarbetsplan Hbgb-Tp',
  line: 'Raabanan',
  week: 'V13 Nm Tis, Lor, Son',
  banobjekt: '17096-1',
  planning: 'ca 1 tim innan start',
  stations: 'Helsingborg, Gantofta, Vallakra, Tagarp, Billeberga, Teckomatorp',
  htsm: '010-149 01 64',
  limits: 'Hb 103 - Tp 33, 82',
};

function InfoCard({ title, value, accent = false }) {
  return (
    <Box
      bg={accent ? '#fff5f5' : '#f8fafc'}
      border="1px solid"
      borderColor={accent ? '#fecaca' : '#d9e5f3'}
      borderRadius="22px"
      px={5}
      py={4}
      minH="82px"
      boxShadow="inset 0 1px 0 rgba(255,255,255,0.8)"
    >
      <Text color="#1f2937" fontWeight="700" fontSize="sm" mb={2}>
        {title}
      </Text>
      <Text color="#111827" fontWeight="800" fontSize="2xl" lineHeight="1.1">
        {value}
      </Text>
    </Box>
  );
}

function CoverShell({ label, note, children }) {
  return (
    <Box
      bg="white"
      borderRadius="34px"
      border="1px solid #d7e3f1"
      boxShadow="0 28px 60px rgba(20,42,75,0.12)"
      overflow="hidden"
    >
      <Box px={7} py={5} bg="#f8fbff" borderBottom="1px solid #e4edf7">
        <Flex justify="space-between" align="center" gap={4}>
          <Heading fontSize="xl" color="#102a43">
            {label}
          </Heading>
          <Text color="#9a3412" fontWeight="700" fontSize="sm">
            {note}
          </Text>
        </Flex>
      </Box>
      <Box p={7}>{children}</Box>
    </Box>
  );
}

function CommonCoverBody({ topLogo, midLogo, bottomWatermark }) {
  return (
    <Box
      position="relative"
      minH="880px"
      bg="linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)"
      borderRadius="28px"
      overflow="hidden"
      px={7}
      py={8}
    >
      {topLogo}
      {midLogo}
      {bottomWatermark}

      <Stack spacing={2} position="relative" zIndex={2}>
        <Heading color="#111827" fontSize="4xl">
          {coverText.title}
        </Heading>
        <Text color="#111827" fontSize="3xl" fontWeight="700">
          {coverText.line}
        </Text>
        <Text color="#111827" fontSize="2xl" fontWeight="700">
          {coverText.week}
        </Text>
      </Stack>

      <Grid templateColumns="1fr 1fr" gap={4} mt={8} position="relative" zIndex={2}>
        <InfoCard title="Banobjekt-Vnr" value={coverText.banobjekt} accent />
        <InfoCard title="Forplanera ca" value={coverText.planning} />
      </Grid>

      <Box mt={4} position="relative" zIndex={2}>
        <InfoCard title="Berorda driftplatser" value={coverText.stations} />
      </Box>

      <Box mt={28} position="relative" zIndex={2}>
        <InfoCard title="HTSM telefonnr" value={coverText.htsm} />
      </Box>

      <Stack spacing={2} mt={24} position="relative" zIndex={2}>
        <Text color="#1f2937" fontSize="lg" fontWeight="700">
          Granspunkter som ej far passeras utan TKL:s medgivande ar:
        </Text>
        <Text color="#c0392f" fontSize="3xl" fontWeight="900">
          {coverText.limits}
        </Text>
      </Stack>
    </Box>
  );
}

function ExampleOne() {
  return (
    <CommonCoverBody
      topLogo={
        <Flex justify="flex-end" mb={6} position="relative" zIndex={2}>
          <Box
            bg="rgba(255,255,255,0.44)"
            border="1px solid rgba(219,229,240,0.72)"
            borderRadius="28px"
            px={8}
            py={5}
            boxShadow="0 10px 18px rgba(18,38,63,0.05)"
            backdropFilter="blur(6px)"
          >
            <Image
              src="/vallakra-logo.png"
              alt="Vallakra logo"
              w="335px"
              maxW="38vw"
              objectFit="contain"
              opacity={0.64}
              filter="drop-shadow(0 0 8px rgba(192,57,47,0.08))"
            />
          </Box>
        </Flex>
      }
      midLogo={null}
      bottomWatermark={
        <Image
          src="/vallakra-logo.png"
          alt=""
          aria-hidden="true"
          position="absolute"
          bottom="52px"
          left="50%"
          transform="translateX(-50%)"
          w="420px"
          opacity={0.045}
          pointerEvents="none"
        />
      }
    />
  );
}

function ExampleTwo() {
  return (
    <CommonCoverBody
      topLogo={null}
      midLogo={
        <Flex justify="center" mt={2} mb={8} position="relative" zIndex={2}>
          <Box
            bg="rgba(255,255,255,0.96)"
            border="1px solid #dbe5f0"
            borderRadius="28px"
            px={7}
            py={4}
            boxShadow="0 18px 34px rgba(18,38,63,0.14)"
          >
            <Image src="/vallakra-logo.png" alt="Vallakra logo" w="290px" objectFit="contain" />
          </Box>
        </Flex>
      }
      bottomWatermark={
        <Box
          position="absolute"
          insetX="34px"
          bottom="26px"
          h="200px"
          borderRadius="28px"
          bg="linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(244,247,251,0.88) 100%)"
          pointerEvents="none"
        />
      }
    />
  );
}

function ExampleThree() {
  return (
    <CommonCoverBody
      topLogo={
        <Flex justify="center" mb={8} position="relative" zIndex={2}>
          <Box
            bg="rgba(255,255,255,0.96)"
            border="1px solid #dbe5f0"
            borderRadius="26px"
            px={6}
            py={4}
            boxShadow="0 16px 28px rgba(18,38,63,0.12)"
          >
            <Image src="/vallakra-logo.png" alt="Vallakra logo" w="250px" objectFit="contain" />
          </Box>
        </Flex>
      }
      midLogo={null}
      bottomWatermark={
        <Image
          src="/vallakra-logo.png"
          alt=""
          aria-hidden="true"
          position="absolute"
          bottom="60px"
          left="50%"
          transform="translateX(-50%)"
          w="520px"
          opacity={0.055}
          pointerEvents="none"
        />
      }
    />
  );
}

export default function DispLogoPreview() {
  return (
    <Box minH="100vh" bg="linear-gradient(180deg, #edf4fb 0%, #dde9f6 100%)" py={12}>
      <Container maxW="7xl">
        <Stack spacing={3} mb={10}>
          <Text color="#9a3412" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase" fontSize="xs">
            Disp Exempel
          </Text>
          <Heading color="#102a43" fontSize={{ base: '3xl', md: '4xl' }}>
            Vallakra-logo pa dispen
          </Heading>
          <Text color="#486581" fontSize="lg" maxW="4xl">
            Tre omslagsforslag i samma lugnare riktning som exempel C, men anpassade for dispositionsarbetsplanens framsida.
          </Text>
        </Stack>

        <Stack spacing={8}>
          <CoverShell label="Exempel 1" note="Logga uppe till hoger, diskret watermark nertill">
            <ExampleOne />
          </CoverShell>
          <CoverShell label="Exempel 2" note="Stor logo centrerad over innehallet">
            <ExampleTwo />
          </CoverShell>
          <CoverShell label="Exempel 3" note="Mitt favoritforslag i C-stilen">
            <ExampleThree />
          </CoverShell>
        </Stack>
      </Container>
    </Box>
  );
}
