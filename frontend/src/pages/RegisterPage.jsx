import React, { useContext, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';
import { Check, X } from 'lucide-react';
import api from '../services/api.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const [form, setForm] = useState({ nombre_completo: '', email: '', password: '', confirmPassword: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrorMsg('');
  };

  // Checklist de validación de contraseña en tiempo real
  const passwordRules = useMemo(() => {
    const p = form.password;
    return [
      { label: 'Mínimo 8 caracteres', valid: p.length >= 8 },
      { label: 'Al menos 1 letra mayúscula (A-Z)', valid: /[A-Z]/.test(p) },
      { label: 'Al menos 1 número (0-9)', valid: /\d/.test(p) },
      { label: 'Al menos 1 carácter especial (@$!%*?&)', valid: /[@$!%*?&]/.test(p) },
    ];
  }, [form.password]);

  const allRulesPass = passwordRules.every(r => r.valid);
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!allRulesPass) {
      setErrorMsg('La contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        nombre_completo: form.nombre_completo
      });
      setSuccessMsg('Cuenta creada exitosamente. Redirigiendo al login...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.error || 'Error al registrar');
      } else {
        setErrorMsg('Error de conexión con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Columna Izquierda */}
      <div className="branding-panel" style={{ flex: 1.2, backgroundColor: 'var(--accent-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '24px' }}>M</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', margin: 0 }}>Mainroot</h2>
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: '#ffffff', lineHeight: 1.1 }}>
            Registro de<br/>Personal.
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '500px' }}>
            Cree su cuenta corporativa para acceder al sistema de gestión de inventario. Sus credenciales serán protegidas con cifrado de grado militar.
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
      </div>

      {/* Columna Derecha */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={toggleTheme} className="btn-ghost" style={{ width: 36, height: 36 }}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>

            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Crear Cuenta</h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Complete los datos para su registro corporativo</p>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label className="input-label">Nombre Completo</label>
                <input type="text" className="input-control" placeholder="Juan Pérez" required
                  value={form.nombre_completo} onChange={e => handleChange('nombre_completo', e.target.value)}/>
              </div>

              <div className="input-group">
                <label className="input-label">Correo Electrónico</label>
                <input type="email" className="input-control" placeholder="usuario@mainroot.com" required
                  value={form.email} onChange={e => handleChange('email', e.target.value)}/>
              </div>

              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <input type="password" className="input-control" placeholder="••••••••" required
                  value={form.password} onChange={e => handleChange('password', e.target.value)}/>
              </div>

              {/* ===== CHECKLIST DE SEGURIDAD DE CONTRASEÑA ===== */}
              {form.password.length > 0 && (
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Requisitos de Seguridad
                  </p>
                  {passwordRules.map((rule, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', transition: 'all 0.2s ease' }}>
                      {rule.valid 
                        ? <Check size={14} color="var(--success)" strokeWidth={3}/>
                        : <X size={14} color="var(--danger)" strokeWidth={3}/>
                      }
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: rule.valid ? 'var(--success)' : 'var(--danger)', transition: 'color 0.2s ease' }}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Confirmar Contraseña</label>
                <input type="password" className="input-control" placeholder="••••••••" required
                  value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)}
                  style={{ borderColor: form.confirmPassword.length > 0 ? (passwordsMatch ? 'var(--success)' : 'var(--danger)') : 'var(--border-color)' }}/>
                {form.confirmPassword.length > 0 && !passwordsMatch && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 500 }}>Las contraseñas no coinciden</span>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isLoading || !allRulesPass || !passwordsMatch}>
                {isLoading ? 'Creando cuenta...' : 'Registrarse'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ¿Ya tiene cuenta?{' '}
              <Link to="/" style={{ color: 'var(--accent-primary)', fontWeight: 500, textDecoration: 'none' }}>Iniciar Sesión</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .branding-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
