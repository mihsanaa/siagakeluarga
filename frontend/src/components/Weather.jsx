import { jamDari, tingkatTone } from '../lib/format.js';

// Ikon sederhana dari teks cuaca BMKG
export function ikonCuaca(teks = '') {
  const t = teks.toLowerCase();
  if (t.includes('petir')) return '⛈';
  if (t.includes('hujan lebat') || t.includes('hujan sedang')) return '🌧';
  if (t.includes('hujan')) return '🌦';
  if (t.includes('berawan')) return '⛅';
  if (t.includes('cerah')) return '☀';
  if (t.includes('kabut')) return '🌫';
  return '🌡';
}

export function ForecastStrip({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="forecast-strip" role="list">
      {items.map((e, i) => (
        <div className="forecast-cell" role="listitem" key={`${e.waktu_lokal}-${i}`}>
          <div className="xs muted-2">{jamDari(e.waktu_lokal)}</div>
          <div style={{ fontSize: 22, margin: '6px 0' }} aria-hidden="true">{ikonCuaca(e.cuaca)}</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{e.suhu_c != null ? `${e.suhu_c}°` : '-'}</div>
          <div className="xs muted" style={{ marginTop: 4 }}>{e.cuaca}</div>
          <div className="bar-rain" aria-label={`Peluang hujan ${e.curah_hujan_mm ?? 0} mm`}>
            <span style={{ width: `${Math.min(100, (e.curah_hujan_mm ?? 0) * 2)}%` }} />
          </div>
          <div className="xs muted-2" style={{ marginTop: 4 }}>{e.curah_hujan_mm ?? 0} mm</div>
        </div>
      ))}
    </div>
  );
}

export function alertCuaca(cuaca) {
  const t = (cuaca?.saat_ini?.cuaca || '').toLowerCase();
  if (t.includes('lebat') || t.includes('petir')) return { tone: 'danger', label: 'Bahaya' };
  if (t.includes('hujan')) return { tone: 'warn', label: 'Waspada' };
  return { tone: 'ok', label: 'Aman' };
}

export { tingkatTone };
