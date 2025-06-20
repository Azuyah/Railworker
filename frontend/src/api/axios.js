// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://railworker-production.up.railway.app',
});

instance.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;