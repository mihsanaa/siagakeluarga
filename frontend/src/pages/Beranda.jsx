import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { skorKesiapan, langkahBerikutnya } from '../lib/readiness.js';
import { fmtHariIni, inisial, umurLabel, formatJarak, mapsUrl } from '../lib/format.js';
import { Alert, Badge, Card, Progress, Spinner } from '../components/ui.jsx';
import { ForecastStrip, alertCuaca, ikonCuaca } from '../components/Weather.jsx';
import PageHead from '../components/PageHead.jsx';

export default function Beranda() {
  const { user } = useAuth();
  const [household, setHousehold] = useState(null);
  const [risk, setRisk] = useState(null);
  const [riskError, setRiskError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.allSettled([api('/household'), api('/risk')]).then(([h, r]) => {
      if (!alive) return;
      if (h.status === 'fulfilled') setHousehold(h.value);
      else setError(h.reason.message);
      if (r.status === 'fulfilled') setRisk(r.value);
      else setRiskError(r.reason.message);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!household) return <Spinner label="Memuat beranda…" />;

  const skor = skorKesiapan(household);
  const next = langkahBerikutnya(household);
  const kit = household.kesiapan_tas ?? { total: 0, siap: 0, persentase: 0 };
  const cuaca = risk?.cuaca;
  const cuacaAlert = cuaca ? alertCuaca(cuaca) : null;
  const titikKumpul = risk?.titik_kumpul?.[0];
  const namaDepan = (user?.nama || '').split(' ')[0];

  return (
    <>
      <PageHead
        title={`Halo, ${namaDepan}`}
        sub={`${fmtHariIni()}${household.region ? ` · Kec. ${household.region.kecamatan}` : ''}`}
        actions={<Link to="/app/rencana" className="btn btn-navy btn-sm">Perbarui rencana</Link>}
      />

      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}>
        <div className="hero-card reveal">
          <div className="xs" style={{ opacity: 0.75 }}>Skor kesiapan</div>
          <div className="row between wrap" style={{ alignItems: 'flex-end', marginTop: 6 }}>
            <div style={{ fontSize: 'clamp(3.5rem, 8vw, 5rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em' }}>
              {skor}
              <span style={{ fontSize: 28, opacity: 0.7 }}>%</span>
            </div>
            <div className="small" style={{ opacity: 0.85, textAlign: 'right' }}>
              {kit.siap}/{kit.total} barang tas siaga siap
              <br />
              {household.members?.length ?? 0} anggota terdaftar
            </div>
          </div>
          <div className="mt" style={{ position: 'relative', zIndex: 1 }}>
            <Progress value={skor} tone="navy" />
          </div>

          <div className="card card-sm mt-lg" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.14)', color: '#fff', position: 'relative', zIndex: 1 }}>
            <div className="xs" style={{ opacity: 0.7 }}>Langkah berikutnya</div>
            <div className="row between wrap gap-sm" style={{ marginTop: 4 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{next.teks}</div>
                <div className="xs" style={{ opacity: 0.7 }}>{next.dampak}</div>
              </div>
              <Link to={next.to} className="btn btn-primary btn-sm">Lanjutkan →</Link>
            </div>
          </div>
        </div>

        <Card className="reveal">
          <div className="row between">
            <span className="xs muted-2">Cuaca BMKG{risk?.wilayah ? ` · ${risk.wilayah.kecamatan}` : ''}</span>
            {cuacaAlert && <Badge tone={cuacaAlert.tone}>{cuacaAlert.label}</Badge>}
          </div>
          {riskError && !cuaca ? (
            <p className="small muted mt">{riskError}. Atur wilayah di Profil keluarga.</p>
          ) : cuaca?.tersedia ? (
            <>
              <div className="row mt-sm" style={{ alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 44 }} aria-hidden="true">{ikonCuaca(cuaca.saat_ini?.cuaca)}</span>
                <div>
                  <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{cuaca.saat_ini?.suhu_c ?? '-'}°</div>
                  <div className="small muted">{cuaca.saat_ini?.cuaca}</div>
                </div>
              </div>
              <p className="small muted mt">
                Curah hujan {cuaca.saat_ini?.curah_hujan_mm ?? 0} mm · kelembapan {cuaca.saat_ini?.kelembapan ?? '-'}%
              </p>
              <Link to="/app/risiko" className="small mt-sm" style={{ color: 'var(--oranye)', fontWeight: 600, display: 'inline-block' }}>
                Lihat prakiraan lengkap →
              </Link>
            </>
          ) : (
            <p className="small muted mt">Prakiraan belum tersedia{cuaca?.alasan ? `: ${cuaca.alasan}` : ''}.</p>
          )}
        </Card>
      </div>

      {cuaca?.tersedia && cuaca.prakiraan?.length > 0 && (
        <Card className="mt-lg reveal">
          <div className="row between mb">
            <h4>Prakiraan hari ini</h4>
            <span className="xs muted-2">Diperbarui tiap 3 jam</span>
          </div>
          <ForecastStrip items={cuaca.prakiraan.slice(0, 6)} />
        </Card>
      )}

      <div className="grid-2 mt-lg">
        <Card className="reveal">
          <h4>Titik kumpul terdekat</h4>
          {titikKumpul ? (
            <>
              <h3 className="mt-sm">{titikKumpul.nama}</h3>
              <p className="small muted mt-sm">
                {formatJarak(titikKumpul.jarak_km) || 'Jarak belum dihitung'}
                {titikKumpul.kapasitas ? ` · kapasitas ${titikKumpul.kapasitas} orang` : ''}
              </p>
              <a className="btn btn-outline btn-sm mt" href={mapsUrl(titikKumpul.lat, titikKumpul.lng)} target="_blank" rel="noreferrer">
                Lihat peta
              </a>
            </>
          ) : (
            <p className="small muted mt">Belum ada titik kumpul untuk wilayahmu.</p>
          )}
        </Card>

        <Card className="reveal">
          <div className="row between">
            <h4>Keluarga</h4>
            <Link to="/app/profil" className="small" style={{ color: 'var(--oranye)', fontWeight: 600 }}>Kelola</Link>
          </div>
          {household.members?.length ? (
            <div className="list mt-sm">
              {household.members.map((m) => (
                <div className="list-item" key={m.id} style={{ padding: '10px 0' }}>
                  <span className="avatar">{inisial(m.panggilan)}</span>
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
          ) : (
            <p className="small muted mt">Belum ada anggota keluarga. <Link to="/app/profil" style={{ color: 'var(--oranye)' }}>Tambahkan sekarang</Link>.</p>
          )}
        </Card>
      </div>

      <div className="grid-3 mt-lg">
        <Link to="/app/tas-siaga" className="card card-link reveal"><h4>Tas siaga</h4><p className="small muted mt-sm">{kit.siap} dari {kit.total} barang siap</p></Link>
        <Link to="/app/latihan" className="card card-link reveal"><h4>Latihan</h4><p className="small muted mt-sm">{household.drills?.length ? `${household.drills.length} simulasi tercatat` : 'Belum ada simulasi'}</p></Link>
        <Link to="/app/tanya" className="card card-link reveal"><h4>Tanya AI</h4><p className="small muted mt-sm">Jawaban berbasis panduan BNPB</p></Link>
      </div>

      {household.emergency_plans?.[0] && (
        <p className="xs muted-2 mt-lg">
          Rencana terakhir dibuat {new Date(household.emergency_plans[0].created_at).toLocaleDateString('id-ID')}.
        </p>
      )}
    </>
  );
}
