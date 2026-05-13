import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../services/api.js';

const MfaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { login } = useAuth();
  const mfaEmail = location.state?.email || '';
  const mfaUserId = location.state?.userId || null;
  const [code, setCode] = useState(['','','','','','']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { if (!mfaEmail) navigate('/'); }, [mfaEmail, navigate]);
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (i, v) => {
    if (v && !/^\d$/.test(v)) return;
    const c = [...code]; c[i] = v; setCode(c); setErrorMsg('');
    if (v && i < 5) inputRefs.current[i+1]?.focus();
    if (v && i === 5) { const f = c.join(''); if (f.length===6) submitMfa(f); }
  };
  const handleKeyDown = (i, e) => { if (e.key==='Backspace' && !code[i] && i>0) inputRefs.current[i-1]?.focus(); };
  const handlePaste = (e) => { e.preventDefault(); const p=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6); if(p.length===6){setCode(p.split(''));inputRefs.current[5]?.focus();submitMfa(p);} };

  const submitMfa = async (fullCode) => {
    setIsLoading(true); setErrorMsg('');
    try {
      const r = await api.post('/auth/mfa/validate', { userId: mfaUserId, token: fullCode });
      // Usar AuthContext para login
      login(r.data.token, r.data.user);
      navigate('/dashboard');
    } catch (err) {
      setCode(['','','','','','']); inputRefs.current[0]?.focus();
      const errMsg = err.response?.data?.error || 'Código inválido';
      setErrorMsg(errMsg);
      // Si el backend fuerza re-login (max intentos MFA)
      if (err.response?.data?.forceRelogin) {
        setTimeout(() => navigate('/'), 2000);
      }
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <div className="branding-panel" style={{ flex:1.3, background:'linear-gradient(160deg, #367CFC 0%, #6C27D2 60%, #5d329b 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'5rem', color:'white', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'relative', zIndex:10, maxWidth:'550px' }}>
          <div style={{ marginBottom:'2.5rem', display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{ width:48, height:48, backgroundColor:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ color:'white', fontWeight:800, fontSize:'1.4rem' }}>M</span></div>
            <span style={{ fontSize:'1.4rem', fontWeight:700, color:'white' }}>Mainroot</span>
          </div>
          <h1 style={{ fontSize:'3rem', fontWeight:800, marginBottom:'1.5rem', lineHeight:1.08, letterSpacing:'-0.03em' }}>Verificación de<br/>Identidad.</h1>
          <p style={{ fontSize:'1.1rem', opacity:0.85, lineHeight:1.7, maxWidth:'420px' }}>Abra su aplicación autenticadora para obtener el código de acceso temporal.</p>
        </div>
        <div style={{ position:'absolute', top:'-15%', right:'-15%', width:500, height:500, background:'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', borderRadius:'50%' }}></div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'2.5rem', backgroundColor:'var(--bg-primary)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <button onClick={()=>navigate('/')} className="btn-ghost" style={{ display:'flex', alignItems:'center', gap:6, padding:'0.5rem 0.85rem', fontSize:'0.85rem', borderRadius:12 }}><ArrowLeft size={16}/> Volver</button>
          <button onClick={toggleTheme} className="btn-ghost" style={{ width:40, height:40, borderRadius:12 }}>{isDarkMode?'☀️':'🌙'}</button>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="card animate-fade-in" style={{ width:'100%', maxWidth:480, padding:'3rem', textAlign:'center', borderRadius:28 }}>
            <div style={{ width:68, height:68, borderRadius:20, background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}><ShieldCheck size={34} color="var(--accent-primary)"/></div>
            <h2 style={{ fontSize:'1.5rem', marginBottom:'0.4rem' }}>Verificación MFA</h2>
            <p className="text-secondary" style={{ fontSize:'0.88rem', marginBottom:'0.25rem' }}>Ingrese el código de 6 dígitos</p>
            <p style={{ fontSize:'0.85rem', color:'var(--accent-primary)', fontWeight:600, marginBottom:'2rem' }}>{mfaEmail}</p>
            {errorMsg && <div style={{ background:'rgba(239,68,68,0.08)', color:'var(--danger)', padding:'0.75rem', borderRadius:14, marginBottom:'1.5rem', fontSize:'0.85rem', border:'1px solid rgba(239,68,68,0.15)' }}>{errorMsg}</div>}
            <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:'2rem' }} onPaste={handlePaste}>
              {code.map((d,i)=>(
                <input key={i} ref={el=>inputRefs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKeyDown(i,e)} disabled={isLoading}
                  style={{ width:54, height:64, textAlign:'center', fontSize:'1.5rem', fontWeight:700, backgroundColor:d?'var(--accent-light)':'var(--bg-primary)', border:`2px solid ${d?'var(--accent-primary)':'var(--border-color)'}`, borderRadius:14, color:'var(--text-primary)', outline:'none', transition:'all 0.2s', fontFamily:'Poppins' }}
                  onFocus={e=>{e.target.style.borderColor='var(--accent-primary)';e.target.style.boxShadow='0 0 0 4px rgba(54,124,252,0.1)';}}
                  onBlur={e=>{if(!d)e.target.style.borderColor='var(--border-color)';e.target.style.boxShadow='none';}}/>
              ))}
            </div>
            <p className="text-secondary" style={{ fontSize:'0.78rem' }}>El código se actualiza cada 30 segundos.</p>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.branding-panel{display:none!important;}}`}</style>
    </div>
  );
};
export default MfaPage;
