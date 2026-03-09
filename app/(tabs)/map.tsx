import { View, Text } from "react-native";

export default function MapScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-semibold text-slate-800">Map</Text>
      <Text className="mt-2 text-sm text-slate-500">
        See who's around on the map
      </Text>
    </View>
  );
}
