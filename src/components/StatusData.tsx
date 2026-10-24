// src/components/StatusData.tsx
import { View, Text } from "react-native";
import { SumberData } from "../types/cache";
//tambahan uts
import { useAppTheme } from "../hooks/use-app-theme";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}

function formatUmur(disimpanPada: number): string {
  const menit = Math.floor((Date.now() - disimpanPada) / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return menit + " menit lalu";
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + " jam lalu";
  return Math.floor(jam / 24) + " hari lalu";
}

function labelSumber(sumber: SumberData): string {
  if (sumber === "jaringan") return "Data terbaru dari internet";
  if (sumber === "cache-segar") return "Data tersimpan (masih segar)";
  return "Mode offline - data tersimpan mungkin sudah usang";
}

export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
  const { warna, temaAktif } = useAppTheme();
  const gelap = temaAktif === "dark";

  const basi = sumber === "cache-basi";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);

  const warnaLatar = basi
    ? gelap ? "#422006" : "#FEF3E2"
    : gelap ? "#064E3B" : "#EAFBF6";
  const warnaLabel = basi
    ? gelap ? "#FBBF24" : "#B45309"
    : gelap ? "#6EE7B7" : "#13795F";

  return (
    <View
      accessible
      accessibilityLabel={label + ", diperbarui " + umur}
      style={{ padding: 8, borderRadius: 8, backgroundColor: warnaLatar }}
    >
      <Text style={{ fontSize: 12, color: warnaLabel }}>{label}</Text>
      <Text style={{ fontSize: 11, color: warna.secondaryText }}>
        Diperbarui {umur}
      </Text>
    </View>
  );
}