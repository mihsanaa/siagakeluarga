import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { hariSampai, fmtTanggal } from '../lib/format.js';
import { Alert, Badge, Button, Card, Field, Modal, Progress, Spinner } from '../components/ui.jsx';
import PageHead from '../components/PageHead.jsx';

export default function TasSiaga() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nama_item: '', kadaluarsa: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => setData(await api('/kit'));

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const toggle = async (item) => {
    setError('');
    // Update optimistik agar checklist terasa responsif
    setData((d) => ({ ...d, items: d.items.map((i) => (i.id === item.id ? { ...i, status: !i.status } : i)) }));
    try {
      await api(`/kit/${item.id}`, { method: 'PATCH', body: { status: !item.status } });
      await load();
    } catch (e) {
      setError(e.message);
      await load();
    }
  };

  const hapus = async (item) => {
    if (!window.confirm(`Hapus "${item.nama_item}" dari tas siaga?`)) return;
    try {
      await api(`/kit/${item.id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const simpan = async (e) => {
    e.preventDefault();
    if (!form.nama_item.trim()) return;
    setBusy(true);
    setError('');
    try {
      await api('/kit', {
        method: 'POST',
        body: { nama_item: form.nama_item.trim(), status: false, kadaluarsa: form.kadaluarsa || null },
      });
      setModal(false);
      setForm({ nama_item: '', kadaluarsa: '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!data) return error ? <Alert tone="danger">{error}</Alert> : <Spinner label="Memuat tas siaga…" />;

  const { items, kesiapan } = data;
  const belumSiap = items.filter((i) => !i.status);
  const kadaluarsa = items.filter((i) => {
    const h = hariSampai(i.kadaluarsa);
    return h !== null && h <= 30;
  });

  return (
    <>
      <PageHead
        title="Tas siaga"
        sub={`${kesiapan.siap} dari ${kesiapan.total} barang sudah siap`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => window.print()}>Cetak daftar</Button>
            <Button variant="primary" size="sm" onClick={() => setModal(true)}>+ Tambah barang</Button>
          </>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="mb">
        <div className="row between wrap gap-sm">
          <div>
            <div className="xs muted-2">Kelengkapan</div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{kesiapan.persentase}%</div>
          </div>
          <div className="row gap-sm wrap">
            {belumSiap.length > 0 && <Badge tone="warn">{belumSiap.length} barang belum dicek</Badge>}
            {kadaluarsa.length > 0 && <Badge tone="danger">{kadaluarsa.length} akan/sudah kedaluwarsa</Badge>}
          </div>
        </div>
        <div className="mt"><Progress value={kesiapan.persentase} /></div>
      </Card>

      {items.length === 0 ? (
        <Card className="center" style={{ padding: 40 }}>
          <h3>Tas siaga masih kosong</h3>
          <p className="muted mt-sm">Mulai dengan senter, air minum, obat rutin, dan dokumen penting.</p>
          <div className="mt"><Button variant="primary" onClick={() => setModal(true)}>+ Tambah barang pertama</Button></div>
        </Card>
      ) : (
        <Card style={{ padding: '8px 24px' }}>
          <ul className="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((item) => {
              const h = hariSampai(item.kadaluarsa);
              return (
                <li className="list-item" key={item.id}>
                  <input
                    type="checkbox"
                    checked={item.status}
                    onChange={() => toggle(item)}
                    aria-label={`Tandai ${item.nama_item} sudah siap`}
                    style={{ width: 20, height: 20, accentColor: 'var(--oranye)', cursor: 'pointer' }}
                  />
                  <div className="grow">
                    <div style={{ fontWeight: 600, textDecoration: item.status ? 'line-through' : 'none', color: item.status ? 'var(--teks-3)' : 'var(--teks)' }}>
                      {item.nama_item}
                    </div>
                    {item.kadaluarsa && (
                      <div className="xs muted">
                        Kedaluwarsa {fmtTanggal(item.kadaluarsa)}
                      </div>
                    )}
                  </div>
                  {h !== null && h < 0 && <Badge tone="danger">Kedaluwarsa</Badge>}
                  {h !== null && h >= 0 && h <= 30 && <Badge tone="warn">{h} hari lagi</Badge>}
                  <Button variant="ghost" size="sm" onClick={() => hapus(item)} aria-label={`Hapus ${item.nama_item}`}>Hapus</Button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {modal && (
        <Modal
          title="Tambah barang tas siaga"
          onClose={() => setModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>Batal</Button>
              <Button variant="primary" onClick={simpan} disabled={busy || !form.nama_item.trim()}>{busy ? 'Menyimpan…' : 'Simpan ke tas siaga'}</Button>
            </>
          }
        >
          <form className="form-grid" onSubmit={simpan}>
            <Field label="Nama barang" htmlFor="k-nama">
              <input id="k-nama" className="input" autoFocus placeholder="Mis. Senter dan baterai cadangan" value={form.nama_item} onChange={(e) => setForm({ ...form, nama_item: e.target.value })} />
            </Field>
            <Field label="Tanggal kedaluwarsa (opsional)" htmlFor="k-exp" hint="Isi untuk obat atau makanan. Kosongkan jika tidak ada.">
              <input id="k-exp" type="date" className="input" value={form.kadaluarsa} onChange={(e) => setForm({ ...form, kadaluarsa: e.target.value })} />
            </Field>
          </form>
        </Modal>
      )}
    </>
  );
}
