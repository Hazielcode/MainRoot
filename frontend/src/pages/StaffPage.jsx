import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { UserCheck, UserX, Search } from 'lucide-react';
import api from '../services/api.js';

const StaffPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [uRes, rRes] = await Promise.all([api.get('/users'), api.get('/roles')]);
      setUsers(uRes.data || []); setRoles(rRes.data || []);
    } catch { setUsers([]); setRoles([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const assignRole = async (uid, rid) => {
    try { await api.post(`/users/${uid}/roles`, { rol_id: rid }); fetchData(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };
  const toggleStatus = async (uid) => {
    try { await api.patch(`/users/${uid}/status`); fetchData(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const filtered = users.filter(u => (u.email||'').toLowerCase().includes(searchTerm.toLowerCase()) || (u.nombre_completo||'').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <DashboardLayout title="Personal" subtitle="Gestión de cuentas y roles">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', gap:'1rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, maxWidth:360 }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }}/>
          <input className="input-control" placeholder="Buscar..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ paddingLeft:'2.2rem' }}/>
        </div>
      </div>
      <div className="card"><div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ borderBottom:'1px solid var(--border-color)' }}>
            {['Usuario','Correo','Estado','Rol','Asignar Rol','Acción'].map(h=><th key={h} style={{ textAlign:'left', padding:'0.75rem 1.25rem', fontSize:'0.72rem', fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>Cargando...</td></tr>
            : filtered.length===0 ? <tr><td colSpan={6} style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>Sin resultados</td></tr>
            : filtered.map(u=>(
              <tr key={u.id} style={{ borderBottom:'1px solid var(--border-color)', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor='var(--accent-light)'}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
                <td style={{ padding:'0.85rem 1.25rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                    <div style={{ width:34,height:34,borderRadius:'50%',backgroundColor:u.activo!==false?'var(--accent-primary)':'var(--text-secondary)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'0.8rem',fontWeight:600 }}>{(u.nombre_completo||u.email||'?')[0].toUpperCase()}</div>
                    <span style={{ fontWeight:500,color:'var(--text-primary)',fontSize:'0.9rem' }}>{u.nombre_completo||'—'}</span>
                  </div>
                </td>
                <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.85rem',color:'var(--text-secondary)',fontFamily:'monospace' }}>{u.email}</td>
                <td style={{ padding:'0.85rem 1.25rem' }}><span style={{ padding:'0.15rem 0.5rem',borderRadius:'100px',fontSize:'0.72rem',fontWeight:600,backgroundColor:u.activo!==false?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',color:u.activo!==false?'var(--success)':'var(--danger)' }}>{u.activo!==false?'Activo':'Bloqueado'}</span></td>
                <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.85rem',fontWeight:500 }}>{u.roles?.join(', ')||u.rol||'Sin rol'}</td>
                <td style={{ padding:'0.85rem 1.25rem' }}>
                  <select className="input-control" style={{ padding:'0.4rem',fontSize:'0.8rem',maxWidth:140 }} onChange={e=>{if(e.target.value)assignRole(u.id,e.target.value);e.target.value='';}} defaultValue=""><option value="" disabled>Seleccionar</option>{roles.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</select>
                </td>
                <td style={{ padding:'0.85rem 1.25rem' }}><button className="btn-ghost" onClick={()=>toggleStatus(u.id)} style={{ width:32,height:32,color:u.activo!==false?'var(--danger)':'var(--success)' }}>{u.activo!==false?<UserX size={16}/>:<UserCheck size={16}/>}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </DashboardLayout>
  );
};
export default StaffPage;
