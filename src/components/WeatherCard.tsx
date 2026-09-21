// components/WeatherCard.tsx
import { Text, View } from "react-native";
import { WeatherCardProps } from "../types/cuaca";
import { typeScale, spacing } from "../constants/styles";

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
}: WeatherCardProps) {
  const warnaAQI = tingkatAQI === "BAIK" ? "green" : "orange";
  return (
    <View accessible 
    accessibilityLabel={`Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`} 
    style={{ padding: spacing.sedang, borderRadius: 8, backgroundColor: "#f4f7fa" }}>
      <Text style={{ fontWeight: "bold", fontSize: typeScale.judul }}>{kota}</Text>
      <Text style={{ fontSize: typeScale.isi }}>{suhu}°C</Text>
      <Text style={{ color: warnaAQI, fontSize: typeScale.isi }}>AQI: {tingkatAQI}</Text>
    </View>
  );
}
