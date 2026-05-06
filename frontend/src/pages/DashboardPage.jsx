import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  LayoutDashboard, ShieldAlert, Users, Package, Store, FileText,
  TrendingUp, TrendingDown, LogOut, Sun, Moon, Bell, Search, ChevronRight
} from 'lucide-react';

// === Datos Simulados (se reemplazarán con datos reales del backend) ===
const accessTrendData = [
  { hour: '06:00', accesos: 8, bloqueos: 0 },
  { hour: '08:00', accesos: 32, bloqueos: 1 },
  { hour: '09:00', accesos: 65, bloqueos: 2 },
  { hour: '10:00', accesos: 78, bloqueos: 3 },
  { hour: '11:00', accesos: 52, bloqueos: 1 },
  { hour: '12:00', accesos: 45, bloqueos: 5 },
  { hour: '13:00', accesos: 30, bloqueos: 0 },
  { hour: '14:00', accesos: 68, bloqueos: 2 },
  { hour: '15:00', accesos: 82, bloqueos: 8 },
  { hour: '16:00', accesos: 91, bloqueos: 4 },
  { hour: '17:00', accesos: 55, bloqueos: 1 },
  { hour: '18:00', accesos: 24, bloqueos: 0 },
];

const inventoryByCategoryData = [
  { name: 'Electrónica', value: 420, fill: '#2563eb' },
  { name: 'Mobiliario', value: 310, fill: '#10b981' },
  { name: 'Insumos', value: 280, fill: '#f59e0b' },
  { name: 'Software', value: 190, fill: '#8b5cf6' },
];

const stockByStoreData = [
  { sucursal: 'Central', stock: 3200 },
  { sucursal: 'Norte', stock: 2100 },
  { sucursal: 'Sur', stock: 1800 },
  { sucursal: 'Este', stock: 1493 },
];

const recentAuditLogs = [
  { id: 1, action: 'CREATE', entity: 'Producto', user: 'admin@mainroot.com', time: 'Hace 5 min', detail: 'Laptop HP ProBook 450' },
  { id: 2, action: 'UPDATE', entity: 'Usuario', user: 'rrhh@mainroot.com', time: 'Hace 12 min', detail: 'Cambio de rol: Empleado → Gerente' },
  { id: 3, action: 'DELETE', entity: 'Producto', user: 'gerente@mainroot.com', time: 'Hace 28 min', detail: 'Monitor LG 24" (stock agotado)' },
  { id: 4, action: 'BLOCK', entity: 'Sesión', user: 'Shield JWT', time: 'Hace 45 min', detail: 'Token expirado desde 192.168.1.55' },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

// Tooltip limpio y elegante
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        padding: '0.75rem 1rem', 
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: '0 0 0.35rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color, fontWeight: 500 }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Badge para los logs de auditoría
const ActionBadge = ({ action }) => {
  const map = {
    CREATE: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Creación' },
    UPDATE: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb', label: 'Edición' },
    DELETE: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Eliminación' },
    BLOCK:  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Bloqueo' },
  };
  const style = map[action] || map.CREATE;
  return (
    <span style={{ 
      display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '100px',
      fontSize: '0.7rem', fontWeight: 600, backgroundColor: style.bg, color: style.color 
    }}>
      {style.label}
    </span>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mainroot_token');
    navigate('/');
  };

  // Datos para las tarjetas KPI
  const kpis = [
    { label: 'Usuarios Activos', value: '1,248', change: '+12%', up: true, icon: Users, color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
    { label: 'Ítems Inventario', value: '8,593', change: '+3.2%', up: true, icon: Package, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Sucursales', value: '4', change: '0%', up: true, icon: Store, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
    { label: 'Alertas Seguridad', value: '16', change: '+5', up: false, icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  ];

  return (
    <div className="layout">

      {/* ======== SIDEBAR ======== */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">M</div>
          <span className="sidebar-brand-text">Mainroot</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Principal</span>
          <button className="sidebar-link active">
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <span className="sidebar-section-label">Gestión</span>
          <button className="sidebar-link">
            <Package size={18} /> Inventario
          </button>
          <button className="sidebar-link">
            <Store size={18} /> Sucursales
          </button>
          <button className="sidebar-link">
            <Users size={18} /> Personal
          </button>

          <span className="sidebar-section-label">Seguridad</span>
          <button className="sidebar-link">
            <ShieldAlert size={18} /> Auditoría
          </button>
          <button className="sidebar-link">
            <FileText size={18} /> Roles y Permisos
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ======== MAIN ======== */}
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Dashboard</h1>
            <p>Resumen general del sistema — {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="topbar-right">
            <button className="btn-ghost" title="Buscar" style={{ width: 36, height: 36 }}>
              <Search size={18} />
            </button>
            <button className="btn-ghost" title="Notificaciones" style={{ width: 36, height: 36, position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--danger)' }}></span>
            </button>
            <button onClick={toggleTheme} className="btn-ghost" title="Tema" style={{ width: 36, height: 36 }}>
              {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <div style={{ 
              width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
            }}>
              A
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">

          {/* KPI Cards */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            {kpis.map((kpi, i) => (
              <div key={i} className={`card stat-card ${loaded ? 'animate-fade-in' : ''}`} style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="stat-icon" style={{ backgroundColor: kpi.bg }}>
                  <kpi.icon size={22} color={kpi.color} />
                </div>
                <div className="stat-info">
                  <p>{kpi.label}</p>
                  <h3>{kpi.value}</h3>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', fontWeight: 600, color: kpi.up ? 'var(--success)' : 'var(--danger)' }}>
                  {kpi.up ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                  {kpi.change}
                </div>
              </div>
            ))}
          </div>

          {/* Fila 1: Area Chart grande */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className={`card ${loaded ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.25s' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <TrendingUp size={18} color="var(--accent-primary)" />
                    Telemetría de Accesos — Últimas 24h
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Accesos autorizados vs bloqueos del Shield JWT</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'inline-block' }}></span> Accesos</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--danger)', display: 'inline-block' }}></span> Bloqueos</span>
                </div>
              </div>
              <div className="card-body" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accessTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradAccesos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.25}/>
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false}/>
                    <XAxis dataKey="hour" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                    <RechartsTooltip content={<CustomTooltip />}/>
                    <Area type="monotone" name="Accesos" dataKey="accesos" stroke="var(--accent-primary)" strokeWidth={2.5} fill="url(#gradAccesos)" animationDuration={1200}/>
                    <Line type="monotone" name="Bloqueos" dataKey="bloqueos" stroke="var(--danger)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} animationDuration={1200}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Fila 2: Pie + Barras lado a lado */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>

            {/* Pie Chart - Inventario por Categoría */}
            <div className={`card ${loaded ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.35s' }}>
              <div className="card-header">
                <h3 style={{ fontSize: '1rem' }}>Distribución de Inventario</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Stock por categoría de producto</p>
              </div>
              <div className="card-body" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={inventoryByCategoryData} 
                      cx="50%" cy="50%" 
                      innerRadius={65} outerRadius={100} 
                      paddingAngle={4} dataKey="value"
                      animationDuration={1200}
                    >
                      {inventoryByCategoryData.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />}/>
                    <Legend iconType="circle" iconSize={8} 
                      formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart - Stock por Sucursal */}
            <div className={`card ${loaded ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.4s' }}>
              <div className="card-header">
                <h3 style={{ fontSize: '1rem' }}>Stock por Sucursal</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Distribución geográfica ABAC</p>
              </div>
              <div className="card-body" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockByStoreData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false}/>
                    <XAxis dataKey="sucursal" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                    <RechartsTooltip content={<CustomTooltip />}/>
                    <Bar name="Unidades" dataKey="stock" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} animationDuration={1200}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Fila 3: Tabla de Actividad Reciente */}
          <div className={`card ${loaded ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.5s' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={18} color="var(--accent-primary)"/>
                  Actividad Reciente (Audit Trail)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Últimas acciones registradas por el Gran Ojo</p>
              </div>
              <button className="btn" style={{ background: 'transparent', color: 'var(--accent-primary)', fontSize: '0.85rem', border: 'none', padding: '0.4rem 0' }}>
                Ver todo <ChevronRight size={16}/>
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Acción', 'Entidad', 'Detalle', 'Usuario', 'Tiempo'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentAuditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-light)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '0.85rem 1.5rem' }}><ActionBadge action={log.action}/></td>
                      <td style={{ padding: '0.85rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{log.entity}</td>
                      <td style={{ padding: '0.85rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.detail}</td>
                      <td style={{ padding: '0.85rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.user}</td>
                      <td style={{ padding: '0.85rem 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
