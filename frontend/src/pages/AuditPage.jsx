import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Search } from 'lucide-react';
import api from '../services/api.js';

const badgeMap = { CREATE:{ bg:'rgba(16,185,129,0.1)',color:'#10b981',label:'Creación' }, UPDATE:{ bg:'rgba(37,99,235,0.1)',color:'#2563eb',label:'Edición' }, DELETE:{ bg:'rgba(239,68,68,0.1)',color:'#ef4444',label:'Eliminación' } };

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try { const res = await api.get('/audit'); setLogs(res.data || []); }
      catch { setLogs([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = logs.filter(l => JSON.stringify(l).toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Auditoría" subtitle="Registro inmutable de acciones del sistema (Gran Ojo)">
      <div style={{ marginBottom:'1.5rem', position:'relative', maxWidth:360 }}>
        <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }}/>
        <input className="input-control" placeholder="Filtrar logs..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'2.2rem' }}/>
      </div>
      <div className="card"><div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ borderBottom:'1px solid var(--border-color)' }}>
            {['Acción','Entidad','Usuario','IP','Datos Anteriores','Datos Nuevos','Fecha'].map(h=><th key={h} style={{ textAlign:'left',padding:'0.75rem 1.25rem',fontSize:'0.72rem',fontWeight:600,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding:'3rem',textAlign:'center',color:'var(--text-secondary)' }}>Cargando logs...</td></tr>
            : filtered.length===0 ? <tr><td colSpan={7} style={{ padding:'3rem',textAlign:'center',color:'var(--text-secondary)' }}>Sin registros de auditoría.</td></tr>
            : filtered.map((l,i)=>{
              const b = badgeMap[l.accion] || { bg:'rgba(100,100,100,0.1)',color:'#666',label:l.accion };
              return (
                <tr key={i} style={{ borderBottom:'1px solid var(--border-color)',transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor='var(--accent-light)'}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
                  <td style={{ padding:'0.85rem 1.25rem' }}><span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'0.2rem 0.55rem',borderRadius:100,fontSize:'0.72rem',fontWeight:600,backgroundColor:b.bg,color:b.color }}><span style={{ width:5,height:5,borderRadius:'50%',backgroundColor:b.color }}></span>{b.label}</span></td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.85rem',fontWeight:500,color:'var(--text-primary)' }}>{l.entidad}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.85rem',color:'var(--text-secondary)',fontFamily:'monospace' }}>{l.usuario_email||l.usuario_id}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.8rem',color:'var(--text-secondary)',fontFamily:'monospace' }}>{l.ip||'—'}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.75rem',color:'var(--text-secondary)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{l.datos_anteriores ? JSON.stringify(l.datos_anteriores).slice(0,60)+'...' : '—'}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.75rem',color:'var(--text-secondary)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{l.datos_nuevos ? JSON.stringify(l.datos_nuevos).slice(0,60)+'...' : '—'}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.8rem',color:'var(--text-secondary)' }}>{l.fecha ? new Date(l.fecha).toLocaleString('es-PE') : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div></div>
    </DashboardLayout>
  );
};
export default AuditPage;
