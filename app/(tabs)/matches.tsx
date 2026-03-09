import { View, Text } from "react-native";

export default function MatchesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-semibold text-slate-800">Matches</Text>
      <Text className="mt-2 text-sm text-slate-500">
        Your matches and conversations
      </Text>
    </View>
  );
}
