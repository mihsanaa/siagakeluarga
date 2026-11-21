import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { fmtTanggal, jenisLabel, tingkatLabel, tingkatTone, umurLabel, formatJarak, mapsUrl } from '../lib/format.js';
import { Alert, Badge, Spinner } from '../components/ui.jsx';

// Halaman publik /r/:token — dibuka anggota keluarga tanpa login (mode baca saja)
export default function PublicCard() {
  const { token } = useParams();
  const [card, setCard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setCard(null);
    setError('');
    api(`/share/${encodeURIComponent(token)}`, { auth: false })
      .then((d) => alive && setCard(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [token]);

  const plan = card?.rencana_evakuasi?.konten;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <header style={{ background: 'var(--navy)', color: '#fff' }}>
        <div className="container row between" style={{ height: 64 }}>
          <Link to="/" className="logo" style={{ color: '#fff' }}>
            <span className="logo-mark" aria-hidden="true" />
            SiagaKeluarga
          </Link>
          <span className="xs" style={{ opacity: 0.75 }}>Rencana darurat (hanya baca)</span>
        </div>
      </header>

      <main className="container" style={{ padding: '32px 24px 120px', maxWidth: 760 }}>
        {!card && !error && <div className="center-screen"><Spinner label="Memuat rencana…" /></div>}

        {error && (
          <div className="card center" style={{ padding: 40 }}>
            <h3>Tautan tidak ditemukan</h3>
            <p className="muted mt-sm">{error}. Minta anggota keluarga mengirim ulang tautan terbaru.</p>
          </div>
        )}

        {card && (
          <div className="stack" style={{ gap: 20 }}>
            <div className="card" style={{ background: 'var(--putih)' }}>
              <span className="eyebrow">Keluarga</span>
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', marginTop: 6 }}>{card.keluarga}</h1>
              {card.lokasi && <p className="muted mt-sm">Kec. {card.lokasi.kecamatan}, {card.lokasi.kab_kota}</p>}
              <div className="row gap-sm wrap mt">
                {card.zona_risiko.map((z) => (
                  <Badge key={`${z.jenis_bencana}-${z.tingkat}`} tone={tingkatTone[z.tingkat]}>
                    {jenisLabel[z.jenis_bencana]} · {tingkatLabel[z.tingkat]}
                  </Badge>
                ))}
              </div>
            </div>

            <a href="tel:112" className="btn btn-primary btn-lg btn-block">☎ Telepon 112</a>

            {card.titik_kumpul[0] && (
              <div className="card">
                <div className="xs muted-2">Titik kumpul</div>
                <h3 className="mt-sm">{card.titik_kumpul[0].nama}</h3>
                {card.titik_kumpul[0].jarak_km != null && (
                  <p className="muted mt-sm">{formatJarak(card.titik_kumpul[0].jarak_km)} dari rumah</p>
                )}
                <a className="btn btn-outline btn-sm mt" href={mapsUrl(card.titik_kumpul[0].lat, card.titik_kumpul[0].lng)} target="_blank" rel="noreferrer">
                  Buka di Google Maps →
                </a>
              </div>
            )}

            {plan ? (
              <>
                <div className="card">
                  <h4>Ringkasan risiko</h4>
                  <p className="muted mt-sm">{plan.ringkasan_risiko}</p>
                </div>
                <div className="card">
                  <h4>Tugas tiap anggota</h4>
                  <div className="mt">
                    {plan.pembagian_tugas_keluarga.map((t) => (
                      <div className="role-row" key={t.anggota + t.peran}>
                        <span className="avatar">{t.anggota.slice(0, 2).toUpperCase()}</span>
                        <div>
                          <strong>{t.anggota}</strong> <span className="muted small">· {t.peran}</span>
                          <p className="small muted mt-sm">{t.fokus_pendampingan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <h4>Langkah saat bencana</h4>
                  <ol className="small mt-sm" style={{ paddingLeft: 20, lineHeight: 1.7 }}>
                    {plan.langkah_saat_bencana.map((l, i) => <li key={i}>{l}</li>)}
                  </ol>
                </div>
              </>
            ) : (
              <Alert tone="info">Rencana darurat belum dibuat oleh keluarga ini.</Alert>
            )}

            <div className="card">
              <h4>Anggota keluarga</h4>
              <div className="list mt">
                {card.anggota.map((m, i) => (
                  <div className="list-item" key={i}>
                    <span className="avatar">{m.panggilan.slice(0, 2).toUpperCase()}</span>
                    <div className="grow">
                      <div style={{ fontWeight: 600 }}>{m.panggilan}</div>
                      <div className="xs muted">
                        {umurLabel[m.kelompok_umur]}
                        {m.kebutuhan_khusus ? ` · ${m.kebutuhan_khusus}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {card.rencana_evakuasi && (
              <p className="xs muted-2 center">
                Dibuat {fmtTanggal(card.rencana_evakuasi.dibuat_pada)} · Data cuaca BMKG & data bencana BNPB · Dibuat dengan SiagaKeluarga
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
