import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MfaPage from './pages/MfaPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import StoresPage from './pages/StoresPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import RolesPage from './pages/RolesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
export const ThemeContext = createContext();

/**
 * Protección de rutas con validación de JWT real.
 * Opcionalmente verifica roles específicos.
 */
const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)', fontSize: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', animation: 'pulse 1.5s infinite'
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem' }}>M</span>
          </div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" />;

  // Verificación de rol opcional
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: 'var(--bg-primary)',
        color: 'var(--danger)', fontSize: '1rem', textAlign: 'center', padding: '2rem'
      }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>🚫 Acceso Denegado</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Su rol no tiene permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/mfa" element={<MfaPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Rutas Protegidas — Acceso según RBAC */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/stores" element={<ProtectedRoute requiredRoles={['Admin', 'Gerente', 'Empleado', 'Auditor']}><StoresPage /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute requiredRoles={['Admin']}><StaffPage /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute requiredRoles={['Admin', 'Auditor']}><AuditPage /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute requiredRoles={['Admin']}><RolesPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeContext.Provider>
  );
};

export default App;
