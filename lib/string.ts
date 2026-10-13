/**
 * Helper untuk normalisasi string opsional:
 * - Menghapus spasi di awal dan akhir (trim).
 * - Mengembalikan null jika nilai kosong (""), hanya spasi ("   "), null, atau undefined.
 * - Mengembalikan string hasil trim jika memiliki isi.
 */
export function normalizeOptionalString(
  val?: string | null,
): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  return trimmed !== "" ? trimmed : null;
}

