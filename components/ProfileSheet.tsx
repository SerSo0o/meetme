import { View, Text, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NearbyUser } from "@/lib/discovery";
import { distanceLabel } from "@/utils/distance";
import { colors } from "@/constants/theme";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  green: { label: "Open to meet", color: colors.statusGreen },
  yellow: { label: "Busy but open", color: colors.statusYellow },
  red: { label: "Unavailable", color: colors.statusRed },
};

type ProfileSheetProps = {
  user: NearbyUser;
};

export function ProfileSheet({ user }: ProfileSheetProps) {
  const hasAvatar = !!user.avatar_url;
  const statusInfo = STATUS_LABELS[user.status] ?? STATUS_LABELS.red;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Avatar */}
      {hasAvatar ? (
        <Image
          source={{ uri: user.avatar_url! }}
          className="w-full h-72"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-72 bg-indigo-100 items-center justify-center">
          <Text className="text-6xl font-bold text-indigo-300">
            {user.display_name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
      )}

      <View className="px-5 pt-5">
        {/* Name + Age */}
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-bold text-slate-800">
            {user.display_name}
          </Text>
          {user.age ? (
            <Text className="text-lg text-slate-400">{user.age}</Text>
          ) : null}
        </View>

        {/* Status + Distance */}
        <View className="flex-row items-center gap-4 mt-2">
          <View className="flex-row items-center gap-1.5">
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusInfo.color }}
            />
            <Text className="text-sm text-slate-500">{statusInfo.label}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={14} color="#94a3b8" />
            <Text className="text-sm text-slate-500">
              {distanceLabel(user.distance_meters)}
            </Text>
          </View>
        </View>

        {/* Gender */}
        {user.gender ? (
          <View className="flex-row items-center gap-1.5 mt-2">
            <Ionicons name="person-outline" size={14} color="#94a3b8" />
            <Text className="text-sm text-slate-500 capitalize">
              {user.gender}
            </Text>
          </View>
        ) : null}

        {/* Bio */}
        {user.bio ? (
          <View className="mt-4">
            <Text className="text-sm font-medium text-slate-600 mb-1">About</Text>
            <Text className="text-base text-slate-700 leading-6">
              {user.bio}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
