import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { Alert, Button, Field } from '../components/ui.jsx';
import fotoImg from '../assets/foto-k2.jpg';

export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ nama: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        navigate(location.state?.from || '/app', { replace: true });
      } else {
        await register(form.nama, form.email, form.password);
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-visual">
        <img src={fotoImg} alt="" aria-hidden="true" />
        <Link to="/" className="logo" style={{ color: '#fff' }}>
          <span className="logo-mark" aria-hidden="true" />
          SiagaKeluarga
        </Link>
        <div>
          <h2 style={{ color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>
            Siap bersama,
            <br />
            <span style={{ color: '#fb923c' }}>lebih kuat daripada menghadapi sendirian.</span>
          </h2>
          <p className="mt" style={{ color: 'rgba(255,255,255,0.75)' }}>Data keluargamu disimpan dengan aman dan hanya bisa diakses olehmu.</p>
        </div>
      </aside>

      <section className="auth-form">
        <div className="auth-card">
          <Link to="/" className="logo" style={{ marginBottom: 32 }}>
            <span className="logo-mark" aria-hidden="true" />
            SiagaKeluarga
          </Link>

          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>{isLogin ? 'Masuk ke akunmu' : 'Buat akun baru'}</h1>
          <p className="muted mt-sm">{isLogin ? 'Lanjutkan menyiapkan keluargamu.' : 'Gratis. Kamu bisa menambah anggota keluarga setelah ini.'}</p>

          <form className="form-grid mt-lg" onSubmit={onSubmit} noValidate>
            {!isLogin && (
              <Field label="Nama panggilan" htmlFor="nama">
                <input id="nama" className="input" placeholder="Budi" value={form.nama} onChange={set('nama')} required autoComplete="given-name" />
              </Field>
            )}
            <Field label="Email" htmlFor="email">
              <input id="email" type="email" className="input" placeholder="nama@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
            </Field>
            <Field label="Kata sandi" htmlFor="password" hint={isLogin ? undefined : 'Minimal 6 karakter.'}>
              <input
                id="password"
                type="password"
                className="input"
                value={form.password}
                onChange={set('password')}
                required
                minLength={isLogin ? 1 : 6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </Field>

            {error && <Alert tone="danger">{error}</Alert>}

            <Button type="submit" size="lg" block disabled={loading} variant="primary" style={{ marginTop: 4 }}>
              {loading ? 'Memproses…' : isLogin ? 'Masuk' : 'Daftar gratis'}
            </Button>
          </form>

          <p className="small muted mt-lg" style={{ textAlign: 'center' }}>
            {isLogin ? (
              <>Belum punya akun? <Link to="/daftar" style={{ color: 'var(--oranye)', fontWeight: 600 }}>Daftar</Link></>
            ) : (
              <>Sudah punya akun? <Link to="/masuk" style={{ color: 'var(--oranye)', fontWeight: 600 }}>Masuk</Link></>
            )}
          </p>
          <p className="xs muted-2 mt-lg" style={{ textAlign: 'center' }}>
            Darurat? Hubungi <a href="tel:112">112</a> sekarang. Jangan menunggu aplikasi.
          </p>
        </div>
      </section>
    </div>
  );
}
