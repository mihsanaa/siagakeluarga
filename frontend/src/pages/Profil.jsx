import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { umurLabel, inisial, mapsUrl } from '../lib/format.js';
import { Alert, Button, Card, Field, Modal, Spinner } from '../components/ui.jsx';
import PageHead from '../components/PageHead.jsx';
import { useAuth } from '../lib/auth.jsx';

const KELOMPOK = ['DEWASA', 'LANSIA', 'ANAK', 'BALITA'];
const KOSONG = { panggilan: '', kelompok_umur: 'DEWASA', kebutuhan_khusus: '' };

export default function Profil() {
  const { refresh } = useAuth();
  const [household, setHousehold] = useState(null);
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState('');
  const [editing, setEditing] = useState(null); // null | 'baru' | member
  const [form, setForm] = useState(KOSONG);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const h = await api('/household');
    setHousehold(h);
    setRegionId(h.region_id ? String(h.region_id) : '');
    return h;
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
    api('/regions', { auth: false }).then(setRegions).catch(() => {});
  }, []);

  const bukaForm = (m) => {
    setError('');
    if (m) {
      setEditing(m);
      setForm({ panggilan: m.panggilan, kelompok_umur: m.kelompok_umur, kebutuhan_khusus: m.kebutuhan_khusus || '' });
    } else {
      setEditing('baru');
      setForm(KOSONG);
    }
  };

  const simpanAnggota = async () => {
    if (!form.panggilan.trim()) return setError('Nama panggilan wajib diisi');
    setBusy(true);
    setError('');
    const body = {
      panggilan: form.panggilan.trim(),
      kelompok_umur: form.kelompok_umur,
      kebutuhan_khusus: form.kebutuhan_khusus.trim() || null,
    };
    try {
      if (editing === 'baru') await api('/household/members', { method: 'POST', body });
      else await api(`/household/members/${editing.id}`, { method: 'PUT', body });
      setEditing(null);
      await load();
      setInfo('Data anggota tersimpan. Perbarui rencana darurat agar tugas ikut berubah.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const hapusAnggota = async (m) => {
    if (!window.confirm(`Hapus ${m.panggilan} dari keluarga?`)) return;
    try {
      await api(`/household/members/${m.id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const simpanWilayah = async () => {
    setBusy(true);
    setError('');
    try {
      await api('/household', { method: 'PUT', body: { region_id: regionId ? Number(regionId) : null } });
      await load();
      await refresh();
      setInfo('Wilayah diperbarui. Risiko dan titik kumpul ikut menyesuaikan.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const regenerasiTautan = async () => {
    if (!window.confirm('Tautan lama tidak akan berlaku lagi. Lanjutkan?')) return;
    try {
      await api('/household', { method: 'PUT', body: { regenerate_share_token: true } });
      await load();
      setInfo('Tautan baru dibuat. Kirim ulang ke keluarga.');
    } catch (e) {
      setError(e.message);
    }
  };

  if (!household) return error ? <Alert tone="danger">{error}</Alert> : <Spinner label="Memuat profil…" />;

  const region = household.region;
  const shareUrl = `${window.location.origin}/r/${household.share_token}`;

  return (
    <>
      <PageHead
        title="Profil keluarga"
        sub="Data ini dipakai untuk membagi tugas evakuasi dan menghitung risiko lokasi."
        actions={<Button variant="primary" size="sm" onClick={() => bukaForm(null)}>+ Tambah anggota</Button>}
      />

      {error && <Alert tone="danger">{error}</Alert>}
      {info && <Alert tone="ok">{info}</Alert>}

      <div className="grid-2 mt" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', alignItems: 'start' }}>
        <Card>
          <div className="row between">
            <h3>Anggota keluarga</h3>
            <span className="badge">{household.members.length} orang</span>
          </div>
          {household.members.length === 0 ? (
            <p className="muted mt">Belum ada anggota. Tambahkan untuk mulai menyusun rencana.</p>
          ) : (
            <div className="list mt">
              {household.members.map((m) => (
                <div className="list-item" key={m.id}>
                  <span className="avatar avatar-lg">{inisial(m.panggilan)}</span>
                  <div className="grow">
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{m.panggilan}</div>
                    <div className="small muted">{umurLabel[m.kelompok_umur]}</div>
                    {m.kebutuhan_khusus && <span className="badge badge-warn mt-sm">{m.kebutuhan_khusus}</span>}
                  </div>
                  <div className="row gap-sm">
                    <Button variant="outline" size="sm" onClick={() => bukaForm(m)}>Ubah</Button>
                    <Button variant="ghost" size="sm" onClick={() => hapusAnggota(m)} aria-label={`Hapus ${m.panggilan}`}>Hapus</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="stack" style={{ gap: 16 }}>
          <Card>
            <h4>Lokasi rumah</h4>
            <div className="form-grid mt-sm">
              <Field label="Kecamatan / wilayah" htmlFor="wilayah">
                <select id="wilayah" className="input" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                  <option value="">Belum dipilih</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>Kec. {r.kecamatan}, {r.kab_kota}</option>
                  ))}
                </select>
              </Field>
              <Button variant="navy" size="sm" onClick={simpanWilayah} disabled={busy}>Simpan lokasi</Button>
            </div>
            {region && (
              <div className="mt">
                <p className="small muted">Kec. {region.kecamatan}, {region.kab_kota}</p>
                {household.lat != null && (
                  <a className="small" style={{ color: 'var(--oranye)', fontWeight: 600 }} href={mapsUrl(household.lat, household.lng)} target="_blank" rel="noreferrer">
                    Lihat di peta →
                  </a>
                )}
              </div>
            )}
          </Card>

          <Card>
            <h4>Kartu darurat publik</h4>
            <p className="small muted mt-sm">Anggota keluarga bisa membuka rencana lewat tautan ini tanpa login.</p>
            <input className="input mt" readOnly value={shareUrl} aria-label="Tautan kartu darurat" onFocus={(e) => e.target.select()} style={{ fontSize: 13 }} />
            <div className="row gap-sm mt">
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(shareUrl).then(() => setInfo('Tautan disalin.'))}>Salin tautan</Button>
              <Button variant="ghost" size="sm" onClick={regenerasiTautan}>Buat tautan baru</Button>
            </div>
          </Card>

          <Card tone="cream">
            <h4>Nomor darurat nasional</h4>
            <ul className="small mt-sm" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
              <li>Darurat Nasional: <a href="tel:112">112</a></li>
              <li>BNPB: <a href="tel:117">117</a></li>
              <li>SAR: <a href="tel:115">115</a></li>
              <li>Ambulans: <a href="tel:118">118</a> / <a href="tel:119">119</a></li>
            </ul>
          </Card>
        </div>
      </div>

      {editing && (
        <Modal
          title={editing === 'baru' ? 'Tambah anggota keluarga' : `Ubah ${editing.panggilan}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>Batal</Button>
              <Button variant="primary" onClick={simpanAnggota} disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan anggota'}</Button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Nama panggilan" htmlFor="m-nama">
              <input id="m-nama" className="input" value={form.panggilan} onChange={(e) => setForm({ ...form, panggilan: e.target.value })} autoFocus />
            </Field>
            <Field label="Kelompok umur" htmlFor="m-umur">
              <select id="m-umur" className="input" value={form.kelompok_umur} onChange={(e) => setForm({ ...form, kelompok_umur: e.target.value })}>
                {KELOMPOK.map((k) => <option key={k} value={k}>{umurLabel[k]}</option>)}
              </select>
            </Field>
            <Field label="Kebutuhan khusus" htmlFor="m-kk" hint="Mis. obat darah tinggi rutin, kursi roda, hamil. Kosongkan jika tidak ada.">
              <input id="m-kk" className="input" value={form.kebutuhan_khusus} onChange={(e) => setForm({ ...form, kebutuhan_khusus: e.target.value })} />
            </Field>
            {error && <Alert tone="danger">{error}</Alert>}
          </div>
        </Modal>
      )}
    </>
  );
}
