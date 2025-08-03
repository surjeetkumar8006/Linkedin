import axios from 'axios';

const clientServer = axios.create({
  baseURL: 'http://localhost:8080/api',  // ✅ Yeh hona chahiye
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
