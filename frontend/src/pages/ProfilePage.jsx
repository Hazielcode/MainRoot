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
    <DashboardLayout title="Mi Perfil" subtitle="Configuración de cuenta y seguridad MFA">
      <div className="p-6 max-w-4xl mx-auto animation-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de Información Personal */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold mb-4 shadow-lg">
                {user.nombres ? user.nombres.charAt(0).toUpperCase() : (user.nombre_completo ? user.nombre_completo.charAt(0).toUpperCase() : 'U')}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                {user.nombre_completo}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
              
              <div className="w-full flex flex-wrap justify-center gap-2 mt-2">
                {user.roles?.map(rol => (
                  <span key={rol} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded-full border border-indigo-100 dark:border-indigo-800">
                    {rol}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Teléfono</p>
                <p className="text-sm text-gray-900 dark:text-gray-200">{user.telefono || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Fecha de Nacimiento</p>
                <p className="text-sm text-gray-900 dark:text-gray-200">{user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString('es-PE') : 'No registrado'}</p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Seguridad (MFA) */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Seguridad de la Cuenta
            </h3>
            
            <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Autenticación de Dos Pasos (MFA)</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                    Protege tu cuenta exigiendo un código temporal generado en tu celular cada vez que inicies sesión.
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mfaStatus === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                  {mfaStatus === 'active' ? 'Activado' : 'Recomendado'}
                </span>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm rounded-r-md">
                  {success}
                </div>
              )}

              {/* Estado 1: Botón para iniciar */}
              {mfaStatus === 'setup_needed' && (
                <button
                  onClick={initiateMfaSetup}
                  disabled={isLoading}
                  className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isLoading ? 'Generando código...' : 'Configurar Authenticator'}
                </button>
              )}

              {/* Estado 2: Mostrar QR y Formulario */}
              {mfaStatus === 'setup_in_progress' && qrCodeUrl && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <img src={qrCodeUrl} alt="QR Code MFA" className="w-40 h-40" />
                    </div>
                    
                    <div className="flex-1">
                      <ol className="list-decimal pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                        <li>Descarga <strong>Google Authenticator</strong> en tu celular.</li>
                        <li>Abre la app y selecciona "Escanear código QR".</li>
                        <li>Apunta la cámara al código que ves a la izquierda.</li>
                        <li>Ingresa el código de 6 dígitos que aparece en tu app.</li>
                      </ol>
                      
                      <form onSubmit={verifyAndEnableMfa} className="flex gap-3">
                        <input
                          type="text"
                          value={mfaToken}
                          onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="flex-1 max-w-[150px] px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 dark:text-white"
                          maxLength="6"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isLoading || mfaToken.length !== 6}
                          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Verificando...' : 'Activar'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Estado 3: Activo */}
              {mfaStatus === 'active' && (
                <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Tu cuenta está fuertemente protegida.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
