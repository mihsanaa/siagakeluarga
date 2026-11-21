import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { inisial } from '../lib/format.js';

const NAV = [
  { to: '/app', label: 'Beranda saya', ikon: 'B', end: true },
  { to: '/app/rencana', label: 'Rencana darurat', ikon: 'R' },
  { to: '/app/profil', label: 'Profil keluarga', ikon: 'P' },
  { to: '/app/tas-siaga', label: 'Tas siaga', ikon: 'T' },
  { to: '/app/risiko', label: 'Risiko dan cuaca', ikon: 'C' },
  { to: '/app/tanya', label: 'Tanya AI', ikon: 'A' },
  { to: '/app/latihan', label: 'Latihan', ikon: 'L' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = user?.role === 'ADMIN' ? [...NAV, { to: '/app/admin', label: 'Admin BPBD', ikon: 'D' }] : NAV;

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/app" className="logo">
          <span className="logo-mark" aria-hidden="true" />
          SiagaKeluarga
        </NavLink>

        <nav className="side-nav" aria-label="Navigasi utama">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="side-link">
              <span className="side-dot" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="side-foot">
          <div className="card card-cream card-sm row">
            <span className="avatar">{inisial(user?.nama)}</span>
            <div className="grow">
              <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.nama}</div>
              <button className="btn btn-ghost btn-sm" style={{ padding: 0, height: 'auto', color: 'var(--oranye)' }} onClick={onLogout}>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Navigasi cepat">
        {NAV.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            <span className="ico">{item.ikon}</span>
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
