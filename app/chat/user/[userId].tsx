import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { colors } from "@/constants/theme";

type UserProfile = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  status: string;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  green: { label: "Open to meet", color: colors.statusGreen },
  yellow: { label: "Busy but open", color: colors.statusYellow },
  red: { label: "Unavailable", color: colors.statusRed },
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (e) {
        console.warn("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Ionicons name="person-outline" size={48} color="#94a3b8" />
        <Text className="text-slate-500 mt-3">Profile not found</Text>
      </View>
    );
  }

  const hasAvatar = !!profile.avatar_url;
  const statusInfo = STATUS_LABELS[profile.status] ?? STATUS_LABELS.red;

  return (
    <>
      <Stack.Screen
        options={{
          title: profile.display_name ?? "Profile",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="mr-4 flex-row items-center"
            >
              <Ionicons name="chevron-back" size={28} color="#6366f1" />
              <Text className="text-indigo-500 text-base">Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        {hasAvatar ? (
          <Image
            source={{ uri: profile.avatar_url! }}
            style={{ width: "100%", height: 320 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-full bg-indigo-50 items-center justify-center"
            style={{ height: 320 }}
          >
            <Text className="text-7xl font-bold text-indigo-200">
              {profile.display_name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}

        <View className="px-5 pt-5">
          {/* Name + Age */}
          <View className="flex-row items-baseline gap-3">
            <Text className="text-3xl font-bold text-slate-800">
              {profile.display_name}
            </Text>
            {profile.age ? (
              <Text className="text-xl text-slate-400">{profile.age}</Text>
            ) : null}
          </View>

          {/* Status + Gender chips */}
          <View className="flex-row flex-wrap items-center gap-2.5 mt-3">
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full"
              style={{ backgroundColor: statusInfo.color + "18" }}
            >
              <View
                className="w-2.5 h-2.5 rounded-full mr-2"
                style={{ backgroundColor: statusInfo.color }}
              />
              <Text
                className="text-sm font-medium"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </Text>
            </View>

            {profile.gender ? (
              <View className="flex-row items-center px-3 py-1.5 rounded-full bg-slate-100">
                <Ionicons name="person-outline" size={14} color="#64748b" />
                <Text className="text-sm text-slate-600 capitalize ml-1.5">
                  {profile.gender}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Bio */}
          {profile.bio ? (
            <View className="mt-5">
              <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                About
              </Text>
              <Text className="text-base text-slate-700 leading-6">
                {profile.bio}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
