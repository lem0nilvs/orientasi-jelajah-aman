// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../types/favorit";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import {
  mintaIzinLokasi,
  ambilKoordinatSaatIni,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { simpanRiwayatPencarian } from "../../services/riwayatPencarian";
// TAMBAHAN UTS
import { useAppTheme } from "../../hooks/use-app-theme";
import { tampilkanKonfirmasi } from "../../utils/konfirmasi";

export default function HalamanUtama() {
  // TAMBAHAN UTS: warna ikut tema
  const { warna, temaAktif } = useAppTheme();
  const warnaBahaya = temaAktif === "dark" ? "#F87171" : "#B91C1C";

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [pesanInfo, setPesanInfo] = useState<string | null>(null); // TAMBAHAN UTS
    // Daftar favorit, dimuat ulang setiap Beranda tampil lagi (misal setelah modal ditutup)
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit()
        .then(setDaftarFavorit)
        .catch(() => {});
    }, [])
  );

  // Kota yang sedang tampil sudah ada di favorit atau belum
  const sudahFavorit =
    !!kotaTerpilih &&
    daftarFavorit.some(
      (f) =>
        (kotaTerpilih.id !== -1 && f.id === kotaTerpilih.id) ||
        (f.latitude.toFixed(2) === kotaTerpilih.latitude.toFixed(2) &&
          f.longitude.toFixed(2) === kotaTerpilih.longitude.toFixed(2))
    );

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  // Menerima permintaan pencarian ulang dari tab Riwayat
  const params = useLocalSearchParams<{
    riwayatId?: string;
    nama?: string;
    latitude?: string;
    longitude?: string;
    country?: string;
    t?: string;
  }>();

  useEffect(() => {
    if (!params.riwayatId || !params.nama) return;

    const latitude = Number(params.latitude);
    const longitude = Number(params.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    pilihKota({
      id: Number(params.riwayatId),
      name: params.nama,
      latitude,
      longitude,
      country: params.country ?? "",
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.riwayatId, params.t]);

  // TAMBAHAN UTS: hapus cache 1 kota dengan konfirmasi (jalan di web & HP)
  function konfirmasiHapusCache(kota: RingkasanKotaTersimpan) {
    tampilkanKonfirmasi({
      judul: "Hapus cache kota?",
      pesan: `Cache cuaca untuk ${kota.nama} akan dihapus dari perangkat ini.`,
      labelYa: "Hapus Cache",
      onYa: async () => {
        try {
          await hapusCacheKota(kota.latitude, kota.longitude);
          await muatKotaTersimpan();

          if (
            kotaTerpilih &&
            kotaTerpilih.latitude.toFixed(2) === kota.latitude.toFixed(2) &&
            kotaTerpilih.longitude.toFixed(2) === kota.longitude.toFixed(2)
          ) {
            setHasil(null);
          }
          setPesanInfo(`Cache ${kota.nama} telah dihapus.`);
        } catch {
          setPesanInfo("Cache kota tidak berhasil dihapus.");
        }
      },
    });
  }

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    setPesanInfo(null);

    // Riwayat hanya dicatat saat kota benar-benar dipilih
    if (kota.id !== -1) {
      try {
        await simpanRiwayatPencarian(kota);
      } catch (error) {
        console.error("Gagal menyimpan riwayat pencarian:", error);
      }
    }

    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui }
      );

      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan

      setHasil(data);
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;

      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }

    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  return (
    <SafeAreaView
      style={{ flex: 1, padding: 16, backgroundColor: warna.background }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} />

        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
        {pesanLokasi && (
          <Text accessibilityLabel={pesanLokasi} style={{ color: warna.text }}>
            {pesanLokasi}
          </Text>
        )}

        {/* Hasil pencarian: teks sekarang ikut tema */}
        {hasilPencarian.map((kota) => (
          <TouchableOpacity
            key={kota.id}
            onPress={() => pilihKota(kota)}
            style={{ paddingVertical: 6 }}
          >
            <Text style={{ color: warna.text }}>
              {kota.name}
              {kota.admin1 ? `, ${kota.admin1}` : ""}
              {kota.country ? `, ${kota.country}` : ""}
            </Text>
          </TouchableOpacity>
        ))}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={{ color: warna.text, fontWeight: "bold" }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>

            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                {/* Nama kota: tekan untuk membuka cuaca */}
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 8 }}
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                >
                  <Text style={{ color: warna.text }}>{k.nama}</Text>
                </TouchableOpacity>

                {/* Hapus cache kota ini saja */}
                <Button
                  title="Hapus cache"
                  color={warnaBahaya}
                  onPress={() => konfirmasiHapusCache(k)}
                />
              </View>
            ))}
          </View>
        )}

        {pesanInfo && (
          <Text accessibilityLabel={pesanInfo} style={{ color: warna.primary }}>
            {pesanInfo}
          </Text>
        )}

        {sedangMemuat && <ActivityIndicator />}

        {pesanError && (
          <View style={{ gap: 8 }}>
            <Text accessibilityLabel={pesanError} style={{ color: warnaBahaya }}>
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            />
            <Text style={{ fontSize: 12, color: warna.secondaryText }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <Button
              title="Perbarui Sekarang"
              onPress={() => pilihKota(kotaTerpilih, true)}
            />
            {sudahFavorit ? (
              <Button title="Sudah di Favorit" disabled onPress={() => {}} />
            ) : (
              <Button
                title="Tambahkan ke Favorit"
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
              />
            )}
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}