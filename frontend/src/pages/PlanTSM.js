import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import axios from '../api/axios';

const PlanTSM = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [rows, setRows] = useState([]);
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
          setCountdown('Registrering stängd!');
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${h}h ${m}m ${s}s kvar till registrering stänger`);
        }
      }, 1000);

      return () => clearInterval(interval);
    } catch (err) {
      console.error('Kunde inte hämta projektet:', err);
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
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="border px-2 py-1 text-center">{row.id}</td>
                    <td className="border px-2 py-1">{row.namn}</td>
                    <td className="border px-2 py-1">{row.telefon}</td>
                    <td className="border px-2 py-1">{row.anordning}</td>
                    {row.selections.map((checked, idx) => (
                      <td key={idx} className="border text-center">
                        <input type="checkbox" checked={checked} readOnly />
                      </td>
                    ))}
                    <td className="border px-2 py-1">{row.starttid}</td>
                    <td className="border px-2 py-1">{row.begard}</td>
                    <td className="border px-2 py-1">{row.avslutat}</td>
                    <td className="border px-2 py-1">{row.anteckning}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-center">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Registrera dig
              </button>
            </div>
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

export default PlanTSM;