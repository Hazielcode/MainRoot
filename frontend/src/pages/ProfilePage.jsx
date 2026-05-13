import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout.jsx';

const ProfilePage = () => {
  const { user } = useAuth();
  
  // Estados para el flujo MFA
  const [mfaStatus, setMfaStatus] = useState('checking'); // checking, setup_needed, active
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [setupSecret, setSetupSecret] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Si no hay información sobre el MFA del usuario en el contexto,
    // asuminos que todavía no está activado hasta que se compruebe o cambie.
    // (Idealmente el backend enviaría si tiene mfa_habilitado al loguearse)
    // Por simplicidad, si no lo tiene, mostraremos la opción de configurarlo.
    setMfaStatus('setup_needed');
  }, [user]);

  const initiateMfaSetup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pedimos el código QR al backend
      const response = await api.post('/auth/mfa/setup', {
        userId: user.id,
        email: user.email
      });
      
      setQrCodeUrl(response.data.qrCode);
      setSetupSecret(response.data.secret);
      setMfaStatus('setup_in_progress');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al solicitar configuración MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnableMfa = async (e) => {
    e.preventDefault();
    if (!mfaToken || mfaToken.length !== 6) {
      setError('El código debe tener 6 dígitos numéricos.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/mfa/enable', {
        userId: user.id,
        token: mfaToken
      });
      
      setSuccess(response.data.message);
      setMfaStatus('active');
    } catch (err) {
      setError(err.response?.data?.error || 'Código incorrecto. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout title="Mi Perfil" subtitle="Configuración de cuenta y seguridad">
      <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Perfil de Usuario</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gestiona tu información personal y la seguridad de tu cuenta.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* Tarjeta de Información Personal */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', boxShadow: 'var(--shadow-glow)'
            }}>
              {user.nombres ? user.nombres.charAt(0).toUpperCase() : (user.nombre_completo ? user.nombre_completo.charAt(0).toUpperCase() : 'U')}
            </div>
            
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.2rem', textAlign: 'center' }}>
              {user.nombre_completo}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{user.email}</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
              {user.roles?.map(rol => (
                <span key={rol} className="badge badge-success">{rol}</span>
              ))}
            </div>

            <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Teléfono</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user.telefono || 'No registrado'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>F. Nacimiento</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString('es-PE') : 'No registrado'}
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Seguridad (MFA) - Solo visible para No-Admins */}
          {!user.roles?.includes('Admin') && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>Seguridad de la Cuenta</h3>
              </div>
            
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Autenticación de Dos Pasos (MFA)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '400px' }}>
                    Protege tu cuenta exigiendo un código temporal generado en tu celular cada vez que inicies sesión.
                  </p>
                </div>
                <span className={mfaStatus === 'active' ? 'badge badge-success' : 'badge badge-danger'}>
                  {mfaStatus === 'active' ? 'Activado' : 'Recomendado'}
                </span>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid var(--danger)', padding: '1rem', color: 'var(--danger)', fontSize: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500 }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={{ background: 'rgba(16,185,129,0.1)', borderLeft: '4px solid var(--success)', padding: '1rem', color: 'var(--success)', fontSize: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500 }}>
                  {success}
                </div>
              )}

              {mfaStatus === 'setup_needed' && (
                <button onClick={initiateMfaSetup} disabled={isLoading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  {isLoading ? 'Generando código...' : 'Configurar Authenticator'}
                </button>
              )}

              {mfaStatus === 'setup_in_progress' && qrCodeUrl && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <img src={qrCodeUrl} alt="QR Code MFA" style={{ width: '150px', height: '150px', display: 'block' }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <ol style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                        <li>Descarga <strong>Google Authenticator</strong> en tu celular.</li>
                        <li>Abre la app y selecciona "Escanear código QR".</li>
                        <li>Apunta la cámara al código que ves a la izquierda.</li>
                        <li>Ingresa el código de 6 dígitos que aparece en tu app.</li>
                      </ol>
                      
                      <form onSubmit={verifyAndEnableMfa} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                          type="text"
                          value={mfaToken}
                          onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000 000"
                          className="input-control"
                          maxLength="6"
                          required
                          style={{ maxWidth: '150px', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 'bold' }}
                        />
                        <button type="submit" disabled={isLoading || mfaToken.length !== 6} className="btn btn-primary">
                          {isLoading ? 'Verificando...' : 'Activar'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {mfaStatus === 'active' && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ marginRight: '6px' }}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Tu cuenta está fuertemente protegida.
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
