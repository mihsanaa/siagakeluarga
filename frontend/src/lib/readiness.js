// Skor kesiapan dihitung di klien sebagai estimasi dari data yang tersedia di backend.
// Bobot: tas siaga 40%, rencana darurat 30%, latihan 20%, anggota keluarga 10%.
export function skorKesiapan(household) {
  if (!household) return 0;
  const tas = household.kesiapan_tas?.persentase ?? 0;
  const rencana = household.emergency_plans?.length ? 100 : 0;
  const latihan = household.drills?.length ? 100 : 0;
  const anggota = household.members?.length ? 100 : 0;
  return Math.round(tas * 0.4 + rencana * 0.3 + latihan * 0.2 + anggota * 0.1);
}

// Langkah berikutnya yang paling berdampak untuk dikerjakan sekarang
export function langkahBerikutnya(household) {
  if (!household?.members?.length) {
    return { teks: 'Tambahkan anggota keluarga', dampak: '+10% skor kesiapan', to: '/app/profil' };
  }
  if (!household?.emergency_plans?.length) {
    return { teks: 'Susun rencana darurat keluarga', dampak: '+30% skor kesiapan', to: '/app/rencana' };
  }
  const tas = household.kesiapan_tas;
  if (tas && tas.persentase < 100) {
    return {
      teks: 'Lengkapi tas siaga',
      dampak: `${tas.total - tas.siap} barang perlu dicek`,
      to: '/app/tas-siaga',
    };
  }
  if (!household?.drills?.length) {
    return { teks: 'Jalankan latihan skenario pertama', dampak: '+20% skor kesiapan', to: '/app/latihan' };
  }
  return { teks: 'Keluarga siap. Ulangi latihan tiap 2 minggu', dampak: 'Pertahankan skormu', to: '/app/latihan' };
}
