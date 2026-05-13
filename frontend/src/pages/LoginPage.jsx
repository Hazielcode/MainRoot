import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.mfaRequired) {
        navigate('/mfa', { state: { email: response.data.email, userId: response.data.userId } });
        return;
      } else {
        // Usar AuthContext para login
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.error || 'Credenciales inválidas');
      } else {
        setErrorMsg('Error de red: ¿Está encendido el servidor backend?');
      }
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Panel Izquierdo — Branding con gradiente Paqari */}
      <div className="branding-panel" style={{
        flex: 1.3,
        background: 'linear-gradient(160deg, #367CFC 0%, #6C27D2 60%, #5d329b 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '5rem', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '550px' }}>
          <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '1.4rem' }}>M</span>
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Mainroot</span>
          </div>

          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
            Gestión de<br/>Inventario<br/>Enterprise.
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.7, maxWidth: '420px', fontWeight: 400 }}>
            Arquitectura Zero Trust, control de acceso granular y auditoría en tiempo real para operaciones seguras.
          </p>
        </div>

        {/* Decoración de fondo */}
        <div style={{ position: 'absolute', top: '-15%', right: '-15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '3rem', left: '5rem', fontSize: '0.85rem', opacity: 0.5 }}>
          © {new Date().getFullYear()} Mainroot System
        </div>
      </div>

      {/* Panel Derecho — Formulario */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '2.5rem', backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button onClick={toggleTheme} className="btn-ghost" style={{ width: 40, height: 40, borderRadius: '12px' }}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '430px', padding: '3rem', borderRadius: '28px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Bienvenido</h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Ingrese sus credenciales corporativas</p>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', padding: '0.85rem 1rem', borderRadius: '14px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(239,68,68,0.15)', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label className="input-label">Correo Electrónico</label>
                <input type="email" className="input-control" placeholder="usuario@mainroot.com" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{ borderRadius: '14px', padding: '0.8rem 1.1rem' }}/>
              </div>
              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <input type="password" className="input-control" placeholder="••••••••" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ borderRadius: '14px', padding: '0.8rem 1.1rem' }}/>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  <input type="checkbox" style={{ accentColor: 'var(--accent-primary)', width: 16, height: 16 }} />
                  Recordar sesión
                </label>
                <a href="#" style={{ color: 'var(--accent-primary)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
                  ¿Olvidó su contraseña?
                </a>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isLoading}
                style={{ padding: '0.85rem', fontSize: '0.92rem', borderRadius: '14px' }}>
                {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ¿No tiene cuenta?{' '}
              <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Regístrese aquí</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .branding-panel { display: none !important; } }`}</style>
    </div>
  );
};

export default LoginPage;
