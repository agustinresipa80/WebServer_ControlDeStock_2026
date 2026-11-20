import { Activity, AlertTriangle, Boxes, Check, ShoppingCart, X } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'

function AppLayout({ notice, dismissNotice }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/productos" aria-label="Stockroom, productos">
          <span className="brand-mark"><Boxes size={21} strokeWidth={2.2} /></span>
          <span>stockroom</span >
        </Link>
        <div className="sidebar-label">ESPACIO DE TRABAJO</div>
        <nav className="nav-list" aria-label="Navegación principal">
          <NavLink to="/productos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Boxes size={18} /><span>Productos</span><span className="nav-key">01</span>
          </NavLink>
          <NavLink to="/ventas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={18} /><span>Ventas</span><span className="nav-key">02</span>
          </NavLink>
          <NavLink to="/reportes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Activity size={18} /><span>Reportes</span><span className="nav-key">03</span>
          </NavLink>
        </nav>
      </aside>

      <main className="main-area">
        {notice && <div className={`toast ${notice.type}`} role="status">{notice.type === 'success' ? <Check size={17} /> : <AlertTriangle size={17} />}{notice.message}<button onClick={dismissNotice} aria-label="Cerrar aviso"><X size={15} /></button></div>}
        <div className="page-content"><Outlet /></div>
        <footer className="page-footer"><span>Stockroom API </span></footer>
      </main>
    </div>
  )
}

export default AppLayout