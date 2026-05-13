import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Plus, Pencil, Trash2, Search, X, Star, Package } from 'lucide-react';
import api from '../services/api.js';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', tienda_id: '', es_premium: false });
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { 
    setEditingProduct(null); 
    setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', tienda_id: '', es_premium: false }); 
    setError(''); setShowModal(true); 
  };
  const openEdit = (p) => { 
    setEditingProduct(p); 
    setForm({ 
      nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, 
      categoria: p.categoria || '', tienda_id: p.tienda_id || '', es_premium: p.es_premium || false 
    }); 
    setError(''); setShowModal(true); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, precio: Number(form.precio), stock: Number(form.stock) };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
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

  const filtered = products.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tienda_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStock = products.filter(p => p.stock <= 10).length;

  return (
    <DashboardLayout title="Inventario" subtitle="Gestión de productos del sistema (ABAC)">
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', flex:1 }}>
          <div style={{ position: 'relative', flex: '1', maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}/>
            <input className="input-control" placeholder="Buscar por nombre, categoría o tienda..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}/>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', fontSize:'0.78rem' }}>
            <span style={{ display:'flex', alignItems:'center', gap:4, padding:'0.2rem 0.6rem', borderRadius:100, backgroundColor:'rgba(37,99,235,0.08)', color:'var(--accent-primary)', fontWeight:600 }}>
              <Package size={13}/> {products.length} productos
            </span>
            {lowStock > 0 && (
              <span style={{ display:'flex', alignItems:'center', gap:4, padding:'0.2rem 0.6rem', borderRadius:100, backgroundColor:'rgba(239,68,68,0.08)', color:'var(--danger)', fontWeight:600 }}>
                ⚠️ {lowStock} bajo stock
              </span>
            )}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18}/> Nuevo Producto</button>
      </div>

      {/* Tabla */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Nombre', 'Categoría', 'Sucursal', 'Precio', 'Stock', 'Tipo', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1.25rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando productos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron productos. {!products.length && '(El backend puede estar apagado)'}</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-light)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      {p.es_premium && <Star size={14} color="#f59e0b" fill="#f59e0b"/>}
                      {p.nombre}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{p.categoria || '—'}</td>
                  <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.tienda_nombre || `T-${p.tienda_id}`}</td>
                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>S/ {Number(p.precio).toFixed(2)}</td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: p.stock > 10 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: p.stock > 10 ? 'var(--success)' : 'var(--danger)' }}>
                      {p.stock} uds
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <span style={{ 
                      padding: '0.15rem 0.5rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600,
                      backgroundColor: p.es_premium ? 'rgba(245,158,11,0.1)' : 'rgba(100,100,100,0.06)',
                      color: p.es_premium ? '#f59e0b' : 'var(--text-secondary)'
                    }}>
                      {p.es_premium ? '★ Premium' : 'Estándar'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
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
              
              {/* Toggle Premium */}
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.85rem 1rem', borderRadius: '14px', marginBottom: '1.25rem',
                backgroundColor: form.es_premium ? 'rgba(245,158,11,0.08)' : 'var(--bg-primary)',
                border: `1.5px solid ${form.es_premium ? 'rgba(245,158,11,0.3)' : 'var(--border-color)'}`,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }} onClick={() => setForm({...form, es_premium: !form.es_premium})}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                  <Star size={18} color={form.es_premium ? '#f59e0b' : 'var(--text-secondary)'} fill={form.es_premium ? '#f59e0b' : 'none'}/>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Producto Premium</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Los productos premium tienen restricciones ABAC especiales</p>
                  </div>
                </div>
                <div style={{
                  width: 44, height: 24, borderRadius: 12, position: 'relative',
                  backgroundColor: form.es_premium ? '#f59e0b' : 'var(--border-color)',
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white',
                    position: 'absolute', top: 3,
                    left: form.es_premium ? 23 : 3,
                    transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}></div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem' }}>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InventoryPage;
