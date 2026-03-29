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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="pt-28 p-6 max-w-xl mx-auto">
        <div className="bg-white rounded shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Registrera dig</h2>
          <p className="text-sm text-gray-600 mb-6">
            Fyll i dina uppgifter så kommer du direkt in i TSM-sidan. Om telefonnumret redan finns registrerat loggas du in direkt.
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block font-semibold mb-1">Företag</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="w-full px-4 py-2 rounded border bg-white"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Förnamn</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-4 py-2 rounded border bg-white"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Efternamn</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-4 py-2 rounded border bg-white"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Telefonnummer</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-2 rounded border bg-white"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleRegister}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Registrerar...' : 'Registrera mig'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
