import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export const ThemeContext = createContext();

// HOC (Higher Order Component) para proteger rutas privadas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('mainroot_token');
  if (!token) {
    // Si no hay token, lo mandamos al login inmediatamente
    return <Navigate to="/" />;
  }
  return children;
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('mainroot_theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('mainroot_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('mainroot_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          {/* Ruta Protegida: El Dashboard del Sistema */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
};

export default App;
