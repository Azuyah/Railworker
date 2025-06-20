import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Header from '../components/Header';
import LoadingScreen from '../components/LoadingScreen';

export default function Panel() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
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
      setProjects([]); // fallback
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Menu */}
      <Header />

      {/* Projects List Only */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4">Alla projekt</h2>
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
                      <p className="text-sm text-gray-600">{project.plats}</p>
                    )}
                  </div>
<button
  onClick={() => navigate(`/plan/${project.id}`)}
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
}