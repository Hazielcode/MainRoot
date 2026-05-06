import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { 
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Sector
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Package, Store, ShieldAlert, Activity, FileText, ChevronRight } from 'lucide-react';

// === Datos Simulados ===
const accessTrendData = [
  { hour: '06:00', accesos: 8, bloqueos: 0 }, { hour: '08:00', accesos: 32, bloqueos: 1 },
  { hour: '09:00', accesos: 65, bloqueos: 2 }, { hour: '10:00', accesos: 78, bloqueos: 3 },
  { hour: '11:00', accesos: 52, bloqueos: 1 }, { hour: '12:00', accesos: 45, bloqueos: 5 },
  { hour: '13:00', accesos: 30, bloqueos: 0 }, { hour: '14:00', accesos: 68, bloqueos: 2 },
  { hour: '15:00', accesos: 82, bloqueos: 8 }, { hour: '16:00', accesos: 91, bloqueos: 4 },
  { hour: '17:00', accesos: 55, bloqueos: 1 }, { hour: '18:00', accesos: 24, bloqueos: 0 },
];
const inventoryByCategoryData = [
  { name: 'Electrónica', value: 420 }, { name: 'Mobiliario', value: 310 },
  { name: 'Insumos', value: 280 }, { name: 'Software', value: 190 },
];
const stockByStoreData = [
  { sucursal: 'Central', stock: 3200 }, { sucursal: 'Norte', stock: 2100 },
  { sucursal: 'Sur', stock: 1800 }, { sucursal: 'Este', stock: 1493 },
];
const recentAuditLogs = [
  { id: 1, action: 'CREATE', entity: 'Producto', user: 'admin@mainroot.com', time: 'Hace 5 min', detail: 'Laptop HP ProBook 450' },
  { id: 2, action: 'UPDATE', entity: 'Usuario', user: 'rrhh@mainroot.com', time: 'Hace 12 min', detail: 'Cambio de rol: Empleado → Gerente' },
  { id: 3, action: 'DELETE', entity: 'Producto', user: 'gerente@mainroot.com', time: 'Hace 28 min', detail: 'Monitor LG 24" (stock agotado)' },
  { id: 4, action: 'BLOCK', entity: 'Sesión', user: 'Shield JWT', time: 'Hace 45 min', detail: 'Token expirado desde 192.168.1.55' },
];
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

const renderActiveShape = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle); const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos; const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 25) * cos; const my = cy + (outerRadius + 25) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 18; const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text-primary)" fontSize={18} fontWeight={700}>{value}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-secondary)" fontSize={11}>{payload.name}</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }}/>
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} fill={fill} opacity={0.4}/>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5}/>
      <circle cx={sx} cy={sy} r={3} fill={fill}/>
      <text x={ex + (cos >= 0 ? 6 : -6)} y={ey} textAnchor={textAnchor} fill="var(--text-secondary)" fontSize={11} fontWeight={500}>{`${(percent * 100).toFixed(0)}%`}</text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}>
        <p style={{ margin: '0 0 0.4rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        {payload.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{entry.value}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{entry.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ActionBadge = ({ action }) => {
  const map = { CREATE: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Creación' }, UPDATE: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb', label: 'Edición' }, DELETE: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Eliminación' }, BLOCK: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Bloqueo' } };
  const s = map[action] || map.CREATE;
  return (<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.55rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600, backgroundColor: s.bg, color: s.color }}><span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: s.color }}></span>{s.label}</span>);
};

const DashboardPage = () => {
  const [loaded, setLoaded] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [hoveredKpi, setHoveredKpi] = useState(null);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);
  const onPieEnter = useCallback((_, index) => setActivePieIndex(index), []);

  const kpis = [
    { label: 'Usuarios Activos', value: '1,248', change: '+12%', up: true, icon: Users, color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
    { label: 'Ítems Inventario', value: '8,593', change: '+3.2%', up: true, icon: Package, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Sucursales', value: '4', change: 'Estable', up: true, icon: Store, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
    { label: 'Alertas Seguridad', value: '16', change: '+5 hoy', up: false, icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle="Resumen general del sistema">
      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className={`card stat-card ${loaded ? 'animate-fade-in' : ''}`}
            style={{ animationDelay: `${i * 0.06}s`, cursor: 'default', transform: hoveredKpi === i ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hoveredKpi === i ? `0 8px 25px ${kpi.bg}` : 'var(--shadow-sm)', borderColor: hoveredKpi === i ? kpi.color : 'var(--border-color)', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}
            onMouseEnter={() => setHoveredKpi(i)} onMouseLeave={() => setHoveredKpi(null)}>
            <div className="stat-icon" style={{ backgroundColor: kpi.bg, transition: 'transform 0.3s ease', transform: hoveredKpi === i ? 'scale(1.1)' : 'scale(1)' }}>
              <kpi.icon size={22} color={kpi.color}/>
            </div>
            <div className="stat-info"><p>{kpi.label}</p><h3>{kpi.value}</h3></div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', fontWeight: 600, color: kpi.up ? 'var(--success)' : 'var(--danger)' }}>
              {kpi.up ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}{kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className={`card ${loaded ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.25s' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Activity size={18} color="var(--accent-primary)"/> Telemetría de Accesos — Últimas 24h</h3>
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
                  <linearGradient id="gradAccesos" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.3}/><stop offset="100%" stopColor="#2563eb" stopOpacity={0.02}/></linearGradient>
                  <linearGradient id="gradBloqueos" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="100%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false}/>
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <RechartsTooltip content={<CustomTooltip/>} cursor={{ stroke: 'var(--accent-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}/>
                <Area type="monotone" name="Accesos" dataKey="accesos" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradAccesos)" animationDuration={1500} dot={false} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#2563eb' }}/>
                <Area type="monotone" name="Bloqueos" dataKey="bloqueos" stroke="#ef4444" strokeWidth={2} fill="url(#gradBloqueos)" animationDuration={1500} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#ef4444' }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie + Bar */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className={`card ${loaded ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.35s' }}>
          <div className="card-header"><h3 style={{ fontSize: '1rem' }}>Distribución de Inventario</h3><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Pasa el cursor sobre cada categoría</p></div>
          <div className="card-body" style={{ height: 310 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie activeIndex={activePieIndex} activeShape={renderActiveShape} data={inventoryByCategoryData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" onMouseEnter={onPieEnter} animationDuration={1200}>
                {inventoryByCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i]} stroke="none"/>)}
              </Pie></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`card ${loaded ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.4s' }}>
          <div className="card-header"><h3 style={{ fontSize: '1rem' }}>Stock por Sucursal</h3><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Distribución geográfica ABAC</p></div>
          <div className="card-body" style={{ height: 310 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByStoreData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false}/><XAxis dataKey="sucursal" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <RechartsTooltip content={<CustomTooltip/>}/><Bar name="Unidades" dataKey="stock" fill="var(--accent-primary)" radius={[8, 8, 0, 0]} animationDuration={1200}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className={`card ${loaded ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.5s' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={18} color="var(--accent-primary)"/> Actividad Reciente</h3><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Últimas acciones del Gran Ojo</p></div>
          <button className="btn" style={{ background: 'transparent', color: 'var(--accent-primary)', fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>Ver todo <ChevronRight size={16}/></button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>{['Acción','Entidad','Detalle','Usuario','Tiempo'].map(h=><th key={h} style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}</tr></thead>
            <tbody>{recentAuditLogs.map(log=>(
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='var(--accent-light)'} onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
                <td style={{ padding: '0.85rem 1.5rem' }}><ActionBadge action={log.action}/></td>
                <td style={{ padding: '0.85rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{log.entity}</td>
                <td style={{ padding: '0.85rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.detail}</td>
                <td style={{ padding: '0.85rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{log.user}</td>
                <td style={{ padding: '0.85rem 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.time}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
