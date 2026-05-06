import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.removeItem('mainroot_token');
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header del Dashboard */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>Mainroot Enterprise</h2>
          <p className="text-secondary">Panel de Control General</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={toggleTheme} className="btn-icon" title="Alternar Tema">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      {/* Grilla de Gráficos (Placeholder) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Auditoría Zero Trust (Live)</h3>
          <p className="text-secondary">Aquí insertaremos un gráfico de líneas (LineChart) que muestre la actividad de los usuarios y bloqueos de seguridad en las últimas 24 horas.</p>
        </div>
        
        <div className="card" style={{ padding: '2rem', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Distribución de Inventario</h3>
          <p className="text-secondary">Aquí insertaremos un gráfico circular (PieChart) mostrando el porcentaje de stock por categoría o sucursal.</p>
        </div>

        <div className="card" style={{ padding: '2rem', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '1rem' }}>MFA Compliance</h3>
          <p className="text-secondary">Gráfico radial mostrando qué porcentaje de tus empleados tiene su Autenticador 2FA activo.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
