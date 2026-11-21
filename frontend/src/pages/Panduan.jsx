import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GUIDES, KONTAK_DARURAT } from '../lib/content.js';
import { useAuth } from '../lib/auth.jsx';

const FASE = [
  { id: 'sebelum', label: 'Sebelum' },
  { id: 'saat', label: 'Saat' },
  { id: 'sesudah', label: 'Sesudah' },
];

export default function Panduan() {
  const { user } = useAuth();
  const [kategori, setKategori] = useState('semua');
  const [fase, setFase] = useState('sebelum');

  const daftar = useMemo(
    () => (kategori === 'semua' ? GUIDES : GUIDES.filter((g) => g.id === kategori)),
    [kategori],
  );

  return (
    <>
      <header className="topnav">
        <div className="container topnav-inner">
          <Link to="/" className="logo">
            <span className="logo-mark" aria-hidden="true" />
            SiagaKeluarga
          </Link>
          <div className="row gap-sm">
            {user ? (
              <Link to="/app" className="btn btn-navy btn-sm">Beranda saya</Link>
            ) : (
              <>
                <Link to="/masuk" className="btn btn-ghost btn-sm">Masuk</Link>
                <Link to="/daftar" className="btn btn-navy btn-sm">Daftar gratis</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: '56px 24px 96px' }}>
        <span className="eyebrow">Panduan bencana</span>
        <h1 className="mt-sm" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Langkah resmi untuk sebelum, saat, dan sesudah bencana.</h1>
        <p className="lede mt">Ringkasan dari panduan BNPB. Ikuti arahan petugas BPBD setempat bila berbeda.</p>

        <div className="tabs mt-lg" role="tablist" aria-label="Kategori bencana">
          <button className={`chip ${kategori === 'semua' ? 'chip-active' : ''}`} onClick={() => setKategori('semua')} role="tab" aria-selected={kategori === 'semua'}>
            Semua
          </button>
          {GUIDES.map((g) => (
            <button key={g.id} className={`chip ${kategori === g.id ? 'chip-active' : ''}`} onClick={() => setKategori(g.id)} role="tab" aria-selected={kategori === g.id}>
              {g.nama}
            </button>
          ))}
        </div>

        <div className="tabs mt" role="tablist" aria-label="Fase bencana">
          {FASE.map((f) => (
            <button key={f.id} className={`chip ${fase === f.id ? 'chip-active' : ''}`} onClick={() => setFase(f.id)} role="tab" aria-selected={fase === f.id}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid-2 mt-lg">
          {daftar.map((g) => {
            const langkah = g.fase[fase];
            return (
              <article className="card" key={g.id}>
                <div className="row between wrap gap-sm">
                  <h3>{g.nama} — {FASE.find((f) => f.id === fase).label}</h3>
                  <span className="badge badge-orange">{langkah.length} langkah</span>
                </div>

                {langkah.length === 0 ? (
                  <p className="muted mt">Belum ada panduan untuk fase ini.</p>
                ) : (
                  <ol className="list mt" style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}>
                    {langkah.map((l, i) => (
                      <li className="list-item" key={l.judul} style={{ alignItems: 'flex-start' }}>
                        <span className="step-num" style={{ minWidth: 28 }}>{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          <h4>{l.judul}</h4>
                          <p className="muted small mt-sm">{l.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                {fase === 'sebelum' && (
                  <div className="card card-cream card-sm mt">
                    <div className="xs muted-2" style={{ fontWeight: 600, marginBottom: 6 }}>Yang perlu disiapkan</div>
                    <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
                      {g.siapkan.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                )}

                <p className="small mt" style={{ color: 'var(--gempa)' }}>
                  <strong>Yang harus dihindari:</strong> {g.hindari}
                </p>
              </article>
            );
          })}
        </div>

        <div className="card mt-lg">
          <h3>Kontak cepat</h3>
          <div className="grid-4 mt">
            {KONTAK_DARURAT.map((k) => (
              <a key={k.nama} href={`tel:${k.nomor.split(' ')[0]}`} className="card card-sm card-link">
                <div className="xs muted-2">{k.nama}</div>
                <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0' }}>{k.nomor}</div>
                <div className="xs muted">{k.catatan}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
