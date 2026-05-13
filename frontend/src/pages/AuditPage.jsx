import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Search, Filter, Download, ShieldAlert } from 'lucide-react';
import api from '../services/api.js';

const badgeMap = { 
  CREATE: { bg:'rgba(16,185,129,0.1)', color:'#10b981', label:'Creación' }, 
  UPDATE: { bg:'rgba(37,99,235,0.1)', color:'#2563eb', label:'Edición' }, 
  DELETE: { bg:'rgba(239,68,68,0.1)', color:'#ef4444', label:'Eliminación' },
  ASSIGN_ROLE: { bg:'rgba(139,92,246,0.1)', color:'#8b5cf6', label:'Asignación' },
  REVOKE_ROLE: { bg:'rgba(245,158,11,0.1)', color:'#f59e0b', label:'Revocación' },
  TOGGLE_STATUS: { bg:'rgba(6,182,212,0.1)', color:'#06b6d4', label:'Estado' },
};

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [stats, setStats] = useState(null);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filterEntity) params.set('entidad', filterEntity);
      if (filterAction) params.set('accion', filterAction);
      params.set('limit', '100');
      
      const [logsRes, statsRes] = await Promise.all([
        api.get(`/audit?${params.toString()}`),
        api.get('/audit/stats'),
      ]);
      setLogs(logsRes.data || []);
      setStats(statsRes.data || null);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [filterEntity, filterAction]);

  const filtered = logs.filter(l => JSON.stringify(l).toLowerCase().includes(search.toLowerCase()));

  // Obtener valores únicos para los filtros
  const uniqueEntities = [...new Set(logs.map(l => l.entidad).filter(Boolean))];
  const uniqueActions = [...new Set(logs.map(l => l.accion).filter(Boolean))];

  return (
    <DashboardLayout title="Auditoría" subtitle="Registro inmutable de acciones del sistema (Gran Ojo)">
      {/* Stats Summary */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="card" style={{ padding: '1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ width:40, height:40, borderRadius:'10px', backgroundColor:'rgba(37,99,235,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ShieldAlert size={20} color="#2563eb"/>
            </div>
            <div>
              <p style={{ fontSize:'0.72rem', color:'var(--text-secondary)', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.05em' }}>Total Registros</p>
              <h4 style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--text-primary)' }}>{stats.total.toLocaleString()}</h4>
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ width:40, height:40, borderRadius:'10px', backgroundColor:'rgba(16,185,129,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ShieldAlert size={20} color="#10b981"/>
            </div>
            <div>
              <p style={{ fontSize:'0.72rem', color:'var(--text-secondary)', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.05em' }}>Últimas 24h</p>
              <h4 style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--text-primary)' }}>{stats.last24h}</h4>
            </div>
          </div>
          {stats.byAction?.slice(0, 2).map((a, i) => {
            const badge = badgeMap[a.accion] || { bg:'rgba(100,100,100,0.08)', color:'#666' };
            return (
              <div key={i} className="card" style={{ padding: '1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:40, height:40, borderRadius:'10px', backgroundColor:badge.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ShieldAlert size={20} color={badge.color}/>
                </div>
                <div>
                  <p style={{ fontSize:'0.72rem', color:'var(--text-secondary)', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.05em' }}>{a.accion}</p>
                  <h4 style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--text-primary)' }}>{a.count}</h4>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, maxWidth:360 }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }}/>
          <input className="input-control" placeholder="Filtrar logs..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'2.2rem' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Filter size={15} color="var(--text-secondary)"/>
          <select className="input-control" value={filterEntity} onChange={e => { setFilterEntity(e.target.value); setLoading(true); }} style={{ padding:'0.5rem', fontSize:'0.82rem', maxWidth:160 }}>
            <option value="">Todas las entidades</option>
            {uniqueEntities.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select className="input-control" value={filterAction} onChange={e => { setFilterAction(e.target.value); setLoading(true); }} style={{ padding:'0.5rem', fontSize:'0.82rem', maxWidth:160 }}>
            <option value="">Todas las acciones</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card"><div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ borderBottom:'1px solid var(--border-color)' }}>
            {['Acción','Entidad','ID','Usuario','IP','Datos Anteriores','Datos Nuevos','Fecha'].map(h=><th key={h} style={{ textAlign:'left',padding:'0.75rem 1.25rem',fontSize:'0.72rem',fontWeight:600,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding:'3rem',textAlign:'center',color:'var(--text-secondary)' }}>Cargando logs...</td></tr>
            : filtered.length===0 ? <tr><td colSpan={8} style={{ padding:'3rem',textAlign:'center',color:'var(--text-secondary)' }}>Sin registros de auditoría.</td></tr>
            : filtered.map((l,i)=>{
              const b = badgeMap[l.accion] || { bg:'rgba(100,100,100,0.1)',color:'#666',label:l.accion };
              return (
                <tr key={i} style={{ borderBottom:'1px solid var(--border-color)',transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor='var(--accent-light)'}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
                  <td style={{ padding:'0.85rem 1.25rem' }}><span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'0.2rem 0.55rem',borderRadius:100,fontSize:'0.72rem',fontWeight:600,backgroundColor:b.bg,color:b.color }}><span style={{ width:5,height:5,borderRadius:'50%',backgroundColor:b.color }}></span>{b.label}</span></td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.85rem',fontWeight:500,color:'var(--text-primary)' }}>{l.entidad}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.82rem',color:'var(--text-secondary)',fontFamily:'monospace' }}>#{l.entidad_id || '—'}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.85rem',color:'var(--text-secondary)',fontFamily:'monospace' }}>{l.usuario_email||l.usuario_id||'—'}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.8rem',color:'var(--text-secondary)',fontFamily:'monospace' }}>{l.ip_address||'—'}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.75rem',color:'var(--text-secondary)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }} title={l.datos_anteriores ? JSON.stringify(l.datos_anteriores) : ''}>{l.datos_anteriores ? JSON.stringify(l.datos_anteriores).slice(0,50)+'...' : '—'}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.75rem',color:'var(--text-secondary)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }} title={l.datos_nuevos ? JSON.stringify(l.datos_nuevos) : ''}>{l.datos_nuevos ? JSON.stringify(l.datos_nuevos).slice(0,50)+'...' : '—'}</td>
                  <td style={{ padding:'0.85rem 1.25rem',fontSize:'0.8rem',color:'var(--text-secondary)' }}>{l.fecha ? new Date(l.fecha).toLocaleString('es-PE') : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div></div>

      {/* Footer */}
      <div style={{ marginTop:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.78rem', color:'var(--text-secondary)' }}>
        <span>Mostrando {filtered.length} de {logs.length} registros</span>
        <span style={{ opacity:0.6 }}>Datos inmutables — Audit Trail Enterprise</span>
      </div>
    </DashboardLayout>
  );
};
export default AuditPage;
