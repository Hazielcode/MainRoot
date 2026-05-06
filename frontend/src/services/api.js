import axios from 'axios';

// Instancia base de Axios
const api = axios.create({
  // Asumimos que el backend de Node estará corriendo en el puerto 3000
  baseURL: 'http://localhost:3000/api', 
});

// Interceptor: Antes de que cualquier petición salga al backend, 
// este bloque inyectará el JWT en los Headers si existe en el navegador.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mainroot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
