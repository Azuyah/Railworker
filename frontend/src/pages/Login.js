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

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('TSM');
  const [tsmName, setTsmName] = useState('');
  const [tsmPhone, setTsmPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTsmLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post(apiUrl('/api/login-tsm'), {
        name: tsmName,
        phone: tsmPhone,
      });

      if (persistAuth(res.data)) {
        navigate('/dashboard');
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

  const handleHtsmLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post(apiUrl('/api/login'), {
        email,
        password,
      });

      if (persistAuth(res.data)) {
        navigate('/dashboard');
        return;
      }

      alert('Inloggning misslyckades');
    } catch (error) {
      alert('Fel användaruppgifter eller inloggning misslyckades');
      console.error('HTSM login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm brightness-75"
        style={{ backgroundImage: `url('/background.jpg')` }}
      />

      <div className="absolute top-6 right-6 z-20">
        {mode === 'TSM' ? (
          <button
            onClick={() => setMode('HTSM')}
            className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-white"
          >
            HTSM-inloggning
          </button>
        ) : (
          <button
            onClick={() => setMode('TSM')}
            className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-white"
          >
            TSM-inloggning
          </button>
        )}
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white bg-opacity-90 p-8 shadow-xl">
        <div className="mb-4 flex justify-center">
          <img
            src="/vallakra-railworker-logo.png"
            alt="Vallåkra Railworker"
            className="h-16 w-auto object-contain"
          />
        </div>
        <h2 className="mb-2 text-center text-3xl font-bold">Vallåkra Railworker</h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          {mode === 'TSM'
            ? 'Logga in med ditt namn och telefonnummer för att förplanera.'
            : 'HTSM loggar in med e-post och lösenord.'}
        </p>

        {mode === 'TSM' && (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Du kan öppna TSM-sidan utan inloggning för att se projekt och ladda ner disp. Inloggning behövs först när du ska förplanera.
          </div>
        )}

        {mode === 'TSM' ? (
          <>
            <input
              type="text"
              placeholder="Namn"
              value={tsmName}
              onChange={(e) => setTsmName(e.target.value)}
              className="mb-4 w-full rounded border px-4 py-2"
            />
            <input
              type="text"
              placeholder="Telefonnummer"
              value={tsmPhone}
              onChange={(e) => setTsmPhone(e.target.value)}
              className="mb-4 w-full rounded border px-4 py-2"
            />
            <button
              onClick={handleTsmLogin}
              className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Loggar in...' : 'Logga in'}
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
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 w-full rounded border px-4 py-2"
            />
            <input
              type="password"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 w-full rounded border px-4 py-2"
            />
            <button
              onClick={handleHtsmLogin}
              className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Loggar in...' : 'Logga in'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
