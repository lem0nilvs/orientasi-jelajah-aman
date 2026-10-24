// src/types/riwayat.ts
// Satu entri riwayat pencarian. Koordinat ikut disimpan supaya klik pada
// riwayat bisa langsung memuat cuaca kota tersebut tanpa mencari ulang.
export interface RiwayatPencarian {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  dicariPada: number; // epoch milidetik
}