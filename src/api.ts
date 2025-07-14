import axios from 'axios';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/demo',
});

api.interceptors.request.use(async config => {
  const user = auth.currentUser;
  if (user && config.headers) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
