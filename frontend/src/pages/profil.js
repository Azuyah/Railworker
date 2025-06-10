import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const Profil = () => {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState({
    foretag: '',
    namn: '',
    telefon: '',
    email: '',
    losenord: ''
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('user', JSON.stringify(user));
    setEditing(false);
  };

  const labels = {
    foretag: 'Företag',
    namn: 'Namn',
    telefon: 'Telefon',
    email: 'E-post',
    losenord: 'Lösenord',
  };

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
                type={field === 'losenord' ? 'password' : 'text'}
                value={user[field]}
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