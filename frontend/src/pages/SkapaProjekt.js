import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getSectionLabel } from '../utils/sectionLabels';
import { apiUrl } from '../lib/api';

const fjtklNameOptions = [
  'Malmö',
  'Gävle',
  'Göteborg Stockholm',
  'Hallsberg',
  'Norrköping',
  'Boden',
  'Ånge',
];

const fjtklPhoneOptions = [
  '010-127 12 60 Helsingborg - Halmstad',
  '010-127 12 61 Helsingborg - Arlöv, Teckomatorp, Lund',
  '010-127 12 62 Helsingborg',
  '010-127 12 80 Pebberholmen',
  '010-127 12 42 Helsingborg - Åstorp, Teckomatorp, Hässleholm',
  '010-127 42 35 Borlänge',
  '010-127 42 24 Borlänge - Avesta Krylbo',
  '010-127 42 25 Storvik - Frövi',
];

const emergencyPhoneOptions = [
  '010-127 12 99 Malmö',
  '010-127 42 99 Gävle',
  '010-127 22 99 Göteborg',
  '010-127 45 99 Hallsberg',
  '010-127 33 99 Norrköping',
  '010-127 32 99 Stockholm',
  '010-127 43 99 Ånge',
  '010-127 44 99 Boden',
];

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Kunde inte läsa PDF-filen.'));
    reader.readAsDataURL(file);
  });

const getApiErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error.trim();
    }
  } catch (error) {
    void error;
  }

  return fallbackMessage;
};

const defaultBlankett31Entry = () => ({
  beteckning: '',
  granspunkt: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  uttagningstid: '',
  signatur: '',
  avslutningstid: '',
  avslutningssignatur: '',
});

const normalizeBlankett31Entry = (entry = {}) => ({
  ...defaultBlankett31Entry(),
  ...entry,
});

const sortBlankett31Entries = (entries = []) =>
  [...entries].sort((left, right) => {
    const leftKey = `${left.startDate || '9999-99-99'} ${left.startTime || '99:99'} ${left.beteckning || ''}`;
    const rightKey = `${right.startDate || '9999-99-99'} ${right.startTime || '99:99'} ${right.beteckning || ''}`;
    return leftKey.localeCompare(rightKey, 'sv');
  });

const dedupeBlankett31Entries = (entries = []) =>
  entries.filter((entry, index, array) => {
    const key = `${entry.beteckning || ''}|${entry.startDate || ''}|${entry.startTime || ''}|${entry.endDate || ''}|${entry.endTime || ''}`;
    return index === array.findIndex((candidate) => (
      `${candidate.beteckning || ''}|${candidate.startDate || ''}|${candidate.startTime || ''}|${candidate.endDate || ''}|${candidate.endTime || ''}` === key
    ));
  });

const defaultSection = () => ({
  type: 'Linje',
  name: '',
  signal: '',
  namingMode: 'LETTERS',
  displayIndex: null,
  granspunktStart: '',
  granspunktSlut: '',
  granspunkter: '',
  spar: '',
});

const mergeSectionDetails = (sections = [], sectionDetails = []) =>
  sections.map((section, index) => ({
    ...defaultSection(),
    ...section,
    ...(sectionDetails[index] || {}),
    signal: section?.signal || section?.name || sectionDetails[index]?.signal || '',
  }));

const SkapaProjekt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentProjectId = location.state?.projectId ?? null;
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [plats, setPlats] = useState('');
  const [projektNamn, setProjektNamn] = useState('');
  const [granspunktFritext, setGranspunktFritext] = useState('');
  const [namn, setNamn] = useState('');
  const [telefonnummer, setTelefonnummer] = useState('');
  const [nodnummer, setNodnummer] = useState('');
  const [htsmTelefon, setHtsmTelefon] = useState('');
  const [avstamt, setAvstamt] = useState(false);
  const [objekt, setObjekt] = useState('');
  const [uttagningstid, setUttagningstid] = useState('');
  const [signatur, setSignatur] = useState('');
  const [avslutaSkyddTid, setAvslutaSkyddTid] = useState('');
  const [avslutningstid, setAvslutningstid] = useState('');
  const [avslutningssignatur, setAvslutningssignatur] = useState('');
  const [beteckningar, setBeteckningar] = useState([{ value: '' }]);
  const [sections, setSections] = useState([]);
  const [fjtklBlocks, setFjtklBlocks] = useState([]);
  const [blankett31Files, setBlankett31Files] = useState([]);
  const [blankett31Entries, setBlankett31Entries] = useState([defaultBlankett31Entry()]);
  const [dispFiles, setDispFiles] = useState([]);
  const [anteckningar, setAnteckningar] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isParsingBlankett31, setIsParsingBlankett31] = useState(false);
  const [blankett31Status, setBlankett31Status] = useState('');
  const [isParsingDisp, setIsParsingDisp] = useState(false);
  const [dispStatus, setDispStatus] = useState('');
  const blankett31InputRef = useRef(null);
  const dispInputRef = useRef(null);

  const syncSummaryDatesFromEntries = (entries) => {
    if (!entries.length) {
      return;
    }

    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];
    setStartDate(firstEntry.startDate || '');
    setStartTime(firstEntry.startTime || '');
    setEndDate(lastEntry.endDate || '');
    setEndTime(lastEntry.endTime || '');
  };

  const syncProtectionFieldsFromEntries = (entries) => {
    if (!entries.length) {
      return;
    }

    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];
    setUttagningstid(firstEntry.uttagningstid || '');
    setSignatur(firstEntry.signatur || '');
    setAvslutningstid(lastEntry.avslutningstid || '');
    setAvslutningssignatur(lastEntry.avslutningssignatur || '');
  };

  const updateBlankett31Entry = (index, field, value) => {
    setBlankett31Entries((current) => {
      const updated = current.map((entry, entryIndex) => (
        entryIndex === index
          ? { ...entry, [field]: value }
          : entry
      ));

      syncSummaryDatesFromEntries(updated);
      syncProtectionFieldsFromEntries(updated);
      return updated;
    });
  };

  const removeBlankett31Entry = (index) => {
    setBlankett31Entries((current) => {
      const updated = current.filter((_, entryIndex) => entryIndex !== index);
      const nextEntries = updated.length ? updated : [defaultBlankett31Entry()];
      syncSummaryDatesFromEntries(nextEntries);
      syncProtectionFieldsFromEntries(nextEntries);
      return nextEntries;
    });
  };

  const addFjtklBlock = () => {
    setFjtklBlocks([
      ...fjtklBlocks,
      {
        namn: '',
        telefonnummer: '',
        nodnummer: '',
        uttagningstid: '',
        avslutningstid: '',
        signatur: '',
        avslutningssignatur: '',
        avstamt: false,
      },
    ]);
  };

  const updateFjtklBlock = (index, field, value) => {
    const updated = [...fjtklBlocks];
    updated[index][field] = value;
    setFjtklBlocks(updated);
  };

  const getCurrentTime = () =>
    new Date().toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const removeFjtklBlock = (index) => {
    setFjtklBlocks(fjtklBlocks.filter((_, i) => i !== index));
  };

  const addSection = () => {
    const lastSection = sections[sections.length - 1];
    const nextType =
      lastSection?.type === 'Linje'
        ? 'DP'
        : lastSection?.type === 'DP'
          ? 'Linje'
          : 'Linje';
    const nextNamingMode = lastSection?.namingMode || 'LETTERS';
    const lastSignal = (lastSection?.signal || lastSection?.name || '').trim();
    const signalParts = lastSignal.split(/\s*[-–—]\s*/).filter(Boolean);
    const inheritedSignal = signalParts.length > 1 ? signalParts[signalParts.length - 1] : '';
    const nextDisplayIndex =
      nextNamingMode === 'NUMBERS' && Number.isFinite(Number(lastSection?.displayIndex))
        ? Number(lastSection.displayIndex) + 1
        : null;
    const updated = [
      ...sections,
      {
        ...defaultSection(),
        type: nextType,
        name: inheritedSignal,
        signal: inheritedSignal,
        namingMode: nextNamingMode,
        displayIndex: nextDisplayIndex,
      },
    ];
    setSections(updated);
  };

  const updateSignal = (index, value) => {
    const updated = [...sections];
    updated[index].signal = value;
    updated[index].name = value;
    setSections(updated);
  };

  const updateSectionType = (index, type) => {
    const updated = [...sections];
    updated[index].type = type;
    setSections(updated);
  };

  const updateSectionNamingMode = (index, namingMode) => {
    const updated = [...sections];
    updated[index].namingMode = namingMode;
    setSections(updated);
  };

  const removeSection = (index) => {
    if (index === 0) {
      return;
    }

    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  const applyBlankett31Data = (parsed) => {
    const parsedEntries = Array.isArray(parsed?.entries) && parsed.entries.length
      ? parsed.entries
      : [
          {
            beteckning: parsed?.beteckning || '',
            granspunkt: parsed?.granspunkt || '',
            startDate: parsed?.start?.date || '',
            startTime: parsed?.start?.time || '',
            endDate: parsed?.end?.date || '',
            endTime: parsed?.end?.time || '',
            uttagningstid: '',
            signatur: '',
            avslutningstid: '',
            avslutningssignatur: '',
          },
        ].filter((entry) => Object.values(entry).some(Boolean));

    return parsedEntries.map(normalizeBlankett31Entry);
  };

  const applyDispEntries = (parsed) => {
    const parsedEntries = sortBlankett31Entries(dedupeBlankett31Entries(
      (Array.isArray(parsed?.entries) ? parsed.entries : [])
        .map((entry) => normalizeBlankett31Entry({
          ...entry,
          granspunkt: '',
          uttagningstid: '',
          signatur: '',
          avslutningstid: '',
          avslutningssignatur: '',
        }))
        .filter((entry) => entry.beteckning || entry.startDate || entry.endDate)
    ));

    if (!parsedEntries.length) {
      return;
    }

    setBeteckningar(parsedEntries.map((entry) => ({ value: entry.beteckning || '' })));
    syncSummaryDatesFromEntries(parsedEntries);

    const hasExistingBlankett31Data = blankett31Entries.some((entry) => Object.values(entry || {}).some(Boolean));
    if (!hasExistingBlankett31Data) {
      setBlankett31Entries(parsedEntries);
    }
  };

  const handleBlankett31Upload = async (event) => {
    const files = Array.from(event.target.files || []).filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (!files.length) {
      setBlankett31Status('');
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setBlankett31Status('Logga in för att tolka Blankett 31.');
      return;
    }

    setIsParsingBlankett31(true);
    setBlankett31Status('Tolkar Blankett 31...');

    try {
      const parsedFileEntries = [];

      for (const file of files) {
        const fileData = await readFileAsDataUrl(file);
        const response = await fetch(apiUrl('/api/pdf/blankett31/parse'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData,
          }),
        });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, `Kunde inte tolka ${file.name}`));
        }

        const data = await response.json();
        parsedFileEntries.push(...applyBlankett31Data(data.parsed));
      }

      const combinedEntries = sortBlankett31Entries(dedupeBlankett31Entries([
        ...blankett31Entries.filter((entry) => Object.values(entry || {}).some(Boolean)),
        ...parsedFileEntries,
      ]));

      const nextEntries = combinedEntries.length ? combinedEntries : [defaultBlankett31Entry()];
      setBlankett31Entries(nextEntries);
      setBeteckningar(nextEntries.map((entry) => ({ value: entry.beteckning || '' })));
      setBlankett31Files((current) => {
        const merged = [...current, ...files];
        return merged.filter(
          (file, index, array) =>
            index === array.findIndex((candidate) => candidate.name === file.name && candidate.size === file.size)
        );
      });
      if (!granspunktFritext) {
        const firstGranspunkt = nextEntries.find((entry) => entry.granspunkt)?.granspunkt;
        if (firstGranspunkt) {
          setGranspunktFritext(firstGranspunkt);
        }
      }
      syncSummaryDatesFromEntries(nextEntries);
      syncProtectionFieldsFromEntries(nextEntries);
      setBlankett31Status(
        files.length > 1
          ? `${files.length} Blankett 31 tolkades och lades till i projektet.`
          : 'Blankett 31 tolkad och lades till i projektet.'
      );
    } catch (error) {
      console.error('Fel vid tolkning av Blankett 31:', error);
      setBlankett31Status('Blankett 31 kunde inte tolkas automatiskt.');
    } finally {
      setIsParsingBlankett31(false);
    }
  };

  const applyDispData = (parsed) => {
    if (parsed?.projectName) {
      setProjektNamn(parsed.projectName);
    }

    if (parsed?.plats) {
      setPlats(parsed.plats);
    }

    if (parsed?.namn) {
      setNamn(parsed.namn);
    }

    if (parsed?.telefonnummer) {
      setTelefonnummer(parsed.telefonnummer);
    }

    if (parsed?.nodnummer) {
      setNodnummer(parsed.nodnummer);
    }

    if (parsed?.htsmTelefon) {
      setHtsmTelefon(parsed.htsmTelefon);
    }

    applyDispEntries(parsed);

    if (Array.isArray(parsed?.sections) && parsed.sections.length) {
      setSections(
        parsed.sections.map((section) => ({
          ...defaultSection(),
          ...section,
          name: section.signal || [section.granspunkter, section.spar].filter(Boolean).join(', '),
          signal: section.signal || [section.granspunkter, section.spar].filter(Boolean).join(', '),
        }))
      );
    }
  };

  const handleDispUpload = async (event) => {
    const files = Array.from(event.target.files || []).filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    setDispFiles(files);

    if (!files.length) {
      setDispStatus('');
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setDispStatus('Logga in för att tolka Disp.');
      return;
    }

    setIsParsingDisp(true);
    setDispStatus('Tolkar Disp...');

    try {
      const firstFile = files[0];
      const fileData = await readFileAsDataUrl(firstFile);
      const response = await fetch(apiUrl('/api/pdf/disp/parse'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: firstFile.name,
          fileData,
          blankett31Entries,
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Kunde inte tolka Disp'));
      }

      const data = await response.json();
      applyDispData(data.parsed);

      if (data.parsed?.match?.matches) {
        setDispStatus('Disp tolkad och matchar Blankett 31.');
      } else if (data.parsed?.match?.issues?.length) {
        setDispStatus(`Disp tolkad, men kontroll behövs: ${data.parsed.match.issues.join(', ')}`);
      } else {
        setDispStatus('Disp tolkad och ruta 01 är uppdaterad.');
      }
    } catch (error) {
      console.error('Fel vid tolkning av Disp:', error);
      setDispStatus(error?.message || 'Disp kunde inte tolkas automatiskt.');
    } finally {
      setIsParsingDisp(false);
    }
  };

  const buildHandelseLoggContent = () => {
    const sortedAnteckningar = [...anteckningar].sort(
      (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );

    const subject = `Händelselogg - ${projektNamn || 'Projekt'}`;
    const headerLines = [
      `Projekt: ${projektNamn || 'Ej angivet'}`,
      `Plats: ${plats || 'Ej angivet'}`,
      `Skydd uttaget: ${uttagningstid || 'Ej angivet'}`,
      `Skydd avslutat: ${avslutningstid || 'Ej angivet'}`,
      '',
      'Händelselogg:',
    ];

    const eventLines = sortedAnteckningar.length
      ? sortedAnteckningar.flatMap((note, index) => {
          const timestamp = note.timestamp
            ? new Date(note.timestamp).toLocaleString('sv-SE')
            : 'Tid saknas';
          const author = note.author ? ` av ${note.author}` : '';
          return [
            `${index + 1}. ${note.text || ''}`,
            `   ${timestamp}${author}`,
            '',
          ];
        })
      : ['Inga anteckningar registrerade ännu.'];

    const body = [...headerLines, ...eventLines].join('\n');
    return { subject, body };
  };

  const handleHandelseLogg = () => {
    const { subject, body } = buildHandelseLoggContent();
    const openInOutlook = window.confirm(
      'Vill du öppna händelselogg i Outlook?\nVälj Avbryt för vanligt e-postutkast.'
    );

    if (openInOutlook) {
      window.open(
        `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCreateProject = async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      alert('Du är inte inloggad.');
      return;
    }

    try {
      const newProject = {
        name: projektNamn,
        startDate: startDate || '',
        startTime: startTime || '',
        endDate: endDate || '',
        endTime: endTime || '',
        plats: plats || '',
        granspunkter: granspunktFritext || '',
        namn: namn || '',
        telefonnummer: telefonnummer || '',
        avstamt,
        objekt,
        uttagningstid,
        signatur,
        avslutaSkyddTid,
        avslutningstid,
        avslutningssignatur,
        formState: {
          nodnummer,
          htsmTelefon,
          avstamt,
          objekt,
          uttagningstid,
          signatur,
          avslutaSkyddTid,
          avslutningstid,
          avslutningssignatur,
          fjtklBlocks,
          blankett31Entries,
          sectionDetails: sections.map((sec) => ({
            signal: sec.signal || sec.name || '',
            displayIndex: sec.displayIndex ?? null,
            granspunktStart: sec.granspunktStart || '',
            granspunktSlut: sec.granspunktSlut || '',
            granspunkter: sec.granspunkter || '',
            spar: sec.spar || '',
          })),
          blankett31Files: blankett31Files.map((file) => ({
            name: file.name,
            size: file.size,
          })),
          dispFiles: dispFiles.map((file) => ({
            name: file.name,
            size: file.size,
          })),
        },
        beteckningar: beteckningar.map((b) => ({ value: b.value })),
        sections: sections.map((sec) => ({
          type: sec.type,
          name: sec.name || sec.signal || '',
          signal: sec.signal || sec.name || '',
          namingMode: sec.namingMode || 'LETTERS',
        })),
      };

      const isEditingProject = Boolean(currentProjectId);
      const response = await fetch(
        isEditingProject
          ? apiUrl(`/api/projects/${currentProjectId}`)
          : apiUrl('/api/projects'),
        {
        method: isEditingProject ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error('Kunde inte skapa projekt');
      }

      const data = await response.json();
      console.log('✅ Projekt skapat med beteckningar:', data.beteckningar);

      navigate(`/plan/${data.id || currentProjectId}`);
    } catch (err) {
      console.error('Fel vid projekt-skapande:', err);
      alert('Något gick fel. Försök igen.');
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProjectId) {
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      alert('Du är inte inloggad.');
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/project/${currentProjectId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Kunde inte ta bort projektet');
      }

      navigate('/htsmpanel');
    } catch (error) {
      console.error('Fel vid borttagning av projekt:', error);
      alert('Kunde inte ta bort projektet.');
    }
  };

  useEffect(() => {
    if (sections.length === 0) {
      setSections([defaultSection()]);
    }
  }, [sections]);

  useEffect(() => {
    if (!currentProjectId) {
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      return;
    }

    const fetchProject = async () => {
      setIsLoadingProject(true);

      try {
        const response = await fetch(apiUrl(`/api/project/${currentProjectId}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Kunde inte hämta projektet');
        }

        const project = await response.json();

        setProjektNamn(project.name || '');
        setStartDate(project.startDate || '');
        setStartTime(project.startTime || '');
        setEndDate(project.endDate || '');
        setEndTime(project.endTime || '');
        setPlats(project.plats || '');
        setGranspunktFritext(project.granspunkter || '');
        setNamn(project.namn || '');
        setTelefonnummer(project.telefonnummer || '');
        setNodnummer(project.formState?.nodnummer || '');
        setHtsmTelefon(project.formState?.htsmTelefon || '');
        setAvstamt(Boolean(project.formState?.avstamt));
        setObjekt(project.formState?.objekt || '');
        setUttagningstid(project.formState?.uttagningstid || '');
        setSignatur(project.formState?.signatur || '');
        setAvslutaSkyddTid(project.formState?.avslutaSkyddTid || '');
        setAvslutningstid(project.formState?.avslutningstid || '');
        setAvslutningssignatur(project.formState?.avslutningssignatur || '');
        setFjtklBlocks(project.formState?.fjtklBlocks || []);
        setBlankett31Entries(
          ((project.formState?.blankett31Entries || []).length
            ? project.formState.blankett31Entries
            : [defaultBlankett31Entry()]
          ).map((entry, index, entries) => ({
            ...defaultBlankett31Entry(),
            ...entry,
            uttagningstid: entry.uttagningstid || (index === 0 ? project.formState?.uttagningstid || '' : ''),
            signatur: entry.signatur || (index === 0 ? project.formState?.signatur || '' : ''),
            avslutningstid:
              entry.avslutningstid || (index === entries.length - 1 ? project.formState?.avslutningstid || '' : ''),
            avslutningssignatur:
              entry.avslutningssignatur || (index === entries.length - 1 ? project.formState?.avslutningssignatur || '' : ''),
          }))
        );
        setBlankett31Files(project.formState?.blankett31Files || []);
        setDispFiles(project.formState?.dispFiles || []);
        setAnteckningar(project.anteckningar || []);
        setBeteckningar(
          project.beteckningar?.length
            ? project.beteckningar.map((b) => ({ value: b.label || '' }))
            : [{ value: '' }]
        );
        setSections(
          project.sections?.length
            ? mergeSectionDetails(
                project.sections.map((sec) => ({
                  ...defaultSection(),
                  ...sec,
                  signal: sec.name || '',
                })),
                project.formState?.sectionDetails || []
              )
            : [defaultSection()]
        );
      } catch (error) {
        console.error('Fel vid hämtning av projekt i skapa-projekt:', error);
        alert('Kunde inte ladda projektet.');
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProject();
  }, [currentProjectId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <Header />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-16 pt-24">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Skapa projekt</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                {currentProjectId ? 'Redigera dispositionsarbetsplan' : 'Ny dispositionsarbetsplan'}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Samla allt på en plats – från FJTKL till delområden. Du kan alltid justera senare.
              </p>
            </div>
            <button
              onClick={handleCreateProject}
              disabled={isLoadingProject}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              {currentProjectId ? 'Spara projekt' : 'Skapa projekt'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div>
                <input
                  ref={blankett31InputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  onChange={handleBlankett31Upload}
                  className="hidden"
                />
                <input
                  ref={dispInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  onChange={handleDispUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => blankett31InputRef.current?.click()}
                  disabled={isParsingBlankett31}
                  className="w-full rounded-xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {isParsingBlankett31 ? 'Tolkar Blankett 31...' : 'Blankett 31'}
                </button>
                {blankett31Status && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {blankett31Status}
                  </div>
                )}
                {blankett31Files.length > 0 && (
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    {blankett31Files.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="rounded-lg bg-slate-50 px-3 py-2">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => dispInputRef.current?.click()}
                  disabled={isParsingDisp}
                  className="mt-3 w-full rounded-xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {isParsingDisp ? 'Tolkar Disp...' : 'Disp'}
                </button>
                {dispStatus && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {dispStatus}
                  </div>
                )}
                {dispFiles.length > 0 && (
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    {dispFiles.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="rounded-lg bg-slate-50 px-3 py-2">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleHandelseLogg}
                  className="mt-3 w-full rounded-xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Händelselogg
                </button>
              </div>
            </div>

          </aside>

          <main className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Projektöversikt</h2>
                  <p className="text-xs text-slate-500">Namngivning och tidsram</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  01
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Projektnamn</label>
                  <input
                    type="text"
                    value={projektNamn}
                    onChange={(e) => setProjektNamn(e.target.value)}
                    placeholder="Ex. Rååbanan nattarbete"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Driftplats/er</label>
                  <input
                    type="text"
                    value={plats}
                    onChange={(e) => setPlats(e.target.value)}
                    placeholder="Ex. Råå, Marieholm, Teckomatorp"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-5 border-t border-slate-200 pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">FJTKL</h3>
                    <p className="text-xs text-slate-500">Ansvarig kontakt och nödnummer</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={addFjtklBlock}
                      className="rounded-full border border-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900 hover:bg-slate-50"
                    >
                      + Ny FJTKL
                    </button>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                      02
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL namn</label>
                    <input
                      type="text"
                      list="fjtkl-name-options"
                      value={namn}
                      onChange={(e) => setNamn(e.target.value)}
                      placeholder="Namn"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL telefon</label>
                    <input
                      type="text"
                      list="fjtkl-phone-options"
                      value={telefonnummer}
                      onChange={(e) => setTelefonnummer(e.target.value)}
                      placeholder="Telefonnummer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Nödnummer</label>
                    <input
                      type="text"
                      list="emergency-phone-options"
                      value={nodnummer}
                      onChange={(e) => setNodnummer(e.target.value)}
                      placeholder="Nödnummer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">HTSM telefon</label>
                    <input
                      type="text"
                      value={htsmTelefon}
                      onChange={(e) => setHtsmTelefon(e.target.value)}
                      placeholder="HTSM telefon"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              {blankett31Entries.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900">Blankett 31 poster</h3>
                    <p className="text-xs text-slate-500">Alla dagar och tider som lästs in från Blankett 31</p>
                  </div>
                  <div className="space-y-3">
                    {blankett31Entries.map((entry, index) => (
                      <div key={`${entry.beteckning || 'post'}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Post {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBlankett31Entry(index)}
                            className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Ta bort post
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-6">
                          <input
                            type="text"
                            value={entry.beteckning || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'beteckning', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                            placeholder={`Beteckning ${index + 1}`}
                          />
                          <input
                            type="text"
                            value={entry.granspunkt || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'granspunkt', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none md:col-span-2"
                            placeholder={`Gränspunkt ${index + 1}`}
                          />
                          <input
                            type="date"
                            value={entry.startDate || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'startDate', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                          />
                          <input
                            type="time"
                            value={entry.startTime || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'startTime', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                          />
                          <input
                            type="date"
                            value={entry.endDate || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'endDate', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                          />
                          <input
                            type="time"
                            value={entry.endTime || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'endTime', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-4">
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                              Uttagningstid
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="time"
                                value={entry.uttagningstid || ''}
                                onChange={(e) => updateBlankett31Entry(index, 'uttagningstid', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateBlankett31Entry(index, 'uttagningstid', getCurrentTime())}
                                className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                              >
                                Nu
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                              Signatur
                            </label>
                            <input
                              type="text"
                              value={entry.signatur || ''}
                              onChange={(e) => updateBlankett31Entry(index, 'signatur', e.target.value)}
                              placeholder="Signatur"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                              Avslutningstid
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="time"
                                value={entry.avslutningstid || ''}
                                onChange={(e) => updateBlankett31Entry(index, 'avslutningstid', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateBlankett31Entry(index, 'avslutningstid', getCurrentTime())}
                                className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                              >
                                Nu
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                              Avslutningssignatur
                            </label>
                            <input
                              type="text"
                              value={entry.avslutningssignatur || ''}
                              onChange={(e) => updateBlankett31Entry(index, 'avslutningssignatur', e.target.value)}
                              placeholder="Signatur"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-slate-900">Gränspunkter</h3>
                  <p className="text-xs text-slate-500">Egen ruta för kompletterande gränspunkter</p>
                </div>
                <textarea
                  value={granspunktFritext}
                  onChange={(e) => setGranspunktFritext(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="Ange gränspunkter här vid behov"
                />
              </div>
            </section>

            {fjtklBlocks.map((block, index) => (
              <section key={index} className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">FJTKL</h2>
                      <p className="text-xs text-slate-500">Ansvarig kontakt</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => removeFjtklBlock(index)}
                        className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                      >
                        Ta bort
                      </button>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                        02
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL namn</label>
                      <input
                        type="text"
                        list="fjtkl-name-options"
                        value={block.namn}
                        onChange={(e) => updateFjtklBlock(index, 'namn', e.target.value)}
                        placeholder="Namn"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL telefon</label>
                      <input
                        type="text"
                        list="fjtkl-phone-options"
                        value={block.telefonnummer}
                        onChange={(e) => updateFjtklBlock(index, 'telefonnummer', e.target.value)}
                        placeholder="Telefonnummer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Nödnummer</label>
                      <input
                        type="text"
                        list="emergency-phone-options"
                        value={block.nodnummer}
                        onChange={(e) => updateFjtklBlock(index, 'nodnummer', e.target.value)}
                        placeholder="Nödnummer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Skydd & Signatur</h2>
                      <p className="text-xs text-slate-500">Tider och signering</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                      03
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Uttagningstid
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={block.uttagningstid}
                          onChange={(e) => updateFjtklBlock(index, 'uttagningstid', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateFjtklBlock(index, 'uttagningstid', getCurrentTime())}
                          className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Nu
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Avslutningstid
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={block.avslutningstid}
                          onChange={(e) => updateFjtklBlock(index, 'avslutningstid', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateFjtklBlock(index, 'avslutningstid', getCurrentTime())}
                          className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Nu
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Signatur
                      </label>
                      <input
                        type="text"
                        value={block.signatur}
                        onChange={(e) => updateFjtklBlock(index, 'signatur', e.target.value)}
                        placeholder="Signatur"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Avslutningssignatur
                      </label>
                      <input
                        type="text"
                        value={block.avslutningssignatur}
                        onChange={(e) => updateFjtklBlock(index, 'avslutningssignatur', e.target.value)}
                        placeholder="Signatur"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={block.avstamt}
                        onChange={(e) => updateFjtklBlock(index, 'avstamt', e.target.checked)}
                        className="h-4 w-4 accent-slate-900"
                      />
                      Avstämt
                    </label>
                  </div>
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Delområden</h2>
                  <p className="text-xs text-slate-500">Skapa DP/Linje och ange signaltext</p>
                </div>
                <button
                  onClick={addSection}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
                >
                  Lägg till delområde
                </button>
              </div>

              <div className="space-y-3">
                {sections.map((sec, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-700">
                        {getSectionLabel(sec, i)}
                      </div>
                      {i > 0 && (
                        <button
                          onClick={() => removeSection(i)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Ta bort
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-[140px_180px_1fr]">
                      <select
                        value={sec.type}
                        onChange={(e) => updateSectionType(i, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      >
                        <option value="Linje">Linje</option>
                        <option value="DP">DP</option>
                        <option value="Delområde">Delområde</option>
                      </select>
                      <select
                        value={sec.namingMode || 'LETTERS'}
                        onChange={(e) => updateSectionNamingMode(i, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      >
                        <option value="LETTERS">Bokstäver: A, B, C</option>
                        <option value="NUMBERS">Siffror: 1, 2, 3</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Signal / benämning"
                        value={sec.signal || sec.name || ''}
                        onChange={(e) => updateSignal(i, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    {(sec.granspunkter || sec.spar || sec.granspunktStart || sec.granspunktSlut) && (
                      <div className="mt-3 grid gap-3 text-xs text-slate-600 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <span className="font-semibold text-slate-700">Gränspunkter:</span>{' '}
                          {sec.granspunkter || [sec.granspunktStart, sec.granspunktSlut].filter(Boolean).join(' - ') || 'Ej hittad'}
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <span className="font-semibold text-slate-700">Spår:</span>{' '}
                          {sec.spar || 'Ej hittad'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              Skapa projekt
            </button>
            {currentProjectId && !confirmDeleteOpen && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
              >
                Ta bort projekt
              </button>
            )}
            {currentProjectId && confirmDeleteOpen && (
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <span>Vill du verkligen ta bort projektet?</span>
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  className="rounded-full bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
                >
                  Ja, ta bort
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="rounded-full border border-rose-300 px-4 py-2 font-semibold text-rose-700 hover:bg-white"
                >
                  Avbryt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <datalist id="fjtkl-name-options">
        {fjtklNameOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <datalist id="fjtkl-phone-options">
        {fjtklPhoneOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <datalist id="emergency-phone-options">
        {emergencyPhoneOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  );
};

export default SkapaProjekt;
