import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import MfaPage from './pages/MfaPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import StoresPage from './pages/StoresPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import RolesPage from './pages/RolesPage.jsx';

export const ThemeContext = createContext();

// TEMPORAL: Protección desactivada para desarrollo visual.
// Cuando conectemos el backend, descomentar la validación del JWT.
const ProtectedRoute = ({ children }) => {
  // const token = localStorage.getItem('mainroot_token');
  // if (!token) return <Navigate to="/" />;
  return children;
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const s = localStorage.getItem('mainroot_theme');
    if (s) return s === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('mainroot_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme: () => setIsDarkMode(!isDarkMode) }}>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/mfa" element={<MfaPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Rutas Protegidas */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          <Route path="/stores" element={<ProtectedRoute><StoresPage /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><AuditPage /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute><RolesPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
};

export default App;
