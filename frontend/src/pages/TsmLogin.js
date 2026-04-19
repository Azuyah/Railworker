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
  const [errorMessage, setErrorMessage] = useState('');

  const handleTsmLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await axios.post(apiUrl('/api/login-tsm'), {
        name: tsmName,
        phone: tsmPhone,
      });

      if (persistAuth(res.data)) {
        navigate('/panel');
        return;
      }

      setErrorMessage('Inloggning misslyckades.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Kunde inte logga in med namn och telefon.');
      console.error('TSM login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center blur-[1px] brightness-[0.22]"
        style={{ backgroundImage: `url('/background.jpg')` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.84),rgba(30,58,138,0.72),rgba(15,23,42,0.54))]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden rounded-[32px] border border-white/12 bg-white/8 p-8 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-md lg:block">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-lg shadow-slate-900/10">
                <img
                  src="/vallakra-railworker-logo.png"
                  alt="Vallåkra Railworker"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Förplanering i Vallåkra Railworker</h1>
              </div>
            </div>

            <div className="mt-8 max-w-xl">
              <p className="text-xl font-bold leading-8 text-red-300">
                Du behöver bara logga in när du ska skicka eller följa din förplanering.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                '1. Öppna rätt projekt i TSM-vyn.',
                '2. Logga in med namn och telefonnummer.',
                '3. Skicka din förplanering och följ svaret från HTSM i appen.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/16 bg-slate-950/30 px-4 py-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/80 bg-white/96 p-6 shadow-2xl shadow-slate-950/25 sm:p-8">
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="rounded-xl border border-white/80 bg-white px-3 py-2 shadow-lg shadow-slate-900/10">
                <img
                  src="/vallakra-railworker-logo.png"
                  alt="Vallåkra Railworker"
                  className="h-16 w-auto object-contain"
                />
              </div>
            </div>

            <h2 className="mb-6 text-center text-3xl font-bold text-red-700">Välkommen till Vallåkra Railworker</h2>

            {errorMessage ? (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-800">
                  För- och efternamn
                </label>
                <input
                  type="text"
                  placeholder="Ex. Mats Andersson"
                  value={tsmName}
                  onChange={(e) => setTsmName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-800">
                  Telefonnummer
                </label>
                <input
                  type="text"
                  placeholder="Ex. 0760-22 23 57"
                  value={tsmPhone}
                  onChange={(e) => setTsmPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              onClick={handleTsmLogin}
              className="mt-6 w-full rounded-xl bg-blue-700 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Loggar in...' : 'Logga in som TSM'}
            </button>

            <button
              onClick={() => navigate('/panel')}
              className="mt-4 w-full rounded-xl border border-red-500 bg-red-600 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Till projekten utan login
            </button>

            <button
              onClick={() => navigate('/register')}
              className="mt-4 w-full rounded-xl border border-green-500 bg-green-600 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              Registrera dig
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
