import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const SkapaProjekt = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [plats, setPlats] = useState('');
  const [projektNamn, setProjektNamn] = useState('');
  const [namn, setNamn] = useState('');
  const [telefonnummer, setTelefonnummer] = useState('');
  const [beteckningar, setBeteckningar] = useState([{ value: '' }]);
  const [sections, setSections] = useState([]);

  const addBeteckning = () => {
    setBeteckningar([...beteckningar, { value: '' }]);
  };

  const handleBeteckningChange = (index, value) => {
    const updated = [...beteckningar];
    updated[index].value = value;
    setBeteckningar(updated);
  };

  const addDP = () => {
    const newDP = { type: 'DP', signal: '' };
    setSections([...sections, newDP]);
  };

  const addLinje = () => {
    const indexToInsert =
      sections.findIndex(
        (sec) =>
          sec.type === 'DP' &&
          !sections.some(
            (s, i) => i > sections.indexOf(sec) && s.type === 'Linje'
          )
      ) + 1;
    const updated = [...sections];
    updated.splice(indexToInsert, 0, { type: 'Linje', signal: '' });
    setSections(updated);
  };

  const updateSignal = (index, value) => {
    const updated = [...sections];
    updated[index].signal = value;
    setSections(updated);
  };

  const getLetter = (i) => String.fromCharCode(65 + i); // A, B, C...

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Menu */}
<Header />

      {/* Page Content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Skapa nytt projekt</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow-md space-y-6">

{/* Projektnamn och Plats i samma sektion */}
<div className="bg-white p-6 rounded shadow-md">
  <h2 className="text-lg font-semibold mb-4">Projektdetaljer</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block mb-1">Projektnamn:</label>
      <input
        type="text"
        value={projektNamn}
        onChange={(e) => setProjektNamn(e.target.value)}
        placeholder="Ange projektnamn"
        className="w-full border px-4 py-2 rounded"
      />
    </div>
    <div>
      <label className="block mb-1">Plats:</label>
      <input
        type="text"
        value={plats}
        onChange={(e) => setPlats(e.target.value)}
        placeholder="Ange plats för projektet"
        className="w-full border px-4 py-2 rounded"
      />
    </div>
  </div>
</div>

{/* Datum */}
<div className="bg-white p-6 rounded shadow-md">
  <h2 className="text-lg font-semibold mb-4">Datum & Tid</h2>
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block mb-1">Startdatum:</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full border px-4 py-2 rounded"
      />
    </div>
    <div>
      <label className="block mb-1">Starttid:</label>
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="w-full border px-4 py-2 rounded"
      />
    </div>
    <div>
      <label className="block mb-1">Slutdatum:</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full border px-4 py-2 rounded"
      />
    </div>
    <div>
      <label className="block mb-1">Sluttid:</label>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="w-full border px-4 py-2 rounded"
      />
    </div>
  </div>
</div>

{/* FJTKL */}
<div className="bg-white p-6 rounded shadow-md">
  <h2 className="text-lg font-semibold mb-4">FJTKL</h2>
  <div className="grid grid-cols-2 gap-4">
    <input
      type="text"
      value={namn}
      onChange={(e) => setNamn(e.target.value)}
      placeholder="Namn"
      className="w-full border px-4 py-2 rounded"
    />
    <input
      type="text"
      value={telefonnummer}
      onChange={(e) => setTelefonnummer(e.target.value)}
      placeholder="Telefonnummer"
      className="w-full border px-4 py-2 rounded"
    />
  </div>
</div>
              {/* Beteckningar */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Beteckningar</h2>
                {beteckningar.map((b, i) => (
                  <input
                    key={i}
                    type="text"
                    value={b.value}
                    onChange={(e) => handleBeteckningChange(i, e.target.value)}
                    className="w-full border px-4 py-2 rounded mb-2"
                    placeholder={`Beteckning ${i + 1}`}
                  />
                ))}
                <button
                  onClick={addBeteckning}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  + Lägg till beteckning
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Delområden */}
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Delområden</h2>
            <div className="flex space-x-4 mb-6">
              <button
                onClick={addDP}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Lägg till DP
              </button>
              <button
                onClick={addLinje}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                + Lägg till Linje
              </button>
            </div>

            {sections.map((sec, i) => (
              <div key={i} className="mb-4 border p-4 rounded bg-gray-50">
                <p className="font-semibold mb-2">
                  {sec.type} {getLetter(i)}
                </p>
                <input
                  type="text"
                  placeholder="Signal"
                  value={sec.signal}
                  onChange={(e) => updateSignal(i, e.target.value)}
                  className="w-full border px-4 py-2 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <center>
<button
  onClick={async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      alert('Du är inte inloggad.');
      return;
    }

    try {
const newProject = {
  name: projektNamn,
  description: 'placeholder', // eller skapa ett nytt fält om du vill ha input
  startDate: startDate || null,
  startTime: startTime || null,
  endDate: endDate || null,
  endTime: endTime || null,
  plats: plats || null,
  namn: namn || null,
  telefonnummer: telefonnummer || null,
  beteckningar,
  sections,
};

console.log('🚀 Payload som skickas:', newProject);

      const response = await fetch('https://railworker-production.up.railway.app/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error('Kunde inte skapa projekt');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Fel vid projekt-skapande:', err);
      alert('Något gick fel. Försök igen.');
    }
  }}
  className="bg-blue-700 text-white px-6 py-3 rounded shadow hover:bg-blue-800 transition"
>
  Skapa projekt
</button>
        </center>
      </div>
    </div>
  );
};

export default SkapaProjekt;