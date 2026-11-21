import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { umurLabel, inisial } from '../lib/format.js';
import { Alert, Button, Field, Spinner } from '../components/ui.jsx';

const LANGKAH_LABEL = ['Anggota keluarga', 'Lokasi rumah', 'Susun rencana'];
const KELOMPOK = ['DEWASA', 'LANSIA', 'ANAK', 'BALITA'];

export default function Onboarding() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [household, setHousehold] = useState(null);
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState('');
  const [member, setMember] = useState({ panggilan: '', kelompok_umur: 'DEWASA', kebutuhan_khusus: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadHousehold = async () => {
    const h = await api('/household');
    setHousehold(h);
    if (h.region_id) setRegionId(String(h.region_id));
  };

  useEffect(() => {
    loadHousehold().catch((e) => setError(e.message));
    api('/regions', { auth: false })
      .then(setRegions)
      .catch(() => {});
  }, []);

  const tambahAnggota = async (e) => {
    e.preventDefault();
    if (!member.panggilan.trim()) return;
    setError('');
    setBusy(true);
    try {
      await api('/household/members', {
        method: 'POST',
        body: {
          panggilan: member.panggilan.trim(),
          kelompok_umur: member.kelompok_umur,
          kebutuhan_khusus: member.kebutuhan_khusus.trim() || null,
        },
      });
      setMember({ panggilan: '', kelompok_umur: 'DEWASA', kebutuhan_khusus: '' });
      await loadHousehold();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const hapusAnggota = async (id) => {
    setError('');
    try {
      await api(`/household/members/${id}`, { method: 'DELETE' });
      await loadHousehold();
    } catch (err) {
      setError(err.message);
    }
  };

  const simpanLokasi = async () => {
    setError('');
    setBusy(true);
    try {
      if (regionId) await api('/household', { method: 'PUT', body: { region_id: Number(regionId) } });
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const susunRencana = async () => {
    setError('');
    setBusy(true);
    try {
      await api('/ai/plan', { method: 'POST' });
      await refresh();
      navigate('/app/rencana', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const members = household?.members ?? [];

  return (
    <div className="center-card" style={{ maxWidth: 620 }}>
      <Link to="/" className="logo" style={{ marginBottom: 32 }}>
        <span className="logo-mark" aria-hidden="true" />
        SiagaKeluarga
      </Link>

      <div className="steps" aria-label={`Langkah ${step + 1} dari 3`}>
        {LANGKAH_LABEL.map((_, i) => (
          <span key={i} className={i <= step ? 'on' : ''} />
        ))}
      </div>
      <p className="xs muted-2 mt-sm">Langkah {step + 1} dari 3 · {LANGKAH_LABEL[step]}</p>

      <div className="card mt-lg">
        {step === 0 && (
          <>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Siapa saja yang tinggal di rumahmu?</h2>
            <p className="muted mt-sm">Data anggota dipakai untuk membagi tugas evakuasi sesuai usia dan kebutuhan khusus.</p>

            <div className="list mt">
              {members.length === 0 && <p className="small muted-2" style={{ padding: '12px 0' }}>Belum ada anggota. Tambahkan minimal satu orang.</p>}
              {members.map((m) => (
                <div className="list-item" key={m.id}>
                  <span className="avatar">{inisial(m.panggilan)}</span>
                  <div className="grow">
                    <div style={{ fontWeight: 600 }}>{m.panggilan}</div>
                    <div className="xs muted">
                      {umurLabel[m.kelompok_umur]}
                      {m.kebutuhan_khusus ? ` · ${m.kebutuhan_khusus}` : ' · Tidak ada kebutuhan khusus'}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => hapusAnggota(m.id)} aria-label={`Hapus ${m.panggilan}`}>Hapus</button>
                </div>
              ))}
            </div>

            <form className="form-grid mt" onSubmit={tambahAnggota}>
              <div className="grid-2" style={{ gap: 12 }}>
                <Field label="Nama panggilan" htmlFor="ob-nama">
                  <input id="ob-nama" className="input" placeholder="Sari" value={member.panggilan} onChange={(e) => setMember({ ...member, panggilan: e.target.value })} />
                </Field>
                <Field label="Kelompok umur" htmlFor="ob-umur">
                  <select id="ob-umur" className="input" value={member.kelompok_umur} onChange={(e) => setMember({ ...member, kelompok_umur: e.target.value })}>
                    {KELOMPOK.map((k) => <option key={k} value={k}>{umurLabel[k]}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Kebutuhan khusus (opsional)" htmlFor="ob-kk" hint="Mis. obat darah tinggi rutin, kursi roda, atau hamil.">
                <input id="ob-kk" className="input" value={member.kebutuhan_khusus} onChange={(e) => setMember({ ...member, kebutuhan_khusus: e.target.value })} />
              </Field>
              <Button type="submit" variant="outline" disabled={busy || !member.panggilan.trim()}>+ Tambah anggota</Button>
            </form>

            {error && <Alert tone="danger">{error}</Alert>}

            <div className="row between mt-lg">
              <Button variant="ghost" onClick={() => setStep(1)}>Lewati dulu</Button>
              <Button variant="primary" onClick={() => setStep(1)} disabled={members.length === 0}>Lanjut →</Button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Di mana alamat rumahmu?</h2>
            <p className="muted mt-sm">Wilayah dipakai untuk menghitung risiko bencana lokasimu dan prakiraan cuaca BMKG otomatis.</p>

            <div className="form-grid mt-lg">
              <Field label="Kecamatan / wilayah" htmlFor="ob-wilayah" hint="Pilih wilayah yang paling dekat dengan rumahmu.">
                <select id="ob-wilayah" className="input" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                  <option value="">Pilih wilayah</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>Kec. {r.kecamatan}, {r.kab_kota}</option>
                  ))}
                </select>
              </Field>
              {regions.length === 0 && <Alert tone="warn">Daftar wilayah belum tersedia. Kamu bisa melengkapinya nanti di Profil keluarga.</Alert>}
            </div>

            {error && <Alert tone="danger">{error}</Alert>}

            <div className="row between mt-lg">
              <Button variant="ghost" onClick={() => setStep(0)}>← Kembali</Button>
              <Button variant="primary" onClick={simpanLokasi} disabled={busy}>{busy ? 'Menyimpan…' : 'Lanjut →'}</Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Siap menyusun rencanamu</h2>
            <p className="muted mt-sm">AI akan menilai risiko lokasi dan membagi tugas untuk {members.length} anggota keluarga.</p>

            <ul className="small mt" style={{ paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
              <li>✓ {members.length} anggota keluarga terdaftar</li>
              <li>✓ Wilayah {household?.region ? `Kec. ${household.region.kecamatan}` : 'belum dipilih'}</li>
              <li>○ Rencana darurat akan disimpan di akunmu dan bisa dibagikan lewat tautan</li>
            </ul>

            {busy && (
              <div className="card card-cream mt-lg" style={{ padding: 20 }}>
                <Spinner label="AI sedang menyusun rencanamu…" />
                <p className="xs muted-2 mt-sm">Biasanya membutuhkan beberapa detik.</p>
              </div>
            )}

            {error && <Alert tone="danger">{error}</Alert>}

            <div className="row between mt-lg">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={busy}>← Kembali</Button>
              <Button variant="primary" onClick={susunRencana} disabled={busy}>Selesai, susun rencanaku</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
