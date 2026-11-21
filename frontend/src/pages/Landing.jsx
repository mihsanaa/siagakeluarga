import { useState } from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero-k1.jpg';
import { useCountUp } from '../lib/useCountUp.js';
import { FAQ, KONTAK_DARURAT } from '../lib/content.js';
import { useAuth } from '../lib/auth.jsx';
import { Button } from '../components/ui.jsx';

const LANGKAH = [
  { n: '01', judul: 'Isi profil keluarga', teks: 'Masukkan anggota keluarga, lokasi rumah, dan kebutuhan khusus seperti lansia atau balita.' },
  { n: '02', judul: 'AI menyusun rencana', teks: 'Rencana darurat berpedoman pada panduan BNPB, lengkap dengan titik kumpul dan tugas tiap anggota.' },
  { n: '03', judul: 'Bagikan ke keluarga', teks: 'Kirim tautan rencana ke grup keluarga. Mereka bisa membukanya tanpa login.' },
];

const FITUR = [
  { judul: 'Rencana darurat AI', teks: 'Tugas jelas untuk tiap anggota keluarga, sesuai usia dan kebutuhan khusus.' },
  { judul: 'Cuaca BMKG', teks: 'Prakiraan diperbarui otomatis tiap 3 jam untuk wilayahmu.' },
  { judul: 'Tas siaga', teks: 'Checklist per anggota dengan pengingat tanggal kedaluwarsa.' },
  { judul: 'Tanya AI', teks: 'Jawaban praktis berbasis panduan resmi BNPB, disertai sumber.' },
  { judul: 'Latihan skenario', teks: 'Kuis singkat per jenis bencana untuk melatih keputusan cepat.' },
  { judul: 'Titik kumpul', teks: 'Titik kumpul terdekat dan jaraknya dari rumahmu.' },
];

export default function Landing() {
  const { user } = useAuth();
  const [statRef, statValue] = useCountUp(5402);
  const [openFaq, setOpenFaq] = useState(0);
  const ctaHref = user ? '/app' : '/daftar';

  return (
    <>
      <header className="topnav">
        <div className="container topnav-inner">
          <Link to="/" className="logo">
            <span className="logo-mark" aria-hidden="true" />
            SiagaKeluarga
          </Link>
          <nav className="nav-links" aria-label="Utama">
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#fitur">Fitur</a>
            <Link to="/panduan">Panduan</Link>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="row gap-sm">
            {user ? (
              <Link to="/app" className="btn btn-navy btn-sm">Buka aplikasi</Link>
            ) : (
              <>
                <Link to="/masuk" className="btn btn-ghost btn-sm">Masuk</Link>
                <Link to="/daftar" className="btn btn-navy btn-sm">Daftar gratis</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <img className="hero-bg" src={heroImg} alt="Persawahan berteras di pedesaan Jawa Barat" />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="container">
          <div className="hero-content reveal">
            <div className="live-label" style={{ marginBottom: 28 }}>
              <span className="live-dot" aria-hidden="true" />
              Data cuaca BMKG & data bencana BNPB
            </div>
            <h1>
              Siap bersama,
              <br />
              <span className="accent">sebelum bencana datang.</span>
            </h1>
            <p className="lede">Isi profil keluarga sekali, dan AI menyusun rencana darurat yang jelas untuk tiap anggota.</p>
            <div className="row gap-sm wrap mt-lg">
              <Link to={ctaHref} className="btn btn-primary btn-lg">
                Buat rencana gratis <span className="btn-arrow">→</span>
              </Link>
              <a href="#cara-kerja" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                Lihat cara kerja
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="cara-kerja">
        <div className="container">
          <span className="eyebrow">Cara kerja</span>
          <h2 className="mt-sm">Tiga langkah menuju keluarga yang siap</h2>
          <div className="grid-3 mt-lg">
            {LANGKAH.map((l) => (
              <div className="card" key={l.n}>
                <div className="step-num">{l.n}</div>
                <h3 className="mt-sm">{l.judul}</h3>
                <p className="muted mt-sm">{l.teks}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-navy" ref={statRef}>
        <div className="container grid-2" style={{ alignItems: 'center', gap: 56 }}>
          <div>
            <div className="stat-number" aria-live="polite">{statValue.toLocaleString('id-ID')}</div>
            <p className="lede mt">Kejadian bencana hidrometeorologi tercatat sepanjang 2025 di Indonesia.</p>
            <p className="xs mt" style={{ color: 'rgba(255,255,255,0.6)' }}>Sumber: BNPB</p>
          </div>
          <div>
            <h2>Banyak keluarga belum punya rencana tertulis.</h2>
            <p className="lede mt">Tanpa titik kumpul dan tugas yang jelas, keluarga mudah panik saat bencana datang.</p>
            <div className="mt-lg">
              <Link to={ctaHref} className="btn btn-primary btn-lg">Buat rencana sekarang</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="fitur">
        <div className="container">
          <span className="eyebrow">Fitur utama</span>
          <h2 className="mt-sm">Semua yang keluarga butuhkan, dalam satu tempat</h2>
          <div className="grid-3 mt-lg">
            {FITUR.map((f) => (
              <div className="card" key={f.judul}>
                <h4>{f.judul}</h4>
                <p className="muted mt-sm small">{f.teks}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream" id="faq">
        <div className="container grid-2" style={{ alignItems: 'start', gap: 56 }}>
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-sm">Pertanyaan yang sering ditanyakan</h2>
            <p className="muted mt">Masih bingung? Tanya Siaga bisa menjelaskan panduan dengan bahasa yang lebih sederhana setelah kamu masuk.</p>
          </div>
          <div>
            {FAQ.map((item, i) => (
              <div className="faq-item" key={item.q}>
                <button
                  className="faq-q"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  {item.q}
                  <span aria-hidden="true" style={{ color: 'var(--oranye)', fontSize: 22 }}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="faq-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container grid-2" style={{ alignItems: 'end' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>SiagaKeluarga</div>
            <p>Data cuaca BMKG dan data bencana BNPB. Aplikasi ini tidak menggantikan instruksi petugas.</p>
            <p className="mt-sm">
              <Link to="/panduan">Panduan bencana</Link>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {KONTAK_DARURAT.slice(0, 2).map((k) => (
              <div key={k.nomor}>
                {k.nama}: <a href={`tel:${k.nomor.split(' ')[0]}`}>{k.nomor}</a>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
