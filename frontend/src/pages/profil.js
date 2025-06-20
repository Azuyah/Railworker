import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import axios from '../api/axios';

const Profil = () => {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
axios.get('https://railworker-production.up.railway.app/api/user', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})
  .then(res => setUser(res.data))
  .catch(err => console.error('❌ Kunde inte hämta användare:', err));
}, []);

  const handleChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put('https://railworker-production.up.railway.app/api/user', user);
      setEditing(false);
    } catch (err) {
      console.error('Kunde inte spara användarinfo:', err);
      setError('Fel vid sparande av användare');
    }
  };

  const labels = {
    company: 'Företag',
    name: 'Namn',
    phone: 'Telefon',
    email: 'E-post',
    password: 'Lösenord',
  };

  if (loading) return <div className="p-10">Laddar användardata...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="pt-28 p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Min profil</h2>

          {Object.keys(labels).map((field) => (
            <div key={field} className="mb-4">
              <label className="block font-semibold mb-1">{labels[field]}</label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                value={user?.[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                disabled={!editing}
                className={`w-full px-4 py-2 rounded border ${editing ? 'bg-white' : 'bg-gray-100'}`}
              />
            </div>
          ))}

          <div className="flex justify-center mt-6">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Ändra uppgifter
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Spara ändringar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;