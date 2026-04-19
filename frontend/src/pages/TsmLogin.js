import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../lib/api';

const persistAuth = (data = {}) => {
  const token = data?.token;
  if (!token) {
    return false;
  }

  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({
    token,
    role: data.role,
    firstName: data.firstName,
    lastName: data.lastName,
    signature: data.signature,
    email: data.email,
    phone: data.phone,
    company: data.company,
  }));

  return true;
};

export default function TsmLogin() {
  const navigate = useNavigate();
  const [tsmName, setTsmName] = useState('');
  const [tsmPhone, setTsmPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTsmLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post(apiUrl('/api/login-tsm'), {
        name: tsmName,
        phone: tsmPhone,
      });

      if (persistAuth(res.data)) {
        navigate('/panel');
        return;
      }

      alert('Inloggning misslyckades');
    } catch (error) {
      alert(error?.response?.data?.error || 'Kunde inte logga in med namn och telefon');
      console.error('TSM login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm brightness-75"
        style={{ backgroundImage: `url('/background.jpg')` }}
      />

      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-white/70 bg-white/92 p-8 shadow-2xl shadow-slate-950/25">
        <div className="mb-4 flex justify-center">
          <div className="rounded-xl border border-white/80 bg-white px-3 py-2 shadow-lg shadow-slate-900/10">
            <img
              src="/vallakra-railworker-logo.png"
              alt="Vallåkra Railworker"
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.35em] text-blue-700">
          TSM
        </p>
        <h2 className="mb-2 text-center text-3xl font-bold text-slate-950">Logga in för förplanering</h2>
        <p className="mb-6 text-center text-sm leading-6 text-slate-600">
          Ange samma namn och telefonnummer som du är registrerad med. Inloggningen behövs bara för att skicka och följa din förplanering.
        </p>

        <input
          type="text"
          placeholder="För- och efternamn"
          value={tsmName}
          onChange={(e) => setTsmName(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm"
        />
        <input
          type="text"
          placeholder="Telefonnummer"
          value={tsmPhone}
          onChange={(e) => setTsmPhone(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm"
        />
        <button
          onClick={handleTsmLogin}
          className="w-full rounded-xl bg-blue-700 py-3 font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? 'Loggar in...' : 'Logga in som TSM'}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm">
            Första gången här?
            <button
              onClick={() => navigate('/register')}
              className="ml-1 text-blue-600 hover:underline"
            >
              Registrera dig
            </button>
          </p>
        </div>

        <button
          onClick={() => navigate('/panel')}
          className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-100 py-3 font-semibold text-slate-700 hover:bg-slate-200"
        >
          Tillbaka till projekten
        </button>
      </div>
    </div>
  );
}
