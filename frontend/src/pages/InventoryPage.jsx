import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import api from '../services/api.js';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', tienda_id: '' });
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { setEditingProduct(null); setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', tienda_id: '' }); setError(''); setShowModal(true); };
  const openEdit = (p) => { setEditingProduct(p); setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, categoria: p.categoria || '', tienda_id: p.tienda_id || '' }); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, form);
      } else {
        await api.post('/products', form);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) return;
    try { await api.delete(`/products/${id}`); fetchProducts(); }
    catch (err) { alert(err.response?.data?.error || 'Error al eliminar'); }
  };

  const filtered = products.filter(p => p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || p.categoria?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <DashboardLayout title="Inventario" subtitle="Gestión de productos del sistema">
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}/>
          <input className="input-control" placeholder="Buscar por nombre o categoría..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}/>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18}/> Nuevo Producto</button>
      </div>

      {/* Tabla */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Nombre', 'Categoría', 'Precio', 'Stock', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando productos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron productos. {!products.length && '(El backend puede estar apagado)'}</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-light)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '0.85rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>{p.nombre}</td>
                  <td style={{ padding: '0.85rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{p.categoria || '—'}</td>
                  <td style={{ padding: '0.85rem 1.5rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>S/ {Number(p.precio).toFixed(2)}</td>
                  <td style={{ padding: '0.85rem 1.5rem' }}>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: p.stock > 10 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: p.stock > 10 ? 'var(--success)' : 'var(--danger)' }}>
                      {p.stock} uds
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-ghost" onClick={() => openEdit(p)} style={{ width: 32, height: 32 }}><Pencil size={15}/></button>
                      <button className="btn-ghost" onClick={() => handleDelete(p.id)} style={{ width: 32, height: 32, color: 'var(--danger)' }}><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={() => setShowModal(false)}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ width: 32, height: 32 }}><X size={18}/></button>
            </div>
            {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-group"><label className="input-label">Nombre</label><input className="input-control" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}/></div>
              <div className="input-group"><label className="input-label">Categoría</label><input className="input-control" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}/></div>
              <div className="grid-2">
                <div className="input-group"><label className="input-label">Precio (S/)</label><input className="input-control" type="number" step="0.01" required value={form.precio} onChange={e => setForm({...form, precio: e.target.value})}/></div>
                <div className="input-group"><label className="input-label">Stock</label><input className="input-control" type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}/></div>
              </div>
              <div className="input-group"><label className="input-label">Descripción</label><input className="input-control" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}/></div>
              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem' }}>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InventoryPage;
