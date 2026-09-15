// src/components/IndikatorAQI.tsx

import { View, Text } from "react-native";
import { LaporanUdara } from "../types/cuaca";

interface IndikatorAQIProps {
  data: LaporanUdara;
}

export default function IndikatorAQI({ data }: IndikatorAQIProps) {
  let warna = "green";

  if (data.tingkat === "SEDANG") {
    warna = "orange";
  } else if (data.tingkat === "TIDAK_SEHAT") {
    warna = "red";
  } else if (data.tingkat === "BERBAHAYA") {
    warna = "darkred";
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        {data.kota}
      </Text>

      <Text style={{ fontSize: 24 }}>
        AQI: {data.indeksAQI}
      </Text>

      <Text style={{ color: warna, fontWeight: "bold" }}>
        Kualitas Udara: {data.tingkat}
      </Text>

      {data.diperbaruiPada && (
        <Text>Diperbarui: {data.diperbaruiPada}</Text>
      )}
    </View>
  );
}