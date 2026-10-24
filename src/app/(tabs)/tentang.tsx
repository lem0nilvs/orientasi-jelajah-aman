// src/app/(tabs)/tentang.tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { typeScale, spacing } from "../../constants/styles";
// TAMBAHAN UTS
import { useAppTheme } from "../../hooks/use-app-theme";

export default function TabTentang() {
  const { warna } = useAppTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: spacing.besar,
        backgroundColor: warna.background,
      }}
    >
      <Text
        accessibilityLabel="Judul Halaman Tentang Aplikasi Jelajah Aman"
        style={{
          fontSize: typeScale.judul,
          fontWeight: "bold",
          marginBottom: spacing.sedang,
          color: warna.text,
        }}
      >
        Jelajah Aman
      </Text>

      <Text
        style={{
          fontSize: typeScale.isi,
          color: warna.secondaryText,
          marginBottom: spacing.sedang,
        }}
      >
        Panduan Informasi Cuaca untuk Perjalanan Aman
      </Text>

      <Text
        style={{
          fontSize: typeScale.subjudul,
          marginBottom: spacing.kecil,
          color: warna.text,
        }}
      >
        Versi 1.0.0
      </Text>

      <Text style={{ fontSize: typeScale.isi, color: warna.text }}>
        Dibuat oleh: Lem0nilvs {"\n"}
        © 2025 orientasi jelajah aman. Semua hak dilindungi.
      </Text>
    </SafeAreaView>
  );
}