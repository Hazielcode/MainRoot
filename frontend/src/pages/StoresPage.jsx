import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Plus, Pencil, Trash2, MapPin, X, Store } from 'lucide-react';
import api from '../services/api.js';

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [form, setForm] = useState({ nombre: '', ubicacion: '' });
  const [error, setError] = useState('');

  const fetchStores = async () => {
    try { const res = await api.get('/stores'); setStores(res.data || []); }
    catch { setStores([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStores(); }, []);

  // FIX: Usar 'ubicacion' en vez de 'direccion' para coincidir con el backend/schema
  const openCreate = () => { setEditingStore(null); setForm({ nombre: '', ubicacion: '' }); setError(''); setShowModal(true); };
  const openEdit = (s) => { setEditingStore(s); setForm({ nombre: s.nombre, ubicacion: s.ubicacion || '' }); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editingStore) { await api.put(`/stores/${editingStore.id}`, form); }
      else { await api.post('/stores', form); }
      setShowModal(false); fetchStores();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta sucursal? Solo es posible si no tiene productos ni personal asignado.')) return;
    try { await api.delete(`/stores/${id}`); fetchStores(); }
    catch (err) { alert(err.response?.data?.error || 'Error al eliminar'); }
  };

  return (
    <DashboardLayout title="Sucursales" subtitle="Gestión de tiendas y puntos de venta (ABAC Geográfico)">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)' }}>
          <Store size={16} color="var(--accent-primary)" />
          <span>{stores.length} sucursal{stores.length !== 1 ? 'es' : ''} registrada{stores.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18}/> Nueva Sucursal</button>
      </div>

      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {loading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1/-1' }}><p className="text-secondary">Cargando sucursales...</p></div>
        ) : stores.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1/-1' }}><p className="text-secondary">No hay sucursales registradas.</p></div>
        ) : stores.map(s => (
          <div key={s.id} className="card" style={{ padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color="#8b5cf6"/>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>{s.nombre}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.ubicacion || 'Sin ubicación registrada'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button className="btn-ghost" onClick={() => openEdit(s)} style={{ width: 30, height: 30 }}><Pencil size={14}/></button>
                <button className="btn-ghost" onClick={() => handleDelete(s.id)} style={{ width: 30, height: 30, color: 'var(--danger)' }}><Trash2 size={14}/></button>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '100px', backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--accent-primary)' }}>ID: {s.id}</span>
              {s.fecha_creacion && (
                <span style={{ fontSize: '0.72rem', fontWeight: 500, padding: '0.15rem 0.5rem', borderRadius: '100px', backgroundColor: 'rgba(100,100,100,0.06)', color: 'var(--text-secondary)' }}>
                  Creada: {new Date(s.fecha_creacion).toLocaleDateString('es-PE')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={() => setShowModal(false)}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>{editingStore ? 'Editar Sucursal' : 'Nueva Sucursal'}</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ width: 32, height: 32 }}><X size={18}/></button>
            </div>
            {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-group"><label className="input-label">Nombre</label><input className="input-control" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}/></div>
              <div className="input-group"><label className="input-label">Ubicación</label><input className="input-control" placeholder="Ej: Av. Javier Prado 1520, Lima" value={form.ubicacion} onChange={e => setForm({...form, ubicacion: e.target.value})}/></div>
              <button type="submit" className="btn btn-primary w-full">{editingStore ? 'Guardar' : 'Crear Sucursal'}</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StoresPage;
