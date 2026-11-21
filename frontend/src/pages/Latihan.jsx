import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { SKENARIO_LATIHAN } from '../lib/content.js';
import { fmtTanggal } from '../lib/format.js';
import { Alert, Badge, Button, Card, Progress, Spinner } from '../components/ui.jsx';
import PageHead from '../components/PageHead.jsx';

export default function Latihan() {
  const [riwayat, setRiwayat] = useState(null);
  const [kuis, setKuis] = useState(null); // { skenario, soal, index, pilih, skorBenar, selesai }
  const [loadingJenis, setLoadingJenis] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRiwayat = () => api('/drills').then(setRiwayat).catch((e) => setError(e.message));

  useEffect(() => {
    loadRiwayat();
  }, []);

  const mulai = async (skenario) => {
    setError('');
    setLoadingJenis(skenario.jenis);
    try {
      const data = await api('/ai/quiz', { method: 'POST', body: { jenis_bencana: skenario.jenis } });
      setKuis({ skenario, soal: data.soal, index: 0, pilih: null, skorBenar: 0, selesai: false });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingJenis(null);
    }
  };

  const pilih = (idx) => {
    if (kuis.pilih !== null) return;
    const benar = idx === kuis.soal[kuis.index].jawaban_benar_index;
    setKuis({ ...kuis, pilih: idx, skorBenar: kuis.skorBenar + (benar ? 1 : 0) });
  };

  const lanjut = async () => {
    const isLast = kuis.index === kuis.soal.length - 1;
    if (!isLast) {
      setKuis({ ...kuis, index: kuis.index + 1, pilih: null });
      return;
    }
    // Akhir kuis: simpan hasil sebagai simulasi
    const skor = Math.round((kuis.skorBenar / kuis.soal.length) * 100);
    setSaving(true);
    try {
      await api('/drills', { method: 'POST', body: { jadwal: new Date().toISOString(), skor } });
      await loadRiwayat();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
      setKuis({ ...kuis, selesai: true, index: kuis.index, pilih: kuis.pilih });
    }
  };

  if (kuis) {
    const soal = kuis.soal[kuis.index];
    const skorAkhir = Math.round((kuis.skorBenar / kuis.soal.length) * 100);

    return (
      <>
        <PageHead
          title={kuis.skenario.judul}
          sub={kuis.selesai ? 'Latihan selesai' : `Pertanyaan ${kuis.index + 1} dari ${kuis.soal.length}`}
          actions={
            <Button variant="ghost" size="sm" onClick={() => setKuis(null)}>← Kembali ke daftar latihan</Button>
          }
        />

        {!kuis.selesai && (
          <>
            <Progress value={((kuis.index + (kuis.pilih !== null ? 1 : 0)) / kuis.soal.length) * 100} />
            <Card className="mt-lg" style={{ padding: 32 }}>
              <div className="xs muted-2">Keputusan {kuis.index + 1}</div>
              <h3 className="mt-sm" style={{ fontSize: 22 }}>{soal.pertanyaan}</h3>

              <div className="form-grid mt-lg" role="radiogroup" aria-label="Pilihan jawaban">
                {soal.pilihan.map((p, i) => {
                  const dijawab = kuis.pilih !== null;
                  const benar = i === soal.jawaban_benar_index;
                  const dipilih = i === kuis.pilih;
                  let bg = 'var(--putih)';
                  let border = 'var(--border)';
                  if (dijawab && benar) { bg = 'var(--ok-soft)'; border = '#86efac'; }
                  else if (dijawab && dipilih) { bg = 'var(--danger-soft)'; border = '#fca5a5'; }
                  return (
                    <button
                      key={i}
                      role="radio"
                      aria-checked={dipilih}
                      onClick={() => pilih(i)}
                      disabled={dijawab}
                      style={{
                        textAlign: 'left', padding: '16px 18px', borderRadius: 16, border: `1px solid ${border}`,
                        background: bg, cursor: dijawab ? 'default' : 'pointer', fontSize: 16, lineHeight: 1.5,
                        transition: 'border-color 150ms, background 150ms',
                      }}
                    >
                      <span className="muted-2" style={{ fontWeight: 700, marginRight: 10 }}>{String.fromCharCode(65 + i)}</span>
                      {p}
                    </button>
                  );
                })}
              </div>

              {kuis.pilih !== null && (
                <div className="mt-lg">
                  <Alert tone={kuis.pilih === soal.jawaban_benar_index ? 'ok' : 'warn'}>
                    <strong>{kuis.pilih === soal.jawaban_benar_index ? '✓ Tepat.' : '! Perlu diingat.'}</strong> {soal.penjelasan}
                  </Alert>
                  <div className="row between mt-lg">
                    <span className="xs muted-2">Skor sementara: {kuis.skorBenar} benar</span>
                    <Button variant="primary" onClick={lanjut} disabled={saving}>
                      {saving ? 'Menyimpan…' : kuis.index === kuis.soal.length - 1 ? 'Lihat hasil' : 'Lanjut →'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}

        {kuis.selesai && (
          <Card className="mt-lg center" style={{ padding: 40 }}>
            <div className="xs muted-2">Skor latihan</div>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 8 }}>{skorAkhir}</div>
            <p className="muted mt">{kuis.skorBenar} dari {kuis.soal.length} keputusan tepat</p>
            <div className="row gap-sm wrap mt-lg" style={{ justifyContent: 'center' }}>
              <Button variant="navy" onClick={() => setKuis(null)}>Coba skenario lain</Button>
              <Button variant="outline" onClick={() => mulai(kuis.skenario)}>Ulangi skenario ini</Button>
            </div>
          </Card>
        )}
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Latihan"
        sub="Latih keputusan cepat dalam skenario yang realistis. Tiap latihan dicatat sebagai simulasi keluarga."
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="grid-3 mb">
        <Card>
          <div className="xs muted-2">Rata-rata skor</div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {riwayat?.rata_rata_skor ?? '–'}
          </div>
        </Card>
        <Card>
          <div className="xs muted-2">Total simulasi</div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em' }}>{riwayat?.drills?.length ?? 0}</div>
        </Card>
        <Card>
          <div className="xs muted-2">Latihan terakhir</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>
            {riwayat?.drills?.[0] ? fmtTanggal(riwayat.drills[0].jadwal) : 'Belum pernah'}
          </div>
        </Card>
      </div>

      <div className="grid-2">
        {SKENARIO_LATIHAN.map((s) => (
          <Card key={s.jenis}>
            <div className="row between">
              <Badge tone="info">5 keputusan · ±3 menit</Badge>
            </div>
            <h3 className="mt-sm">{s.judul}</h3>
            <p className="muted mt-sm small">{s.ringkas}</p>
            <div className="mt">
              <Button variant="primary" size="sm" onClick={() => mulai(s)} disabled={loadingJenis !== null}>
                {loadingJenis === s.jenis ? <Spinner label="Menyusun skenario…" /> : 'Mulai latihan'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-lg">
        <h4>Riwayat simulasi</h4>
        {!riwayat ? (
          <Spinner />
        ) : riwayat.drills.length === 0 ? (
          <p className="small muted mt-sm">Belum ada latihan. Mulai satu skenario di atas.</p>
        ) : (
          <div className="list mt-sm">
            {riwayat.drills.map((d) => (
              <div className="list-item" key={d.id}>
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{fmtTanggal(d.jadwal)}</div>
                  <div className="xs muted">Simulasi keluarga</div>
                </div>
                <Badge tone={d.skor >= 80 ? 'ok' : d.skor >= 50 ? 'warn' : 'danger'}>Skor {d.skor ?? '–'}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
