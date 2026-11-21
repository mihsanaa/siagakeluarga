import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { Alert, Button, Card } from '../components/ui.jsx';
import PageHead from '../components/PageHead.jsx';

export default function Admin() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState('');

  if (user?.role !== 'ADMIN') {
    return (
      <>
        <PageHead title="Admin" />
        <Alert tone="warn">Halaman ini hanya untuk akun admin. <Link to="/app" style={{ color: '#78350f', fontWeight: 700 }}>Kembali ke beranda</Link></Alert>
      </>
    );
  }

  const reindex = async () => {
    setBusy(true);
    setError('');
    setHasil(null);
    try {
      const data = await api('/admin/reindex-guides', { method: 'POST' });
      setHasil(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead title="Admin" sub="Kelola basis pengetahuan Tanya Siaga." />
      <Card style={{ maxWidth: 680 }}>
        <h3>Indeks ulang panduan</h3>
        <p className="muted mt-sm">
          Membuat ulang embedding vektor untuk seluruh panduan agar Tanya Siaga memakai teks terbaru. Gunakan setelah panduan diubah.
        </p>
        <div className="mt">
          <Button variant="navy" onClick={reindex} disabled={busy}>{busy ? 'Mengindeks…' : 'Jalankan reindex'}</Button>
        </div>
        {hasil && <Alert tone={hasil.failed?.length ? 'warn' : 'ok'}>
          {hasil.indexed}/{hasil.total} panduan berhasil diindeks.
          {hasil.failed?.length > 0 && ` ${hasil.failed.length} gagal, coba jalankan lagi nanti.`}
        </Alert>}
        {error && <Alert tone="danger">{error}</Alert>}
      </Card>
    </>
  );
}
