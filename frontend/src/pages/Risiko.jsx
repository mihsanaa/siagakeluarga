import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { jenisLabel, tingkatLabel, tingkatTone, formatJarak, mapsUrl } from '../lib/format.js';
import { Alert, Badge, Card, Spinner } from '../components/ui.jsx';
import { ForecastStrip, alertCuaca, ikonCuaca } from '../components/Weather.jsx';
import PageHead from '../components/PageHead.jsx';

export default function Risiko() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/risk')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <>
        <PageHead title="Risiko dan cuaca" />
        <Alert tone="warn">{error}. Pilih wilayah rumahmu di <Link to="/app/profil" style={{ color: '#78350f', fontWeight: 700 }}>Profil keluarga</Link> agar risiko bisa dihitung.</Alert>
      </>
    );
  }
  if (!data) return <Spinner label="Memuat data risiko…" />;

  const { wilayah, zona_risiko, titik_kumpul, cuaca } = data;
  const status = alertCuaca(cuaca);
  const saatIni = cuaca?.saat_ini;

  return (
    <>
      <PageHead
        title="Risiko dan cuaca"
        sub={wilayah ? `Kec. ${wilayah.kecamatan}, ${wilayah.kab_kota} · Sumber: BMKG & BNPB` : 'Sumber: BMKG & BNPB'}
      />

      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', alignItems: 'start' }}>
        <Card tone="navy">
          <div className="row between">
            <span className="xs muted">Cuaca saat ini</span>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          {cuaca?.tersedia && saatIni ? (
            <>
              <div className="row mt" style={{ gap: 18, alignItems: 'center' }}>
                <span style={{ fontSize: 56 }} aria-hidden="true">{ikonCuaca(saatIni.cuaca)}</span>
                <div>
                  <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em' }}>{saatIni.suhu_c ?? '-'}°C</div>
                  <div className="muted mt-sm">{saatIni.cuaca}</div>
                </div>
              </div>
              <div className="row gap-lg wrap mt small muted">
                <span>Curah hujan {saatIni.curah_hujan_mm ?? 0} mm</span>
                <span>Kelembapan {saatIni.kelembapan ?? '-'}%</span>
                <span>Angin {saatIni.kecepatan_angin_kmj ?? '-'} km/j {saatIni.arah_angin ? `dari ${saatIni.arah_angin}` : ''}</span>
              </div>
            </>
          ) : (
            <p className="muted mt">Prakiraan belum tersedia{cuaca?.alasan ? `: ${cuaca.alasan}` : ''}.</p>
          )}
        </Card>

        <Card>
          <h4>Zona risiko wilayah</h4>
          {zona_risiko?.length ? (
            <div className="list mt-sm">
              {zona_risiko.map((z) => (
                <div className="list-item" key={`${z.jenis_bencana}-${z.tingkat}`} style={{ padding: '12px 0' }}>
                  <span className="grow" style={{ fontWeight: 600 }}>{jenisLabel[z.jenis_bencana]}</span>
                  <Badge tone={tingkatTone[z.tingkat]}>{tingkatLabel[z.tingkat]}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="small muted mt-sm">Belum ada data zona risiko untuk wilayah ini.</p>
          )}
        </Card>
      </div>

      {cuaca?.prakiraan?.length > 0 && (
        <div className="mt-lg">
          <h3 className="mb">Prakiraan per jam</h3>
          <Card>
            <ForecastStrip items={cuaca.prakiraan} />
          </Card>
        </div>
      )}

      {cuaca?.tersedia && (
        <Card className="mt-lg" style={{ background: 'var(--oranye-soft)', borderColor: '#fed7aa' }}>
          <h4>Saran tindakan</h4>
          <p className="small mt-sm" style={{ color: '#7c2d12' }}>
            {status.tone === 'danger'
              ? 'Hujan lebat terdeteksi. Pastikan tas siaga siap dekat pintu dan pantau ketinggian air di sekitar rumah.'
              : status.tone === 'warn'
                ? 'Siapkan tas siaga dan pastikan senter, obat rutin, dan dokumen penting sudah terbawa.'
                : 'Kondisi relatif aman. Tetap pantau informasi resmi BPBD.'}
          </p>
        </Card>
      )}

      <div className="mt-lg">
        <h3 className="mb">Titik kumpul terdekat</h3>
        {titik_kumpul?.length ? (
          <div className="grid-2">
            {titik_kumpul.map((t, i) => (
              <Card key={t.nama}>
                <div className="row between">
                  <span className="badge">{String(i + 1).padStart(2, '0')}</span>
                  {t.jarak_km != null && <span className="xs muted-2">{formatJarak(t.jarak_km)}</span>}
                </div>
                <h4 className="mt-sm">{t.nama}</h4>
                <a className="small mt-sm" style={{ color: 'var(--oranye)', fontWeight: 600, display: 'inline-block' }} href={mapsUrl(t.lat, t.lng)} target="_blank" rel="noreferrer">
                  Buka navigasi →
                </a>
              </Card>
            ))}
          </div>
        ) : (
          <Card><p className="small muted">Belum ada titik kumpul terdaftar untuk wilayah ini.</p></Card>
        )}
      </div>

      <p className="xs muted-2 mt-lg">Prakiraan BMKG diperbarui tiap 3 jam. Jam yang tampil mengikuti waktu lokal wilayahmu.</p>
    </>
  );
}
