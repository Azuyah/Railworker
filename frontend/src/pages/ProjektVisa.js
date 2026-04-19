// src/pages/ProjektVisa.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getSectionLabel } from '../utils/sectionLabels';
import { apiUrl } from '../lib/api';
import axios from 'axios';

const ProjektVisa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(apiUrl(`/api/project/${id}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setProject(response.data);
      } catch (error) {
        console.error('Kunde inte hämta projektet:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-4xl px-6 pb-10 pt-32">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-slate-600">Hämtar projekt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-4xl px-6 pb-10 pt-32">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <p className="text-slate-700">Projektet hittades inte.</p>
        <button onClick={() => navigate('/htsmpanel')} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-white">
          Tillbaka
        </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-4xl px-6 pb-10 pt-32">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-blue-700">Projektöversikt</p>
        <h2 className="mb-4 mt-2 text-3xl font-bold text-slate-950">{project.name}</h2>
        <p className="text-slate-700"><strong>Plats:</strong> {project.plats || 'Ej angiven'}</p>
        <p className="mt-1 text-slate-700"><strong>Datum:</strong> {project.startDate} {project.startTime} – {project.endDate} {project.endTime}</p>
        <p className="mt-1 text-slate-700"><strong>FJTKL:</strong> {project.namn} ({project.telefonnummer})</p>

        <h3 className="mt-6 text-lg font-semibold text-slate-900">Beteckningar</h3>
        <ul className="list-disc list-inside">
{(project.beteckningar || []).map((b, i) => (
  <li key={i}>{typeof b === 'object' ? b.value : b}</li>
))}
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-slate-900">Delområden</h3>
        <ul className="space-y-2 mt-2">
          {(project.sections || []).map((sec, i) => (
            <li key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <strong>{getSectionLabel(sec, i)}:</strong> {sec.signal}
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate('/htsmpanel')}
          className="mt-6 rounded-xl bg-blue-600 px-4 py-2 text-white"
        >
          Tillbaka till panelen
        </button>
        </div>
      </div>
    </div>
  );
};

export default ProjektVisa;
