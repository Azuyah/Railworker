import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';

const Plan = () => {
  const { id } = useParams(); // projekt-ID från URL
  const [project, setProject] = useState(null);
  const [rows, setRows] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const tokenData = localStorage.getItem('user');
      const token = tokenData ? JSON.parse(tokenData).token : null;

      const response = await axios.get(`https://railworker-production.up.railway.app/api/project/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const current = response.data;
      setProject(current);

      setRows([
        {
          id: 1,
          namn: '',
          telefon: '',
          anordning: '',
          starttid: '',
          begard: '',
          avslutat: '',
          anteckning: '',
          selections: current.sections.map(() => false),
        },
      ]);

      const interval = setInterval(() => {
        const start = new Date(`${current.startDate}T${current.startTime}`);
        const target = new Date(start.getTime() - 60 * 60 * 1000);
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) {
          setCountdown('Förplanering stängd!');
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${h}h ${m}m ${s}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Kunde inte hämta projekt:', error);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleCheckboxChange = (rowIndex, sectionIndex, value) => {
    const updated = [...rows];
    updated[rowIndex].selections[sectionIndex] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        namn: '',
        telefon: '',
        anordning: '',
        starttid: '',
        begard: '',
        avslutat: '',
        anteckning: '',
        selections: project.sections.map(() => false),
      },
    ]);
  };

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    setEditingRow(null); // Sparar (dvs avslutar redigering)
  }
};

  const getSharedContacts = () => {
    const firstRow = rows[0];
    return rows.filter((row, i) => {
      if (i === 0) return false;
      return row.selections.some((val, idx) => val && firstRow.selections[idx]);
    });
  };

  const samrad = getSharedContacts();

  if (!project) return <div className="p-6">Inget projekt hittades.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
 <Header />

<div className="p-6 max-w-[1600px] w-full mx-auto mt-24">
        <div className="bg-white rounded shadow-md p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Projektnamn: {project.name}</h2>
            <p><strong>Plats:</strong> {project.plats}</p>
            <p><strong>Startdatum:</strong> {project.startDate} <b>{project.startTime}</b></p>
            <p><strong>Slutdatum:</strong> {project.endDate} <b>{project.endTime}</b></p>
            <p><strong>FJTKL:</strong> {project.namn} ({project.telefonnummer})</p>
            <p><strong>Beteckningar:</strong> {project.beteckningar.map(b => b.value).join(', ')}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold mb-2">Förplanering stänger:</h2>
            <div className="text-xl font-bold text-blue-600">{countdown}</div>
          </div>
        </div>
 <div className="mt-4 flex gap-4">
  <button
    onClick={async () => {
      if (!window.confirm('Är du säker på att du vill ta bort detta projekt?')) return;

      try {
        const tokenData = localStorage.getItem('user');
        const token = tokenData ? JSON.parse(tokenData).token : null;
        await axios.delete(`https://railworker-production.up.railway.app/api/project/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('Kunde inte ta bort projekt:', err);
      }
    }}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    Ta bort projekt
  </button>

  <button
    onClick={() => alert('Redigeringsfunktion kommer snart!')}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Redigera projekt
  </button>
</div>
<div className="mt-6 w-full flex gap-6 max-w-[1900px] mx-auto">
<div className="flex-1">
  <table className="w-full border mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">#</th>
                  <th className="border px-4 py-2">Namn</th>
                  <th className="border px-4 py-2">Telefon</th>
                  <th className="border px-4 py-2">Anordning</th>
                  {project.sections.map((sec, idx) => (
                    <th key={idx} className="border px-2 py-2 min-w-[90px]">
                      <input className="text-center w-full h-[40px] border mb-1" placeholder="Signal" value={sec.signal} readOnly />
                      {sec.type} {String.fromCharCode(65 + idx)}
                    </th>
                  ))}
                  <th className="border px-4 py-2">Starttid</th>
                  <th className="border px-4 py-2">Begärd till</th>
                  <th className="border px-4 py-2">Avslutat</th>
                  <th className="border px-4 py-2">Anteckning</th>

                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
<tr
  key={row.id}
  onClick={(e) => {
    // Förhindra att klick på input eller checkbox stänger redigering
    if (e.target.type === 'checkbox') return;
    setEditingRow(editingRow === rowIndex ? null : rowIndex);
  }}
  className="cursor-pointer hover:bg-blue-50"
>
                    <td className="border px-2 py-1 text-center">{row.id}</td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} value={row.namn} onChange={(e) => handleChange(rowIndex, 'namn', e.target.value)} onKeyDown={handleKeyDown}  className={`w-[200px] px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} value={row.telefon} onChange={(e) => handleChange(rowIndex, 'telefon', e.target.value)}  onKeyDown={handleKeyDown} className={`w-[140px] px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} value={row.anordning} onChange={(e) => handleChange(rowIndex, 'anordning', e.target.value)}  onKeyDown={handleKeyDown} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    {project.sections.map((_, sectionIdx) => (
                      <td key={sectionIdx} className="border text-center">
                        <input type="checkbox" checked={row.selections[sectionIdx]} onChange={(e) => handleCheckboxChange(rowIndex, sectionIdx, e.target.checked)} />
                      </td>
                    ))}
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} type="time" value={row.starttid} onChange={(e) => handleChange(rowIndex, 'starttid', e.target.value)}  onKeyDown={handleKeyDown} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} type="time" value={row.begard} onChange={(e) => handleChange(rowIndex, 'begard', e.target.value)}  onKeyDown={handleKeyDown} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} type="time" value={row.avslutat} onChange={(e) => handleChange(rowIndex, 'avslutat', e.target.value)}  onKeyDown={handleKeyDown} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} value={row.anteckning} onChange={(e) => handleChange(rowIndex, 'anteckning', e.target.value)}  onKeyDown={handleKeyDown} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addRow} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Lägg till rad</button>
          </div>

          <div className="w-80 bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Mina samråd</h2>
            {samrad.length === 0 ? (
              <p className="italic text-gray-500">(tom)</p>
            ) : (
              <ul className="space-y-2">
                {samrad.map((r) => (
                  <li key={r.id} className="text-sm">{r.namn} ({r.telefon})</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan;