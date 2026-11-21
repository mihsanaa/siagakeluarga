import { Link } from 'react-router-dom';
import { Button } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="center-card center">
      <div className="accent" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>404</div>
      <h1 className="mt-sm" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Halaman tidak ditemukan</h1>
      <p className="muted mt">Halaman yang kamu cari mungkin sudah dipindahkan atau tidak tersedia.</p>
      <div className="row gap-sm mt-lg" style={{ justifyContent: 'center' }}>
        <Link to="/" className="btn btn-navy">Kembali ke beranda</Link>
        <Link to="/panduan" className="btn btn-outline">Buka panduan</Link>
      </div>
      <p className="xs muted-2 mt-lg">Darurat Nasional: <a href="tel:112">112</a></p>
    </div>
  );
}
