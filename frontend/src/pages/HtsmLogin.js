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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm brightness-75"
        style={{ backgroundImage: `url('/background.jpg')` }}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/92 p-8 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="rounded-xl border border-white/80 bg-white px-3 py-2 shadow-lg shadow-slate-900/10">
            <img
              src="/vallakra-railworker-logo.png"
              alt="Vallåkra Railworker"
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        <h2 className="mb-2 text-center text-3xl font-bold">HTSM-inloggning</h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          Logga in för att arbeta vidare med projekt, disp och planka.
        </p>

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
          {loading ? 'Loggar in...' : 'Logga in som HTSM'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full rounded border border-slate-300 bg-slate-100 py-2 font-semibold text-slate-700 hover:bg-slate-200"
        >
          Tillbaka
        </button>
      </div>
    </div>
  );
}
