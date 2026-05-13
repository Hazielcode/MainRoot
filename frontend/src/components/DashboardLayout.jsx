import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShieldAlert, Users, Package, Store, FileText,
  LogOut, Sun, Moon, Bell, Search
} from 'lucide-react';

const navItems = [
  { section: 'Principal', items: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  ]},
  { section: 'Gestión', items: [
    { label: 'Inventario', icon: Package, path: '/inventory' },
    { label: 'Sucursales', icon: Store, path: '/stores' },
    { label: 'Personal', icon: Users, path: '/staff', roles: ['Admin'] },
  ]},
  { section: 'Seguridad', items: [
    { label: 'Auditoría', icon: ShieldAlert, path: '/audit', roles: ['Admin', 'Auditor'] },
    { label: 'Roles y Permisos', icon: FileText, path: '/roles', roles: ['Admin'] },
  ]},
];

const DashboardLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user, logout, hasRole, primaryRole } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Obtener iniciales del usuario para el avatar
  const initials = user?.nombre_completo 
    ? user.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  // Filtrar items de nav según los roles del usuario
  const filteredNavItems = navItems.map(group => ({
    ...group,
    items: group.items.filter(item => !item.roles || hasRole(item.roles))
  })).filter(group => group.items.length > 0);

  // Color del badge de rol
  const roleColors = {
    Admin: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    Gerente: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
    Empleado: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb' },
    Auditor: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  };
  const roleBadge = roleColors[primaryRole] || { bg: 'rgba(100,100,100,0.08)', color: 'var(--text-secondary)' };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">M</div>
          <span className="sidebar-brand-text">Mainroot</span>
        </div>
        <nav className="sidebar-nav">
          {filteredNavItems.map(group => (
            <React.Fragment key={group.section}>
              <span className="sidebar-section-label">{group.section}</span>
              {group.items.map(item => (
                <button key={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}>
                  <item.icon size={18}/> {item.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>
        <div className="sidebar-footer">
          {/* Perfil resumido del usuario */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', 
            padding: '0.75rem 0.85rem', marginBottom: '0.5rem',
            borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-light)'
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(54,124,252,0.25)'
            }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ 
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0
              }}>{user?.nombre_completo || user?.email || 'Usuario'}</p>
              <span style={{ 
                display: 'inline-flex', padding: '0.1rem 0.4rem', borderRadius: '100px',
                fontSize: '0.65rem', fontWeight: 600,
                backgroundColor: roleBadge.bg, color: roleBadge.color
              }}>{primaryRole || 'Sin rol'}</span>
            </div>
          </div>
          <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={18}/> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>{title || 'Dashboard'}</h1>
            <p>{subtitle || new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="topbar-right">
            <button className="btn-ghost" title="Buscar" style={{ width: 38, height: 38 }}><Search size={18}/></button>
            <button className="btn-ghost" title="Notificaciones" style={{ width: 38, height: 38, position: 'relative' }}>
              <Bell size={18}/>
              <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-gradient)' }}></span>
            </button>
            <button onClick={toggleTheme} className="btn-ghost" title="Tema" style={{ width: 38, height: 38 }}>
              {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <div style={{
              width: 38, height: 38, borderRadius: '12px',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(54,124,252,0.25)'
            }}>{initials}</div>
          </div>
        </div>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
