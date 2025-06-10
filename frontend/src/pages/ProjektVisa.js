// src/pages/ProjektVisa.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const ProjektVisa = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const allProjects = JSON.parse(localStorage.getItem('projects')) || [];
  const project = allProjects.find((p) => p.id === Number(id));

  if (!project) {
    return (
      <div className="p-6">
        <p>Projektet hittades inte.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Tillbaka
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Menu */}
<Header />

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
        <p><strong>Plats:</strong> {project.plats}</p>
        <p><strong>Datum:</strong> {project.startDate} {project.startTime} – {project.endDate} {project.endTime}</p>
        <p><strong>FJTKL:</strong> {project.namn} ({project.telefonnummer})</p>

        <h3 className="text-lg font-semibold mt-6">Beteckningar</h3>
        <ul className="list-disc list-inside">
{project.beteckningar.map((b, i) => (
  <li key={i}>{typeof b === 'object' ? b.value : b}</li>
))}
        </ul>

        <h3 className="text-lg font-semibold mt-6">Delområden</h3>
        <ul className="space-y-2 mt-2">
          {project.sections.map((sec, i) => (
            <li key={i} className="p-3 bg-white rounded shadow">
              <strong>{sec.type} {String.fromCharCode(65 + i)}:</strong> {sec.signal}
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Tillbaka till dashboard
        </button>
      </div>
    </div>
  );
};

export default ProjektVisa;