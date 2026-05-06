import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { ShieldAlert, Users, Package, TrendingUp, LogOut, Sun, Moon } from 'lucide-react';

// === Datos Simulados (Placeholder para el Backend Real) ===
const auditData = [
  { time: '08:00', accesses: 12, blocks: 0 },
  { time: '10:00', accesses: 45, blocks: 2 },
  { time: '12:00', accesses: 78, blocks: 5 },
  { time: '14:00', accesses: 62, blocks: 1 },
  { time: '16:00', accesses: 89, blocks: 8 },
  { time: '18:00', accesses: 34, blocks: 0 },
];

const inventoryData = [
  { name: 'Electrónica', value: 400 },
  { name: 'Mobiliario', value: 300 },
  { name: 'Insumos', value: 300 },
  { name: 'Software', value: 200 },
];

const mfaData = [
  { name: 'Sin MFA', count: 20, fill: 'var(--danger)' },
  { name: 'MFA Activo', count: 80, fill: 'var(--success)' },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

// Custom Tooltip estilizado para hacer match con el modo Oscuro/Claro
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        padding: '1rem', 
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color, fontSize: '0.9rem', fontWeight: 500 }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);

  // Simulación de carga inicial para disparar animaciones de entrada
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mainroot_token');
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Corporativo */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <ShieldAlert size={32} color="var(--accent-primary)" />
            Mainroot Command Center
          </h2>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Monitorización Zero Trust y Telemetría en Tiempo Real</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={toggleTheme} className="btn-icon" title="Alternar Tema">
            {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </header>
      
      {/* Tarjetas KPI (Key Performance Indicators) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <div className={`card ${!loading ? 'animate-fade-in' : ''}`} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px' }}>
            <Users size={28} color="var(--accent-primary)" />
          </div>
          <div>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Usuarios Activos</p>
            <h3 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>1,248</h3>
          </div>
        </div>

        <div className={`card ${!loading ? 'animate-fade-in' : ''}`} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', animationDelay: '0.1s' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
            <Package size={28} color="var(--success)" />
          </div>
          <div>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Ítems en Inventario</p>
            <h3 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>8,593</h3>
          </div>
        </div>

        <div className={`card ${!loading ? 'animate-fade-in' : ''}`} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', animationDelay: '0.2s' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
            <ShieldAlert size={28} color="var(--danger)" />
          </div>
          <div>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Bloqueos de Seguridad</p>
            <h3 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>16</h3>
          </div>
        </div>

      </div>

      {/* Rejilla de Gráficos Recharts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Gráfico 1: Auditoría (LineChart) */}
        <div className={`card ${!loading ? 'animate-fade-in' : ''}`} style={{ padding: '2rem', minHeight: '400px', gridColumn: '1 / -1', animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
                <TrendingUp size={22} color="var(--accent-primary)" /> 
                Telemetría de Accesos (Últimas 24h)
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Accesos legítimos vs Intentos bloqueados por el Shield JWT</p>
            </div>
          </div>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={auditData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 2, fill: 'transparent' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" name="Accesos Autorizados" dataKey="accesses" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} animationDuration={1500} />
                <Line type="monotone" name="Bloqueos de Seguridad" dataKey="blocks" stroke="var(--danger)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico 2: Inventario (PieChart) */}
        <div className={`card ${!loading ? 'animate-fade-in' : ''}`} style={{ padding: '2rem', height: '420px', animationDelay: '0.4s' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Distribución de Inventario</h3>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Stock categorizado por tipo de producto (ABAC)</p>
          
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={inventoryData} 
                  cx="50%" cy="50%" 
                  innerRadius={70} 
                  outerRadius={110} 
                  paddingAngle={5} 
                  dataKey="value"
                  animationDuration={1500}
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: MFA Compliance (RadialBarChart) */}
        <div className={`card ${!loading ? 'animate-fade-in' : ''}`} style={{ padding: '2rem', height: '420px', animationDelay: '0.5s' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>MFA Compliance</h3>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Estado de autenticación de doble factor en la plantilla</p>
          
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="60%" outerRadius="100%" 
                barSize={20} 
                data={mfaData}
                startAngle={180} endAngle={0}
              >
                <RadialBar 
                  minAngle={15} 
                  background={{ fill: 'var(--border-color)' }} 
                  clockWise 
                  dataKey="count" 
                  cornerRadius={10} 
                  animationDuration={1500}
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, color: 'var(--text-primary)' }} />
                <RechartsTooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
