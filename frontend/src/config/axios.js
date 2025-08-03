import axios from 'axios';

const clientServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://linkedin-2-222u.onrender.com/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👇 Token interceptor (Automatically adds token if available)
clientServer.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default clientServer;
