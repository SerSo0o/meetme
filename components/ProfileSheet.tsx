import { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { NearbyUser } from "@/lib/discovery";
import { createLike } from "@/lib/likes";
import { distanceLabel } from "@/utils/distance";
import { colors } from "@/constants/theme";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  green: { label: "Open to meet", color: colors.statusGreen },
  yellow: { label: "Busy but open", color: colors.statusYellow },
  red: { label: "Unavailable", color: colors.statusRed },
};

type ProfileSheetProps = {
  user: NearbyUser;
  isLiked?: boolean;
  onLikeChange?: (liked: boolean, matchId?: string) => void;
};

export function ProfileSheet({ user, isLiked = false, onLikeChange }: ProfileSheetProps) {
  const [liked, setLiked] = useState(isLiked);
  const [liking, setLiking] = useState(false);
  const hasAvatar = !!user.avatar_url;
  const statusInfo = STATUS_LABELS[user.status] ?? STATUS_LABELS.red;

  async function handleLike() {
    if (liked || liking) return;
    setLiking(true);
    try {
      const result = await createLike(user.user_id);
      setLiked(true);
      onLikeChange?.(true, result.match_id ?? undefined);
      
      if (result.is_mutual && result.match_id) {
        router.push(`/chat/${result.match_id}` as any);
      }
    } catch (e) {
      console.warn("Failed to like:", e);
    } finally {
      setLiking(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      {hasAvatar ? (
        <Image
          source={{ uri: user.avatar_url! }}
          style={{ width: '100%', height: 320 }}
          resizeMode="cover"
        />
      ) : (
        <View className="w-full bg-indigo-50 items-center justify-center" style={{ height: 320 }}>
          <Text className="text-7xl font-bold text-indigo-200">
            {user.display_name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
      )}

      <View className="px-5 pt-5">
        {/* Name + Age */}
        <View className="flex-row items-baseline gap-3">
          <Text className="text-3xl font-bold text-slate-800">
            {user.display_name}
          </Text>
          {user.age ? (
            <Text className="text-xl text-slate-400">{user.age}</Text>
          ) : null}
        </View>

        {/* Status + Distance + Gender chips */}
        <View className="flex-row flex-wrap items-center gap-2.5 mt-3">
          <View
            className="flex-row items-center px-3 py-1.5 rounded-full"
            style={{ backgroundColor: statusInfo.color + "18" }}
          >
            <View
              className="w-2.5 h-2.5 rounded-full mr-2"
              style={{ backgroundColor: statusInfo.color }}
            />
            <Text className="text-sm font-medium" style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </Text>
          </View>

          <View className="flex-row items-center px-3 py-1.5 rounded-full bg-slate-100">
            <Ionicons name="location-outline" size={14} color="#64748b" />
            <Text className="text-sm text-slate-600 ml-1.5">
              {distanceLabel(user.distance_meters)}
            </Text>
          </View>

          {user.gender ? (
            <View className="flex-row items-center px-3 py-1.5 rounded-full bg-slate-100">
              <Ionicons name="person-outline" size={14} color="#64748b" />
              <Text className="text-sm text-slate-600 capitalize ml-1.5">
                {user.gender}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Bio */}
        {user.bio ? (
          <View className="mt-5">
            <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              About
            </Text>
            <Text className="text-base text-slate-700 leading-6">
              {user.bio}
            </Text>
          </View>
        ) : null}

        {/* Like button */}
        <TouchableOpacity
          onPress={handleLike}
          disabled={liked || liking}
          activeOpacity={0.8}
          className="mt-6 h-14 rounded-2xl flex-row items-center justify-center"
          style={{ backgroundColor: liked ? "#fee2e2" : "#6366f1" }}
        >
          {liking ? (
            <ActivityIndicator size="small" color={liked ? "#ef4444" : "#ffffff"} />
          ) : (
            <>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={22}
                color={liked ? "#ef4444" : "#ffffff"}
              />
              <Text
                className="ml-2 text-base font-semibold"
                style={{ color: liked ? "#ef4444" : "#ffffff" }}
              >
                {liked ? "Liked" : "Like"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
