import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NearbyUser } from "@/lib/discovery";
import { distanceLabel } from "@/utils/distance";
import { colors } from "@/constants/theme";
import type { UserStatus } from "@/types/profile";

const CARD_WIDTH = (Dimensions.get("window").width - 48 - 12) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const STATUS_COLORS: Record<string, string> = {
  green: colors.statusGreen,
  yellow: colors.statusYellow,
  red: colors.statusRed,
};

type DiscoveryCardProps = {
  user: NearbyUser;
  onPress: () => void;
};

export function DiscoveryCard({ user, onPress }: DiscoveryCardProps) {
  const hasAvatar = !!user.avatar_url;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      className="rounded-2xl overflow-hidden bg-slate-100"
    >
      {hasAvatar ? (
        <Image
          source={{ uri: user.avatar_url! }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="absolute inset-0 w-full h-full bg-indigo-100 items-center justify-center">
          <Text className="text-4xl font-bold text-indigo-300">
            {user.display_name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
      )}

      {/* Gradient overlay at bottom */}
      <View className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-10 bg-black/40">
        <View className="flex-row items-center gap-1.5">
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[user.status] ?? colors.statusRed }}
          />
          <Text className="text-white text-sm font-semibold" numberOfLines={1}>
            {user.display_name}
            {user.age ? `, ${user.age}` : ""}
          </Text>
        </View>
        <View className="flex-row items-center mt-1 gap-1">
          <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.7)" />
          <Text className="text-white/70 text-xs">
            {distanceLabel(user.distance_meters)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
