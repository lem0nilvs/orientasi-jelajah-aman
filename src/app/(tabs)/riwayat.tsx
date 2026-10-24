// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ambilSemuaFavorit,
  hapusFavorit,
} from "../../services/favoritStorage";
import { KotaFavorit } from "../../types/favorit";
import {
  ambilRiwayatPencarian,
  hapusRiwayatPencarian,
  ItemRiwayatPencarian,
} from "../../services/riwayatPencarian";
// TAMBAHAN UTS: untuk tombol Hapus Cache
import {
  buatKunci,
  daftarKunciCache,
  hapusCacheKota,
} from "../../services/cacheRepository";
import { tampilkanKonfirmasi } from "../../utils/konfirmasi";
// TAMBAHAN UTS: tema
import { useAppTheme } from "../../hooks/use-app-theme";

export default function TabRiwayat() {
  const { warna, temaAktif } = useAppTheme();
  const warnaBahaya = temaAktif === "dark" ? "#F87171" : "#DC2626";

  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [riwayat, setRiwayat] = useState<ItemRiwayatPencarian[]>([]);
  const [kunciCache, setKunciCache] = useState<Set<string>>(new Set());
  const [pesan, setPesan] = useState<string | null>(null);

  const muatData = useCallback(async () => {
    setPesan(null);
    const [favorit, pencarian] = await Promise.all([
      ambilSemuaFavorit(),
      ambilRiwayatPencarian(),
    ]);
    setDaftarFavorit(favorit);
    setRiwayat(pencarian);

    try {
      setKunciCache(await daftarKunciCache());
    } catch {
      setKunciCache(new Set());
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
  );

  // Buka Beranda dan langsung cari kota yang dipilih
  function bukaKota(kota: {
    id: number;
    nama: string;
    latitude: number;
    longitude: number;
    country?: string;
  }) {
    router.navigate({
      pathname: "/(tabs)",
      params: {
        riwayatId: String(kota.id),
        nama: kota.nama,
        latitude: String(kota.latitude),
        longitude: String(kota.longitude),
        country: kota.country ?? "",
        t: String(Date.now()), // supaya kota yang sama bisa dicari berulang
      },
    });
  }

  // TAMBAHAN UTS: hapus cache 1 kota (data kota lain tidak disentuh)
  function konfirmasiHapusCache(kota: {
    nama: string;
    latitude: number;
    longitude: number;
  }) {
    tampilkanKonfirmasi({
      judul: `Hapus cache ${kota.nama}?`,
      pesan: "Data cuaca kota ini akan dihapus dari perangkat dan tidak bisa dibuka offline.",
      labelYa: "Hapus Cache",
      onYa: async () => {
        await hapusCacheKota(kota.latitude, kota.longitude);
        setKunciCache(await daftarKunciCache());
        setPesan(`Cache ${kota.nama} sudah dihapus.`);
      },
    });
  }

  function konfirmasiHapusRiwayat() {
    tampilkanKonfirmasi({
      judul: "Hapus riwayat pencarian?",
      pesan: "Semua riwayat pencarian akan dihapus. Kota favorit tetap tersimpan.",
      onYa: async () => {
        await hapusRiwayatPencarian();
        setRiwayat([]);
      },
    });
  }

  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    tampilkanKonfirmasi({
      judul: `Yakin hapus ${kota.nama}?`,
      onYa: async () => {
        await hapusFavorit(kota.id);
        setDaftarFavorit((prev) => prev.filter((k) => k.id !== kota.id));
      },
    });
  }

  const gayaJudul = {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: warna.text,
  };

  const gayaBaris = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: warna.border,
    backgroundColor: warna.card,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* ---------- Riwayat pencarian ---------- */}
        <Text style={gayaJudul}>Riwayat Pencarian</Text>
        <Text style={{ color: warna.secondaryText }}>
          {riwayat.length} dari 10 pencarian terakhir
        </Text>

        {pesan && (
          <Text accessibilityLabel={pesan} style={{ color: warna.primary }}>
            {pesan}
          </Text>
        )}

        {riwayat.length === 0 && (
          <Text style={{ color: warna.text }}>Belum ada riwayat pencarian.</Text>
        )}

        {riwayat.map((kota, index) => {
          const adaCache = kunciCache.has(
            buatKunci(kota.latitude, kota.longitude)
          );
          return (
            <View
              key={`${kota.id}-${kota.latitude}-${kota.longitude}-${index}`}
              style={gayaBaris}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", color: warna.text }}>
                  {kota.nama}
                </Text>
                {!!kota.country && (
                  <Text style={{ color: warna.secondaryText }}>
                    {kota.country}
                  </Text>
                )}
                <Text style={{ color: warna.secondaryText, fontSize: 12 }}>
                  {adaCache ? "Tersimpan di perangkat" : "Belum ada cache"}
                </Text>
              </View>

              <View style={{ gap: 6 }}>
                <Button title="Cari Lagi" onPress={() => bukaKota(kota)} />
                {/* TAMBAHAN UTS: tombol hapus cache per item riwayat */}
                {adaCache && (
                  <Button
                    title="Hapus Cache"
                    color={warnaBahaya}
                    onPress={() => konfirmasiHapusCache(kota)}
                  />
                )}
              </View>
            </View>
          );
        })}

        {riwayat.length > 0 && (
          <Button title="Hapus Semua Riwayat" onPress={konfirmasiHapusRiwayat} />
        )}

        <View
          style={{
            height: 1,
            backgroundColor: warna.border,
            marginVertical: 12,
          }}
        />

        {/* ---------- Kota favorit ---------- */}
        <Text style={gayaJudul}>Kota Favorit</Text>
        <Text style={{ color: warna.secondaryText }}>
          Tersimpan {daftarFavorit.length} kota
        </Text>

        {daftarFavorit.length === 0 && (
          <Text style={{ color: warna.text }}>Belum ada kota favorit.</Text>
        )}

        {daftarFavorit.map((kota) => {
          const adaCache = kunciCache.has(
            buatKunci(kota.latitude, kota.longitude)
          );
          return (
            <View key={kota.id} style={gayaBaris}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", color: warna.text }}>
                  {kota.nama}
                </Text>
                <Text style={{ color: warna.secondaryText, fontSize: 12 }}>
                  {adaCache ? "Tersimpan di perangkat" : "Belum ada cache"}
                </Text>
              </View>

              <View style={{ gap: 6 }}>
                <Button title="Cari" onPress={() => bukaKota(kota)} />
                {/* TAMBAHAN UTS: tombol hapus cache per item favorit */}
                {adaCache && (
                  <Button
                    title="Hapus Cache"
                    color={warnaBahaya}
                    onPress={() => konfirmasiHapusCache(kota)}
                  />
                )}
                <Button
                  title="Hapus"
                  onPress={() => konfirmasiHapusFavorit(kota)}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}