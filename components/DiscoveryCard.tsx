import { useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { NearbyUser } from "@/lib/discovery";
import { createLike } from "@/lib/likes";
import { distanceLabel } from "@/utils/distance";
import { colors } from "@/constants/theme";

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  green: { label: "Open to meet", color: colors.statusGreen },
  yellow: { label: "Busy but open", color: colors.statusYellow },
  red: { label: "Unavailable", color: colors.statusRed },
};

type DiscoveryCardProps = {
  user: NearbyUser;
  onPress: () => void;
  isLiked?: boolean;
  onLikeChange?: (liked: boolean, matchId?: string) => void;
};

export function DiscoveryCard({ user, onPress, isLiked = false, onLikeChange }: DiscoveryCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [liking, setLiking] = useState(false);
  const hasAvatar = !!user.avatar_url;
  const status = STATUS_INFO[user.status] ?? STATUS_INFO.red;

  async function handleLike() {
    if (liked || liking) return;
    setLiking(true);
    try {
      const result = await createLike(user.user_id);
      setLiked(true);
      onLikeChange?.(true, result.match_id ?? undefined);
      
      if (result.is_mutual && result.match_id) {
        // Navigate to chat on match
        router.push(`/chat/${result.match_id}` as any);
      }
    } catch (e) {
      console.warn("Failed to like:", e);
    } finally {
      setLiking(false);
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="rounded-2xl overflow-hidden bg-white mb-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Photo area */}
      <View className="w-full" style={{ height: 280 }}>
        {hasAvatar ? (
          <Image
            source={{ uri: user.avatar_url! }}
            style={{ width: '100%', height: 280 }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-indigo-50 items-center justify-center">
            <Text className="text-6xl font-bold text-indigo-200">
              {user.display_name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}

        {/* Dark overlay at bottom of photo */}
        <View
          className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-14"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          {/* Name + Age */}
          <Text className="text-2xl font-bold text-white" numberOfLines={1}>
            {user.display_name}
            {user.age ? (
              <Text className="text-xl font-normal text-white/80">
                {`  ${user.age}`}
              </Text>
            ) : null}
          </Text>

          {/* Status pill */}
          <View className="flex-row items-center mt-2">
            <View
              className="flex-row items-center px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <View
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: status.color }}
              />
              <Text className="text-xs font-medium text-white">
                {status.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info section below photo */}
      <View className="px-4 py-3">
        {/* Distance + Gender row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="location-outline" size={15} color="#64748b" />
              <Text className="text-sm font-medium text-slate-500">
                {distanceLabel(user.distance_meters)}
              </Text>
            </View>
            {user.gender ? (
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="person-outline" size={14} color="#64748b" />
                <Text className="text-sm text-slate-500 capitalize">
                  {user.gender}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Like button */}
          <TouchableOpacity
            onPress={handleLike}
            disabled={liked || liking}
            activeOpacity={0.7}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: liked ? "#fee2e2" : "#f1f5f9" }}
          >
            {liking ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={24}
                color={liked ? "#ef4444" : "#64748b"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Bio preview */}
        {user.bio ? (
          <Text
            className="text-sm text-slate-600 mt-2 leading-5"
            numberOfLines={2}
          >
            {user.bio}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
