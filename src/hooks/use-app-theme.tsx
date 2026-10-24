
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type PilihanTema = "light" | "dark" | "system";

type WarnaTema = {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  primary: string;
};

type TemaContextType = {
  pilihanTema: PilihanTema;
  temaAktif: "light" | "dark";
  warna: WarnaTema;
  ubahTema: (tema: PilihanTema) => Promise<void>;
};

const KUNCI_TEMA = "@jelajah_aman:tema";

const WARNA = {
  light: {
    background: "#FFFFFF",
    card: "#F4F7FA",
    text: "#172033",
    secondaryText: "#64748B",
    border: "#D8DEE8",
    primary: "#2563EB",
  },
  dark: {
    background: "#111827",
    card: "#1F2937",
    text: "#F9FAFB",
    secondaryText: "#CBD5E1",
    border: "#374151",
    primary: "#60A5FA",
  },
} as const;

const TemaContext = createContext<TemaContextType | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const skemaSistem = useColorScheme();
  const [pilihanTema, setPilihanTema] = useState<PilihanTema>("system");
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KUNCI_TEMA)
      .then((value) => {
        if (value === "light" || value === "dark" || value === "system") {
          setPilihanTema(value);
        }
      })
      .catch((error) => {
        console.error("Gagal membaca pilihan tema:", error);
      })
      .finally(() => setSiap(true));
  }, []);

  const ubahTema = useCallback(async (tema: PilihanTema) => {
    setPilihanTema(tema);
    await AsyncStorage.setItem(KUNCI_TEMA, tema);
  }, []);

  const temaAktif: "light" | "dark" =
    pilihanTema === "system"
      ? skemaSistem === "dark"
        ? "dark"
        : "light"
      : pilihanTema;

  const value = useMemo(
    () => ({
      pilihanTema,
      temaAktif,
      warna: WARNA[temaAktif],
      ubahTema,
    }),
    [pilihanTema, temaAktif, ubahTema]
  );

  // Preferensi dimuat sebelum layar utama ditampilkan.
  if (!siap) return null;

  return <TemaContext.Provider value={value}>{children}</TemaContext.Provider>;
}

export function useAppTheme(): TemaContextType {
  const context = useContext(TemaContext);

  if (!context) {
    throw new Error("useAppTheme harus digunakan di dalam TemaProvider.");
  }

  return context;
}
