import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Aquí implementaremos la lógica del API para conectar con el backend
    console.log('Intentando iniciar sesión...');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <h1 className="text-gradient">Mainroot</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Zero Trust Inventory System</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="input-glass" 
              placeholder="tu@empresa.com" 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input 
              type="password" 
              className="input-glass" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Autenticarse de forma segura
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
