
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HasilGeocoding } from "../types/geocoding";

// TAMBAHAN UTS: penyimpanan riwayat pencarian terpisah dari favorit.
const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
const MAKSIMAL_RIWAYAT = 10;

export type ItemRiwayatPencarian = {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  country: string;
};

export async function ambilRiwayatPencarian(): Promise<ItemRiwayatPencarian[]> {
  const json = await AsyncStorage.getItem(KUNCI_RIWAYAT);
  if (!json) return [];

  try {
    const data: unknown = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data as ItemRiwayatPencarian[];
  } catch {
    return [];
  }
}

export async function simpanRiwayatPencarian(
  kota: HasilGeocoding
): Promise<void> {
  const daftar = await ambilRiwayatPencarian();

  // TAMBAHAN UTS: kota yang dicari ulang dipindahkan ke urutan teratas.
  const tanpaDuplikat = daftar.filter(
    (item) =>
      !(item.id === kota.id &&
        item.latitude === kota.latitude &&
        item.longitude === kota.longitude)
  );

  const itemBaru: ItemRiwayatPencarian = {
    id: kota.id,
    nama: kota.name,
    latitude: kota.latitude,
    longitude: kota.longitude,
    country: kota.country ?? "",
  };

  const hasil = [itemBaru, ...tanpaDuplikat].slice(0, MAKSIMAL_RIWAYAT);

  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(hasil));
}

export async function hapusRiwayatPencarian(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI_RIWAYAT);
}
