import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  // Consumimos el contexto para el botón de Dark/Light mode
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Intentando iniciar sesión en el entorno corporativo...');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Columna Izquierda - Branding Corporativo (Estilo SaaS Enterprise) */}
      <div 
        className="branding-panel"
        style={{ 
          flex: 1.2, 
          backgroundColor: 'var(--accent-primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '24px' }}>M</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', margin: 0 }}>Mainroot</h2>
          </div>

          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: '#ffffff', lineHeight: 1.1 }}>
            Gestión de Inventario<br/>Enterprise.
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '500px' }}>
            Arquitectura Zero Trust, control de acceso granular y auditoría en tiempo real para operaciones seguras.
          </p>
        </div>
        
        {/* Decoración geométrica sutil para darle el toque corporativo */}
        <div style={{
          position: 'absolute',
          bottom: '-20%', right: '-10%', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%'
        }}></div>
      </div>

      {/* Columna Derecha - Formulario Elegante */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        padding: '2rem',
        position: 'relative',
        backgroundColor: 'var(--bg-primary)'
      }}>
        
        {/* Toggle Theme Switcher */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button onClick={toggleTheme} className="btn-icon" title="Alternar Apariencia">
            {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </div>

        {/* Contenedor del Formulario Centrado */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Acceso al Sistema</h2>
              <p className="text-secondary">Ingrese sus credenciales corporativas</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label className="input-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="input-control" 
                  placeholder="usuario@empresa.com" 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <input 
                  type="password" 
                  className="input-control" 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--accent-primary)' }} />
                  Recordar sesión
                </label>
                <a href="#" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
                  ¿Olvidó su contraseña?
                </a>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Iniciar Sesión Segura
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Mainroot System v1.0.0 &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>

      {/* Regla CSS inyectada para hacerlo Responsivo */}
      <style>{`
        @media (max-width: 900px) {
          .branding-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
