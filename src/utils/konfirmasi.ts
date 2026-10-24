// src/utils/konfirmasi.ts
import { Alert, Platform } from "react-native";

interface OpsiKonfirmasi {
  judul: string;
  pesan?: string;
  labelYa?: string;
  onYa: () => void;
}

// Alert.alert tidak jalan di web, jadi di web dipakai window.confirm.
export function tampilkanKonfirmasi({
  judul,
  pesan,
  labelYa = "Hapus",
  onYa,
}: OpsiKonfirmasi) {
  if (Platform.OS === "web") {
    const teks = pesan ? judul + "\n\n" + pesan : judul;
    if (window.confirm(teks)) onYa();
    return;
  }

  Alert.alert(judul, pesan, [
    { text: "Batal", style: "cancel" },
    { text: labelYa, style: "destructive", onPress: onYa },
  ]);
}