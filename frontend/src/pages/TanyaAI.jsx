import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { Alert, Button, Spinner } from '../components/ui.jsx';
import PageHead from '../components/PageHead.jsx';

const SARAN = [
  'Apa yang harus disiapkan kalau banjir?',
  'Bagaimana evakuasi lansia saat air naik?',
  'Apa yang harus dilakukan saat gempa di dalam rumah?',
  'Apa saja isi tas siaga untuk bayi?',
];

export default function TanyaAI() {
  const [pesan, setPesan] = useState([]); // { role: 'user'|'ai', teks, referensi?, fallback? }
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const akhirRef = useRef(null);

  useEffect(() => {
    akhirRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [pesan, busy]);

  const kirim = async (teks) => {
    const pertanyaan = (teks ?? input).trim();
    if (pertanyaan.length < 5 || busy) return;
    setError('');
    setInput('');
    setPesan((p) => [...p, { role: 'user', teks: pertanyaan }]);
    setBusy(true);
    try {
      const data = await api('/ai/ask', { method: 'POST', body: { pertanyaan } });
      setPesan((p) => [...p, { role: 'ai', teks: data.jawaban, referensi: data.referensi }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      kirim();
    }
  };

  return (
    <>
      <PageHead
        title="Tanya Siaga"
        sub="Jawaban berbasis panduan resmi BNPB. Bukan pengganti instruksi petugas BPBD saat kondisi darurat."
      />

      <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 520 }}>
        <div className="stack" style={{ gap: 16, padding: 24, flex: 1, overflowY: 'auto', maxHeight: '60vh' }} aria-live="polite">
          {pesan.length === 0 && (
            <div className="stack" style={{ gap: 14, margin: 'auto 0' }}>
              <p className="muted">Coba salah satu pertanyaan ini, atau tulis sendiri:</p>
              <div className="tabs">
                {SARAN.map((s) => (
                  <button key={s} className="chip" onClick={() => kirim(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {pesan.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
              {m.teks}
              {m.referensi?.length > 0 && (
                <div className="row gap-sm wrap mt-sm">
                  {[...new Set(m.referensi.map((r) => r.sumber))].map((s) => (
                    <span key={s} className="badge" style={{ height: 'auto', padding: '4px 10px', whiteSpace: 'normal' }}>Sumber: {s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="chat-bubble chat-ai">
              <Spinner label="Mencari di panduan BNPB…" />
            </div>
          )}

          {error && <Alert tone="danger">{error}</Alert>}
          <div ref={akhirRef} />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: 16 }}>
          <div className="row gap-sm" style={{ alignItems: 'flex-end' }}>
            <textarea
              className="input"
              rows={1}
              placeholder="Tanya apa saja soal kesiapsiagaan…"
              aria-label="Pertanyaan untuk Tanya Siaga"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={1000}
              style={{ minHeight: 48, height: 48 }}
            />
            <Button variant="primary" onClick={() => kirim()} disabled={busy || input.trim().length < 5} style={{ height: 48 }}>
              Kirim
            </Button>
          </div>
          <p className="xs muted-2 mt-sm">Minimal 5 karakter. Enter untuk kirim, Shift+Enter untuk baris baru.</p>
        </div>
      </div>
    </>
  );
}
