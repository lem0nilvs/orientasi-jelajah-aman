
import type { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/use-app-theme";

type NamaIkon = React.ComponentProps<typeof Ionicons>["name"];

// Ikon tiap tab: versi terisi saat tab aktif, versi garis saat tidak aktif.
function ikonTab(aktif: NamaIkon, nonaktif: NamaIkon) {
  return function IkonTab({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) {
    return (
      <Ionicons
        name={focused ? aktif : nonaktif}
        size={size}
        color={color}
      />
    );
  };
}

export default function TabLayout() {
  // TAMBAHAN UTS: baca tema di dalam komponen
  const { temaAktif, warna } = useAppTheme();

  const warnaLatar = warna.background;
  const warnaTeks = warna.text;
  const warnaTidakAktif = warna.secondaryText;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        // TAMBAHAN UTS: warna header mengikuti tema
        headerStyle: {
          backgroundColor: warnaLatar,
        },
        headerTintColor: warnaTeks,
        headerTitleStyle: {
          color: warnaTeks,
        },

        // TAMBAHAN UTS: warna tab bawah mengikuti tema
        tabBarStyle: {
          backgroundColor: warnaLatar,
          borderTopColor: temaAktif === "dark" ? "#333333" : "#DDDDDD",
        },
        tabBarActiveTintColor: "#1976D2",
        tabBarInactiveTintColor: warnaTidakAktif,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ikonTab("home", "home-outline"),
        }}
      />

      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat & Favorit",
          tabBarLabel: "Riwayat",
          tabBarIcon: ikonTab("time", "time-outline"),
        }}
      />

      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarIcon: ikonTab("settings", "settings-outline"),
        }}
      />

      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang",
          tabBarIcon: ikonTab(
            "information-circle",
            "information-circle-outline"
          ),
        }}
      />
    </Tabs>
  );
}
