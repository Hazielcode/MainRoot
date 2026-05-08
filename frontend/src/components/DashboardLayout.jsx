import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../App.jsx';
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
    { label: 'Personal', icon: Users, path: '/staff' },
  ]},
  { section: 'Seguridad', items: [
    { label: 'Auditoría', icon: ShieldAlert, path: '/audit' },
    { label: 'Roles y Permisos', icon: FileText, path: '/roles' },
  ]},
];

const DashboardLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.removeItem('mainroot_token');
    navigate('/');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">M</div>
          <span className="sidebar-brand-text">Mainroot</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(group => (
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
              color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(54,124,252,0.25)'
            }}>A</div>
          </div>
        </div>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
