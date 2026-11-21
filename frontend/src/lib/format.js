export const jenisLabel = {
  GEMPA: 'Gempa',
  TSUNAMI: 'Tsunami',
  BANJIR: 'Banjir',
  LONGSOR: 'Longsor',
  CUACA_EKSTREM: 'Cuaca ekstrem',
};

export const umurLabel = { BALITA: 'Balita', ANAK: 'Anak', DEWASA: 'Dewasa', LANSIA: 'Lansia' };

export const tingkatLabel = { RENDAH: 'Rendah', SEDANG: 'Sedang', TINGGI: 'Tinggi' };

export const tingkatTone = { RENDAH: 'ok', SEDANG: 'warn', TINGGI: 'danger' };

export function fmtTanggal(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function fmtHariIni() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// waktu_lokal dari BMKG berformat "YYYY-MM-DD HH:mm:ss"
export function jamDari(waktuLokal) {
  if (!waktuLokal) return '-';
  return String(waktuLokal).slice(11, 16);
}

export function formatJarak(km) {
  if (km == null) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function mapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function inisial(nama = '') {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}

export function hariSampai(iso) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}
