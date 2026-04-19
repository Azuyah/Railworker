import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../lib/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(apiUrl('/api/register'), formData);
      const token = response.data?.token;
      if (token) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          token,
          role: response.data.role,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          signature: response.data.signature,
          email: response.data.email,
          phone: response.data.phone,
          company: response.data.company,
        }));
        navigate('/dashboard');
      } else {
        setError('Registreringen lyckades inte');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registreringen misslyckades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-2xl px-6 pb-10 pt-32">
        <div className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-slate-50 px-8 py-8">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-700">
              TSM
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Registrera dig</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Fyll i dina uppgifter så kommer du direkt in i TSM-sidan. Om telefonnumret redan finns registrerat loggas du in direkt.
            </p>
          </div>

          <div className="p-8">
          {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

          <div className="mb-4">
            <label className="mb-1 block font-semibold text-slate-800">Företag</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-semibold text-slate-800">Förnamn</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-semibold text-slate-800">Efternamn</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block font-semibold text-slate-800">Telefonnummer</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleRegister}
              className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? 'Registrerar...' : 'Registrera mig'}
            </button>
            <button
              onClick={() => navigate('/tsm-login')}
              className="rounded-xl border border-slate-300 bg-slate-100 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-200"
            >
              Tillbaka till inloggning
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
