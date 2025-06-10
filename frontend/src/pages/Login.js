import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:4000/api/login', {
      email,
      password,
    });

    const { token, role, foretag, namn, telefon, email: userEmail, losenord } = response.data;

    localStorage.setItem('user', JSON.stringify({
      token,
      role,
      foretag,
      namn,
      telefon,
      email: userEmail,
      losenord,
    }));

    navigate('/dashboard'); // ✅ Always go here, role check is done in App.js
  } catch (error) {
    alert('Invalid credentials');
    console.error('Login error:', error);
  }
};

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm brightness-75"
        style={{ backgroundImage: `url('/background.jpg')` }}
      ></div>

      {/* Login box */}
      <div className="relative z-10 p-8 bg-white bg-opacity-90 shadow-xl rounded-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center">Railworker Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Logga in
        </button>
        <div className="mt-4 text-center">
          <p className="text-sm">
            Har du inget konto?
            <button
              onClick={() => navigate('/register')}
              className="ml-1 text-blue-600 hover:underline"
            >
              Registrera dig
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}