// Plan.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const Plan = () => {
  const [project, setProject] = useState(null);
  const [rows, setRows] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const current = JSON.parse(localStorage.getItem('currentProject'));
    if (current) {
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
  const target = new Date(start.getTime() - 60 * 60 * 1000); // exakt 1 timme innan start
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    setCountdown('Registrering stängd!');
  } else {
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown(`${h}h ${m}m ${s}s kvar till registrering stänger`);
  }
}, 1000);
      return () => clearInterval(interval);
    }
  }, []);

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

  const toggleEdit = (rowIndex) => {
    setEditingRow(editingRow === rowIndex ? null : rowIndex);
  };

  const getSharedContacts = () => {
    const firstRow = rows[0];
    return rows.filter((row, i) => {
      if (i === 0) return false;
      return row.selections.some((val, idx) => val && firstRow.selections[idx]);
    });
  };

  const samrad = getSharedContacts();
  if (!project) return <div className="p-6">Inget projekt valt</div>;

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
            <h2 className="text-lg font-semibold mb-2">⏳ Nedräkning</h2>
            <div className="text-2xl font-bold text-blue-600">{countdown}</div>
          </div>
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
                  <th className="border px-4 py-2">Redigera</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={row.id}>
                    <td className="border px-2 py-1 text-center">{row.id}</td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} value={row.namn} onChange={(e) => handleChange(rowIndex, 'namn', e.target.value)} className={`w-[200px] px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} value={row.telefon} onChange={(e) => handleChange(rowIndex, 'telefon', e.target.value)} className={`w-[140px] px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} value={row.anordning} onChange={(e) => handleChange(rowIndex, 'anordning', e.target.value)} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    {project.sections.map((_, sectionIdx) => (
                      <td key={sectionIdx} className="border text-center">
                        <input type="checkbox" checked={row.selections[sectionIdx]} onChange={(e) => handleCheckboxChange(rowIndex, sectionIdx, e.target.checked)} />
                      </td>
                    ))}
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} type="time" value={row.starttid} onChange={(e) => handleChange(rowIndex, 'starttid', e.target.value)} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} type="time" value={row.begard} onChange={(e) => handleChange(rowIndex, 'begard', e.target.value)} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} type="time" value={row.avslutat} onChange={(e) => handleChange(rowIndex, 'avslutat', e.target.value)} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1">
                      <input disabled={editingRow !== rowIndex} value={row.anteckning} onChange={(e) => handleChange(rowIndex, 'anteckning', e.target.value)} className={`w-full px-2 py-1 rounded ${editingRow === rowIndex ? 'border bg-white' : 'bg-transparent'}`} />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button onClick={() => toggleEdit(rowIndex)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        {editingRow === rowIndex ? 'Stäng' : 'Redigera'}
                      </button>
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