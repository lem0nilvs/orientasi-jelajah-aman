 // src/components/SearchBox.tsx
import { useState } from "react";
import { View, TextInput } from "react-native";
import { useAppTheme } from "../hooks/use-app-theme";

interface SearchBoxProps {
  onCari: (teks: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [teks, setTeks] = useState("");

  // TAMBAHAN UTS: warna kolom pencarian mengikuti tema
  const { temaAktif } = useAppTheme();

  const warnaInput = temaAktif === "dark" ? "#252525" : "#FFFFFF";
  const warnaTeks = temaAktif === "dark" ? "#FFFFFF" : "#222222";
  const warnaPlaceholder = temaAktif === "dark" ? "#BBBBBB" : "#777777";
  const warnaBorder = temaAktif === "dark" ? "#888888" : "#CCCCCC";

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru); // Debounce tetap diatur oleh komponen pemanggil.
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={warnaPlaceholder}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          borderWidth: 1,
          padding: 8,
          borderRadius: 8,
          backgroundColor: warnaInput,
          color: warnaTeks,
          borderColor: warnaBorder,
        }}
      />
    </View>
  );
}
