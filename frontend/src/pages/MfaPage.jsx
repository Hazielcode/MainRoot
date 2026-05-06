import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../services/api.js';

const MfaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  // Recibimos el email y userId del login (pasados por navigate state)
  const mfaEmail = location.state?.email || '';
  const mfaUserId = location.state?.userId || null;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  // Si alguien llega a esta página sin pasar por el login, lo mandamos de regreso
  useEffect(() => {
    if (!mfaEmail) {
      navigate('/');
    }
  }, [mfaEmail, navigate]);

  // Auto-focus en el primer input al cargar
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Solo aceptar dígitos
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setErrorMsg('');

    // Auto-avanzar al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Si se completaron los 6 dígitos, enviar automáticamente
    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        submitMfa(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Retroceder al input anterior con Backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      submitMfa(pasted);
    }
  };

  const submitMfa = async (fullCode) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await api.post('/auth/mfa/validate', {
        userId: mfaUserId,
        token: fullCode
      });

      // MFA validado → guardamos el JWT y entramos al sistema
      localStorage.setItem('mainroot_token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.error || 'Código inválido');
      } else {
        setErrorMsg('Error de conexión con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Columna Izquierda - Branding */}
      <div className="branding-panel" style={{ flex: 1.2, backgroundColor: 'var(--accent-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '24px' }}>M</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', margin: 0 }}>Mainroot</h2>
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: '#ffffff', lineHeight: 1.1 }}>
            Verificación de<br/>Identidad.
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '500px' }}>
            Su identidad requiere un segundo factor de autenticación. Abra su aplicación autenticadora para obtener el código de acceso temporal.
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
      </div>

      {/* Columna Derecha - Input MFA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', backgroundColor: 'var(--bg-primary)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={16}/> Volver al Login
          </button>
          <button onClick={toggleTheme} className="btn-ghost" style={{ width: 36, height: 36 }}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', textAlign: 'center' }}>

            <div style={{ width: 64, height: 64, borderRadius: '16px', backgroundColor: 'var(--accent-light, rgba(37,99,235,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <ShieldCheck size={32} color="var(--accent-primary)"/>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Verificación MFA</h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Ingrese el código de 6 dígitos de su aplicación autenticadora
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500, marginBottom: '2rem' }}>
              {mfaEmail}
            </p>

            {errorMsg && (
              <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                {errorMsg}
              </div>
            )}

            {/* Los 6 inputs individuales */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '2rem' }} onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  disabled={isLoading}
                  style={{
                    width: '52px', height: '60px',
                    textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
                    backgroundColor: digit ? 'var(--accent-light, rgba(37,99,235,0.08))' : 'var(--bg-primary)',
                    border: `2px solid ${digit ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '10px', color: 'var(--text-primary)',
                    outline: 'none', transition: 'all 0.2s ease',
                    caretColor: 'var(--accent-primary)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'; }}
                  onBlur={e => { if (!digit) { e.target.style.borderColor = 'var(--border-color)'; } e.target.style.boxShadow = 'none'; }}
                />
              ))}
            </div>

            <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
              El código se actualiza cada 30 segundos. Si no funciona, espere al siguiente código.
            </p>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Mainroot System v1.0.0 &copy; {new Date().getFullYear()}
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

export default MfaPage;
