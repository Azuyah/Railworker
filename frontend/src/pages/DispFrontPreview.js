import React from 'react';
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';

const sample = {
  title: 'Dispositionsarbetsplan Hbgb-Tp',
  line: 'Raabanan',
  week: 'V13 Nm Tis, Lor, Son',
  sections: ['Delomrade 1: Hb 103 - Gtf', 'Delomrade 2: Gtf - Vka', 'Delomrade 3: Vka - Tp 33, 82'],
  stations: 'Helsingborg, Gantofta, Vallakra, Tagarp, Billeberga, Teckomatorp',
  limits: 'Hb 103 - Tp 33, 82',
  htsm: '010-149 01 64',
  reserve: '010-149 01 65',
  fjtkl: '010-127 12 61',
  banobjekt: '17096-1',
  planning: 'ca 1 tim innan start',
};

function PreviewShell({ title, note, children }) {
  return (
    <Box bg="white" borderRadius="32px" border="1px solid #d8e3ef" boxShadow="0 24px 60px rgba(16,42,67,0.10)" overflow="hidden">
      <Flex px={7} py={5} bg="#f7fbff" borderBottom="1px solid #e3edf7" align="center" justify="space-between" gap={4}>
        <Heading fontSize="xl" color="#102a43">{title}</Heading>
        <Text color="#c2410c" fontWeight="700" fontSize="sm">{note}</Text>
      </Flex>
      <Box p={7}>{children}</Box>
    </Box>
  );
}

function CoverPage({ children }) {
  return (
    <Box
      maxW="780px"
      mx="auto"
      bg="linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)"
      border="1px solid #e1eaf4"
      borderRadius="28px"
      minH="980px"
      px={8}
      py={8}
      boxShadow="inset 0 1px 0 rgba(255,255,255,0.9)"
    >
      {children}
    </Box>
  );
}

function SmallMetaCards() {
  return (
    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
      <Box bg="#fff5f5" border="1px solid #fecaca" borderRadius="22px" px={5} py={4}>
        <Text color="#1f2937" fontWeight="700" fontSize="sm" mb={1}>Banobjekt-Vnr</Text>
        <Text color="#111827" fontWeight="800" fontSize="2xl">{sample.banobjekt}</Text>
      </Box>
      <Box bg="#f8fafc" border="1px solid #d9e5f3" borderRadius="22px" px={5} py={4}>
        <Text color="#1f2937" fontWeight="700" fontSize="sm" mb={1}>Forplanera senast</Text>
        <Text color="#111827" fontWeight="800" fontSize="2xl">{sample.planning}</Text>
      </Box>
    </Grid>
  );
}

function ContactBlock() {
  return (
    <Box bg="#f8fafc" border="1px solid #d9e5f3" borderRadius="24px" px={6} py={5}>
      <Text color="#102a43" fontWeight="800" fontSize="sm" letterSpacing="0.14em" textTransform="uppercase" mb={4}>
        Kontakt
      </Text>
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap={4}>
        <Box>
          <Text color="#486581" fontSize="sm" fontWeight="700">HTSM</Text>
          <Text color="#111827" fontSize="2xl" fontWeight="800">{sample.htsm}</Text>
        </Box>
        <Box>
          <Text color="#486581" fontSize="sm" fontWeight="700">Reserv</Text>
          <Text color="#111827" fontSize="2xl" fontWeight="800">{sample.reserve}</Text>
        </Box>
        <Box>
          <Text color="#486581" fontSize="sm" fontWeight="700">FJTKL</Text>
          <Text color="#111827" fontSize="2xl" fontWeight="800">{sample.fjtkl}</Text>
        </Box>
      </Grid>
    </Box>
  );
}

function ProposalOne() {
  return (
    <CoverPage>
      <Stack spacing={2}>
        <Text color="#9a3412" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase" fontSize="xs">Ren och tydlig</Text>
        <Heading color="#111827" fontSize="4xl">{sample.title}</Heading>
        <Text color="#111827" fontSize="3xl" fontWeight="700">{sample.line}</Text>
        <Text color="#111827" fontSize="2xl" fontWeight="700">{sample.week}</Text>
      </Stack>

      <Stack spacing={4} mt={8}>
        <Box bg="#eff6ff" border="1px solid #bfdbfe" borderRadius="26px" px={6} py={6}>
          <Text color="#102a43" fontWeight="800" fontSize="sm" letterSpacing="0.14em" textTransform="uppercase" mb={4}>
            Delomraden
          </Text>
          <Stack spacing={3}>
            {sample.sections.map((section) => (
              <Box key={section} bg="white" border="1px solid #dbeafe" borderRadius="18px" px={4} py={3}>
                <Text color="#111827" fontSize="xl" fontWeight="800">{section}</Text>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box bg="#f8fafc" border="1px solid #d9e5f3" borderRadius="24px" px={6} py={5}>
          <Text color="#102a43" fontWeight="800" fontSize="sm" letterSpacing="0.14em" textTransform="uppercase" mb={2}>
            Berorda driftplatser
          </Text>
          <Text color="#111827" fontSize="2xl" fontWeight="800" lineHeight="1.25">{sample.stations}</Text>
        </Box>

        <Box bg="#fff1f2" border="1px solid #fda4af" borderRadius="24px" px={6} py={5}>
          <Text color="#991b1b" fontWeight="900" fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" mb={2}>
            Granspunkter som ej far passeras
          </Text>
          <Text color="#b91c1c" fontSize="3xl" fontWeight="900">{sample.limits}</Text>
        </Box>

        <ContactBlock />
        <SmallMetaCards />
      </Stack>
    </CoverPage>
  );
}

function ProposalTwo() {
  return (
    <CoverPage>
      <Stack spacing={2}>
        <Heading color="#111827" fontSize="4xl">{sample.title}</Heading>
        <Text color="#111827" fontSize="3xl" fontWeight="700">{sample.line}</Text>
        <Text color="#111827" fontSize="2xl" fontWeight="700">{sample.week}</Text>
      </Stack>

      <Grid templateColumns={{ base: '1fr', lg: '1.15fr 0.85fr' }} gap={5} mt={8}>
        <Stack spacing={5}>
          <Box bg="#eefbf4" border="1px solid #bbf7d0" borderRadius="26px" px={6} py={6}>
            <Text color="#14532d" fontWeight="800" fontSize="sm" letterSpacing="0.14em" textTransform="uppercase" mb={4}>
              Delomraden
            </Text>
            <Stack spacing={3}>
              {sample.sections.map((section, index) => (
                <Flex key={section} align="center" gap={4} bg="white" border="1px solid #dcfce7" borderRadius="18px" px={4} py={3}>
                  <Flex align="center" justify="center" w="34px" h="34px" borderRadius="full" bg="#166534" color="white" fontWeight="800">
                    {index + 1}
                  </Flex>
                  <Text color="#111827" fontSize="xl" fontWeight="800">{section.replace(/^Delomrade \d+:\s*/, '')}</Text>
                </Flex>
              ))}
            </Stack>
          </Box>

          <Box bg="#fff1f2" border="1px solid #fda4af" borderRadius="24px" px={6} py={5}>
            <Text color="#991b1b" fontWeight="900" fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" mb={2}>
              Vad far inte passeras?
            </Text>
            <Text color="#b91c1c" fontSize="3xl" fontWeight="900">{sample.limits}</Text>
          </Box>
        </Stack>

        <Stack spacing={5}>
          <Box bg="#f8fafc" border="1px solid #d9e5f3" borderRadius="24px" px={6} py={5}>
            <Text color="#102a43" fontWeight="800" fontSize="sm" letterSpacing="0.14em" textTransform="uppercase" mb={2}>
              Berorda driftplatser
            </Text>
            <Text color="#111827" fontSize="2xl" fontWeight="800" lineHeight="1.25">{sample.stations}</Text>
          </Box>
          <ContactBlock />
          <SmallMetaCards />
        </Stack>
      </Grid>
    </CoverPage>
  );
}

function ProposalThree() {
  return (
    <CoverPage>
      <Stack spacing={2}>
        <Text color="#9a3412" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase" fontSize="xs">Operativ och faltanpassad</Text>
        <Heading color="#111827" fontSize="4xl">{sample.title}</Heading>
        <Text color="#111827" fontSize="3xl" fontWeight="700">{sample.line}</Text>
        <Text color="#111827" fontSize="2xl" fontWeight="700">{sample.week}</Text>
      </Stack>

      <Stack spacing={5} mt={8}>
        <Box bg="#102a43" color="white" borderRadius="28px" px={6} py={6} boxShadow="0 20px 40px rgba(16,42,67,0.18)">
          <Text color="#dbeafe" fontWeight="800" fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" mb={4}>
            Delomraden
          </Text>
          <Stack spacing={3}>
            {sample.sections.map((section) => (
              <Flex key={section} justify="space-between" gap={4} align="center" borderBottom="1px solid rgba(255,255,255,0.14)" pb={3}>
                <Text fontSize="2xl" fontWeight="800">{section.split(':')[0]}</Text>
                <Text fontSize="xl" fontWeight="700" color="whiteAlpha.900" textAlign="right">
                  {section.split(':')[1]?.trim()}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Box>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={5}>
          <Box bg="#f8fafc" border="1px solid #d9e5f3" borderRadius="24px" px={6} py={5}>
            <Text color="#102a43" fontWeight="800" fontSize="sm" letterSpacing="0.14em" textTransform="uppercase" mb={2}>
              Berorda driftplatser
            </Text>
            <Text color="#111827" fontSize="2xl" fontWeight="800" lineHeight="1.25">{sample.stations}</Text>
          </Box>
          <Box bg="#fff1f2" border="1px solid #fda4af" borderRadius="24px" px={6} py={5}>
            <Text color="#991b1b" fontWeight="900" fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" mb={2}>
              Granspunkter
            </Text>
            <Text color="#b91c1c" fontSize="3xl" fontWeight="900">{sample.limits}</Text>
          </Box>
        </Grid>

        <ContactBlock />
        <SmallMetaCards />
      </Stack>
    </CoverPage>
  );
}

export default function DispFrontPreview() {
  return (
    <Box minH="100vh" bg="linear-gradient(180deg, #edf4fb 0%, #dde9f6 100%)" py={12}>
      <Container maxW="7xl">
        <Stack spacing={3} mb={10}>
          <Text color="#9a3412" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase" fontSize="xs">
            Disp Framsida
          </Text>
          <Heading color="#102a43" fontSize={{ base: '3xl', md: '4xl' }}>
            Visuella framsidesforslag
          </Heading>
          <Text color="#486581" fontSize="lg" maxW="4xl">
            Tre tydliga framsidor dar all viktig information finns pa omslaget och delomradena far extra tydlig push.
          </Text>
        </Stack>

        <Stack spacing={8}>
          <PreviewShell title="Forslag 1" note="Ren, tydlig och balanserad">
            <ProposalOne />
          </PreviewShell>
          <PreviewShell title="Forslag 2" note="Mest sjalvinstruerande">
            <ProposalTwo />
          </PreviewShell>
          <PreviewShell title="Forslag 3" note="Mest fokus pa delomraden">
            <ProposalThree />
          </PreviewShell>
        </Stack>
      </Container>
    </Box>
  );
}
