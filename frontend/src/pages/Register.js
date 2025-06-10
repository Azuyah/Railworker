import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    password: ''
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
      const response = await axios.post('http://localhost:4000/api/register', formData);
      if (response.status === 201) {
        alert('Registrering lyckades!');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registreringen misslyckades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="pt-28 p-6 max-w-xl mx-auto">
        <div className="bg-white rounded shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Registrera dig</h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {[{ key: 'company', label: 'Företag' },
            { key: 'name', label: 'För & efternamn' },
            { key: 'phone', label: 'Telefonnummer' },
            { key: 'email', label: 'Email' },
            { key: 'password', label: 'Lösenord', type: 'password' }].map(({ key, label, type }) => (
              <div key={key} className="mb-4">
                <label className="block font-semibold mb-1">{label}</label>
                <input
                  type={type || 'text'}
                  value={formData[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-4 py-2 rounded border bg-white"
                />
              </div>
          ))}

          <div className="flex justify-center mt-6">
            <button
              onClick={handleRegister}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Registrerar...' : 'Registrera'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;