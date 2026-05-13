import axios from 'axios';

// Instancia base de Axios
const api = axios.create({
  // Asumimos que el backend de Node estará corriendo en el puerto 3000
  baseURL: 'http://localhost:3000/api', 
});

// Interceptor de Request: Inyecta el JWT automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mainroot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de Response: Maneja sesión expirada (401/403 por token inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Si el backend responde 401 por token expirado, limpiar sesión y redirigir
      if (status === 401 && data?.error?.includes('expirado')) {
        localStorage.removeItem('mainroot_token');
        // Solo redirigir si no estamos ya en la página de login
        if (!window.location.pathname.match(/^\/(mfa)?$/)) {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
