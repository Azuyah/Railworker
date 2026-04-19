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

export default function HtsmLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
          HTSM
        </p>
        <h2 className="mb-2 text-center text-3xl font-bold text-slate-950">Logga in</h2>
        <p className="mb-6 text-center text-sm leading-6 text-slate-600">
          Logga in för att skapa projekt, arbeta vidare med disp och hantera plankan.
        </p>

        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm"
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm"
        />
        <button
          onClick={handleHtsmLogin}
          className="w-full rounded-xl bg-blue-700 py-3 font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? 'Loggar in...' : 'Logga in som HTSM'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-100 py-3 font-semibold text-slate-700 hover:bg-slate-200"
        >
          Tillbaka
        </button>
      </div>
    </div>
  );
}
