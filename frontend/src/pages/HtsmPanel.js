// src/pages/Dashboard.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const tokenData = localStorage.getItem('user');
  const token = tokenData ? JSON.parse(tokenData).token : null;

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else {
      fetchAllProjects();
    }
  }, []);

  const fetchAllProjects = async () => {
    try {
      const response = await axios.get('https://railworker-production.up.railway.app/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Kunde inte hämta projekt:', error);
      setProjects([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Menu */}
      <Header />

      {/* Page Content */}
      <div className="pt-24 px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skapa projekt */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4">Skapa nytt projekt</h2>
          <button
            onClick={() => navigate('/skapa-projekt')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded w-full text-lg font-semibold"
          >
            + Skapa nytt projekt
          </button>
        </div>

        {/* Lista med projekt */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4">Mina projekt</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">Inga projekt hittades.</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="border rounded p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-600">{project.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem('currentProject', JSON.stringify(project));
                      navigate(`/plan/${project.id}`)
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Visa projekt
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;