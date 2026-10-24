// app/_layout.tsx (root layout)
import { Stack } from "expo-router";
// TAMBAHAN UTS
import { TemaProvider, useAppTheme } from "../hooks/use-app-theme";

// Dipisah supaya bisa memakai useAppTheme (harus di dalam TemaProvider)
function TumpukanHalaman() {
  const { warna } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: warna.background },
        headerStyle: { backgroundColor: warna.background },
        headerTintColor: warna.text,
        headerTitleStyle: { color: warna.text },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />
      <Stack.Screen
        name="tambah-favorit"
        options={{ presentation: "modal", title: "Tambah Favorit" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <TemaProvider>
      <TumpukanHalaman />
    </TemaProvider>
  );
}