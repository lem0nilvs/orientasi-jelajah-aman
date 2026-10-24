
 // src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Text, Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hapusSemuaCache } from "../../services/cacheRepository";

// TAMBAHAN UTS
import {
  useAppTheme,
  PilihanTema,
} from "../../hooks/use-app-theme";

export default function TabPengaturan() {
  const [pesan, setPesan] = useState<string | null>(null);

  // TAMBAHAN UTS: mengambil pengaturan tema aplikasi
  const { pilihanTema, temaAktif, ubahTema, warna: tema } = useAppTheme();

  // TAMBAHAN UTS: warna mengikuti tema yang dipilih
  const warna = {
    latar: tema.background,
    teks: tema.text,
    kartu: tema.card,
  };

  // TAMBAHAN UTS: pilihan tema
  const opsiTema: { label: string; nilai: PilihanTema }[] = [
    { label: "Terang", nilai: "light" },
    { label: "Gelap", nilai: "dark" },
    { label: "Ikuti Sistem", nilai: "system" },
  ];

  async function hapusDataTersimpan() {
    try {
      await hapusSemuaCache();
      setPesan("Data cuaca tersimpan sudah dihapus.");
    } catch {
      setPesan("Gagal menghapus data cuaca tersimpan.");
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        gap: 12,
        backgroundColor: warna.latar,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: warna.teks,
        }}
      >
        Jelajah Aman
      </Text>

      <Text style={{ color: warna.teks }}>
        Versi 1.0.0
      </Text>

      {/* TAMBAHAN UTS: bagian pengaturan tema */}
      <View
        style={{
          padding: 12,
          gap: 10,
          borderRadius: 8,
          backgroundColor: warna.kartu,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: warna.teks,
          }}
        >
          Tema Aplikasi
        </Text>

        <Text style={{ color: warna.teks }}>
          Pilih tampilan aplikasi yang kamu inginkan.
        </Text>

                {/* Tiga tombol tema sejajar dalam satu baris */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {opsiTema.map((opsi) => {
            const dipilih = pilihanTema === opsi.nilai;
            return (
              <View key={opsi.nilai} style={{ flex: 1 }}>
                <Button
                  title={dipilih ? `✓ ${opsi.label}` : opsi.label}
                  color={dipilih ? "#2563EB" : "#6B7280"}
                  onPress={() => {
                    ubahTema(opsi.nilai)
                      .then(() => setPesan(`Tema diubah menjadi ${opsi.label}.`))
                      .catch(() => setPesan("Gagal menyimpan pilihan tema."));
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* Fitur lama tetap dipertahankan */}
      <Button
        title="Hapus Data Cuaca Tersimpan"
        onPress={hapusDataTersimpan}
      />

      {pesan && (
        <Text
          accessibilityLabel={pesan}
          style={{ color: warna.teks }}
        >
          {pesan}
        </Text>
      )}
    </SafeAreaView>
  );
}
