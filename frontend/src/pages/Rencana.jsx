import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { fmtTanggal } from '../lib/format.js';
import { Alert, Button, Card, Spinner } from '../components/ui.jsx';
import PageHead from '../components/PageHead.jsx';

const LOADING_MSG = ['Menilai risiko lokasi…', 'Menyusun tugas tiap anggota…', 'Menulis daftar tas siaga…', 'Menyiapkan titik kumpul terdekat…'];

export default function Rencana() {
  const [household, setHousehold] = useState(null);
  const [plan, setPlan] = useState(null);
  const [meta, setMeta] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api('/household')
      .then((h) => {
        setHousehold(h);
        const latest = h.emergency_plans?.[0];
        if (latest) {
          setPlan(latest.konten);
          setMeta({ created_at: latest.created_at, model_ai: latest.model_ai });
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MSG.length), 1800);
    return () => clearInterval(t);
  }, [busy]);

  const buatRencana = async () => {
    setError('');
    setBusy(true);
    setMsgIdx(0);
    try {
      const data = await api('/ai/plan', { method: 'POST' });
      setPlan(data.konten);
      setMeta({ created_at: data.created_at, model_ai: data.model_ai });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const shareUrl = household?.share_token ? `${window.location.origin}/r/${household.share_token}` : '';

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Tidak dapat menyalin otomatis. Salin tautan secara manual.');
    }
  };

  const bagikanWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Rencana darurat keluarga kita: ${shareUrl}`)}`, '_blank', 'noopener');
  };

  return (
    <>
      <PageHead
        title="Rencana darurat"
        sub={meta ? `Dibuat ${fmtTanggal(meta.created_at)} · model ${meta.model_ai}` : 'Belum ada rencana. Susun sekarang dari profil keluargamu.'}
        actions={
          <>
            {plan && <Button variant="outline" size="sm" onClick={() => window.print()}>Cetak / simpan PDF</Button>}
            <Button variant="primary" size="sm" onClick={buatRencana} disabled={busy}>
              {busy ? 'Menyusun…' : plan ? 'Perbarui rencana' : 'Susun rencana'}
            </Button>
          </>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {busy && (
        <Card className="mb" style={{ background: 'var(--cream)', borderColor: 'var(--cream-2)' }}>
          <Spinner label={LOADING_MSG[msgIdx]} />
          <p className="xs muted-2 mt-sm">Biasanya membutuhkan beberapa detik.</p>
        </Card>
      )}

      {!plan && !busy && (
        <Card className="center" style={{ padding: 48 }}>
          <h3>Belum ada rencana darurat</h3>
          <p className="muted mt-sm" style={{ maxWidth: 460, margin: '8px auto 0' }}>
            AI akan menyusun titik kumpul, tugas tiap anggota, dan langkah sebelum–saat–sesudah bencana berdasarkan profilmu.
          </p>
          <div className="mt-lg">
            <Button variant="primary" onClick={buatRencana} disabled={!household?.members?.length}>Susun rencana sekarang</Button>
            {!household?.members?.length && <p className="xs muted-2 mt">Tambahkan anggota keluarga terlebih dahulu di <Link to="/app/profil" style={{ color: 'var(--oranye)' }}>Profil keluarga</Link>.</p>}
          </div>
        </Card>
      )}

      {plan && !busy && (
        <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) 300px', alignItems: 'start' }}>
          <Card className="plan-doc" style={{ padding: 32 }}>
            <div className="row between wrap gap-sm">
              <span className="badge badge-orange">Rencana darurat keluarga</span>
              <span className="xs muted-2">{household?.region ? `Kec. ${household.region.kecamatan}` : ''}</span>
            </div>

            <section className="plan-section">
              <h3>Ringkasan risiko</h3>
              <p className="muted mt-sm">{plan.ringkasan_risiko}</p>
            </section>

            <section className="plan-section">
              <h3>Sebelum bencana</h3>
              <ol className="mt-sm" style={{ paddingLeft: 20, lineHeight: 1.7 }}>
                {plan.rencana_sebelum_bencana.map((l, i) => <li key={i}>{l}</li>)}
              </ol>
            </section>

            <section className="plan-section">
              <h3>Saat bencana</h3>
              <ol className="mt-sm" style={{ paddingLeft: 20, lineHeight: 1.7 }}>
                {plan.langkah_saat_bencana.map((l, i) => <li key={i}>{l}</li>)}
              </ol>
            </section>

            <section className="plan-section">
              <h3>Tugas tiap anggota</h3>
              <div className="mt-sm">
                {plan.pembagian_tugas_keluarga.map((t, i) => (
                  <div className="role-row" key={i}>
                    <span className="avatar">{t.anggota.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {t.anggota} <span className="muted small" style={{ fontWeight: 400 }}>· {t.peran}</span>
                      </div>
                      <p className="small muted mt-sm">{t.fokus_pendampingan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="plan-section">
              <h3>Rute dan titik kumpul</h3>
              <p className="muted mt-sm">{plan.rute_dan_titik_kumpul}</p>
            </section>

            <section className="plan-section">
              <h3>Kontak darurat</h3>
              <ul className="mt-sm" style={{ paddingLeft: 20, lineHeight: 1.8 }}>
                {plan.kontak_darurat.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </section>
          </Card>

          <div className="stack no-print" style={{ gap: 16, position: 'sticky', top: 24 }}>
            <Card>
              <h4>Bagikan ke keluarga</h4>
              <p className="small muted mt-sm">Anggota bisa membuka rencana ini tanpa login (mode hanya baca).</p>
              <div className="form-grid mt">
                <input className="input" readOnly value={shareUrl} aria-label="Tautan rencana" onFocus={(e) => e.target.select()} style={{ fontSize: 13 }} />
                <Button variant="navy" block onClick={salin}>{copied ? 'Tautan disalin ✓' : 'Salin tautan'}</Button>
                <Button variant="outline" block onClick={bagikanWA}>Kirim ke WhatsApp</Button>
              </div>
            </Card>
            <Card tone="navy">
              <div className="xs muted">Darurat sekarang?</div>
              <a href="tel:112" className="btn btn-primary btn-block mt-sm" style={{ textDecoration: 'none' }}>☎ Telepon 112</a>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
