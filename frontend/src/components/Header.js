// Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="bg-blue-700 text-white w-full shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">Railworker</h1>
        <nav className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:text-gray-200 transition"
          >
            Start
          </button>
          <button
            onClick={() => navigate('/profil')}
            className="hover:text-gray-200 transition"
          >
            Min profil
          </button>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            Logga ut
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;