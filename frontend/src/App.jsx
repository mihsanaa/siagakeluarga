import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import { Spinner } from './components/ui.jsx';
import AppShell from './components/AppShell.jsx';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Panduan from './pages/Panduan.jsx';
import PublicCard from './pages/PublicCard.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Beranda from './pages/Beranda.jsx';
import Rencana from './pages/Rencana.jsx';
import Profil from './pages/Profil.jsx';
import TasSiaga from './pages/TasSiaga.jsx';
import Risiko from './pages/Risiko.jsx';
import TanyaAI from './pages/TanyaAI.jsx';
import Latihan from './pages/Latihan.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

function RequireAuth({ children }) {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === 'loading') {
    return (
      <div className="center-screen">
        <Spinner label="Memuat data keluarga…" />
      </div>
    );
  }
  if (!user) return <Navigate to="/masuk" replace state={{ from: location.pathname }} />;
  return children;
}

function GuestOnly({ children }) {
  const { user, status, household } = useAuth();
  if (status === 'loading') return null;
  if (user) return <Navigate to={household?.jumlah_anggota === 0 ? '/onboarding' : '/app'} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/masuk" element={<GuestOnly><Auth mode="login" /></GuestOnly>} />
      <Route path="/daftar" element={<GuestOnly><Auth mode="register" /></GuestOnly>} />
      <Route path="/panduan" element={<Panduan />} />
      <Route path="/r/:token" element={<PublicCard />} />

      <Route element={<RequireAuth><Outlet /></RequireAuth>}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<AppShell />}>
          <Route path="/app" element={<Beranda />} />
          <Route path="/app/rencana" element={<Rencana />} />
          <Route path="/app/profil" element={<Profil />} />
          <Route path="/app/tas-siaga" element={<TasSiaga />} />
          <Route path="/app/risiko" element={<Risiko />} />
          <Route path="/app/tanya" element={<TanyaAI />} />
          <Route path="/app/latihan" element={<Latihan />} />
          <Route path="/app/admin" element={<Admin />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

