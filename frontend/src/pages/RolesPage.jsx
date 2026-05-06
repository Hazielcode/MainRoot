import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Plus, Pencil, Trash2, X, Shield } from 'lucide-react';
import api from '../services/api.js';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre:'', descripcion:'' });
  const [error, setError] = useState('');

  const fetch = async () => {
    try { const r = await api.get('/roles'); setRoles(r.data||[]); }
    catch { setRoles([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ nombre:'',descripcion:'' }); setError(''); setShowModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ nombre:r.nombre, descripcion:r.descripcion||'' }); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) { await api.put(`/roles/${editing.id}`, form); }
      else { await api.post('/roles', form); }
      setShowModal(false); fetch();
    } catch (err) { setError(err.response?.data?.error||'Error'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar rol? Solo posible si no tiene usuarios asignados.')) return;
    try { await api.delete(`/roles/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.error||'Error'); }
  };

  const colors = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

  return (
    <DashboardLayout title="Roles y Permisos" subtitle="Gestión del sistema RBAC">
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1.5rem' }}>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18}/> Nuevo Rol</button>
      </div>
      <div className="grid-4" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {loading ? <div className="card" style={{ padding:'3rem',textAlign:'center',gridColumn:'1/-1' }}><p className="text-secondary">Cargando...</p></div>
        : roles.length===0 ? <div className="card" style={{ padding:'3rem',textAlign:'center',gridColumn:'1/-1' }}><p className="text-secondary">No hay roles.</p></div>
        : roles.map((r,i)=>(
          <div key={r.id} className="card" style={{ padding:'1.5rem',transition:'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'0.75rem' }}>
                <div style={{ width:42,height:42,borderRadius:'10px',backgroundColor:`${colors[i%colors.length]}15`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Shield size={20} color={colors[i%colors.length]}/>
                </div>
                <div>
                  <h4 style={{ fontSize:'1rem',color:'var(--text-primary)',margin:0 }}>{r.nombre}</h4>
                  <p style={{ fontSize:'0.8rem',color:'var(--text-secondary)',marginTop:2 }}>{r.descripcion||'Sin descripción'}</p>
                </div>
              </div>
              <div style={{ display:'flex',gap:'0.25rem' }}>
                <button className="btn-ghost" onClick={()=>openEdit(r)} style={{ width:30,height:30 }}><Pencil size={14}/></button>
                <button className="btn-ghost" onClick={()=>handleDelete(r.id)} style={{ width:30,height:30,color:'var(--danger)' }}><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div style={{ position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'1rem' }} onClick={()=>setShowModal(false)}>
          <div className="card animate-fade-in" style={{ width:'100%',maxWidth:440,padding:'2rem' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem' }}>
              <h3 style={{ color:'var(--text-primary)' }}>{editing?'Editar Rol':'Nuevo Rol'}</h3>
              <button className="btn-ghost" onClick={()=>setShowModal(false)} style={{ width:32,height:32 }}><X size={18}/></button>
            </div>
            {error && <div style={{ backgroundColor:'rgba(239,68,68,0.1)',color:'var(--danger)',padding:'0.6rem',borderRadius:6,marginBottom:'1rem',fontSize:'0.85rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-group"><label className="input-label">Nombre</label><input className="input-control" required value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
              <div className="input-group"><label className="input-label">Descripción</label><input className="input-control" value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})}/></div>
              <button type="submit" className="btn btn-primary w-full">{editing?'Guardar':'Crear Rol'}</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
export default RolesPage;
