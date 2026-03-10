import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "@/lib/auth";
import { updateStatus } from "@/lib/profile";
import { StatusToggle } from "@/components/StatusToggle";
import type { UserStatus } from "@/types/profile";
import { colors } from "@/constants/theme";

const STATUS_COLORS: Record<UserStatus, string> = {
  green: colors.statusGreen,
  yellow: colors.statusYellow,
  red: colors.statusRed,
};

export default function ProfileScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  async function handleStatusChange(status: UserStatus) {
    if (!profile) return;
    setStatusSaving(true);
    try {
      await updateStatus(profile.id, status);
      await refreshProfile();
    } catch (e: any) {
      const msg = e.message || "Failed to update status.";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  }

  const currentStatus = profile?.status ?? "red";

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 48 }}>
      {/* Avatar + Info */}
      <View className="items-center mb-6">
        <View className="relative mb-4">
          <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center">
            <Text className="text-2xl font-bold text-indigo-500">
              {profile?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white"
            style={{ backgroundColor: STATUS_COLORS[currentStatus] }}
          />
        </View>
        <Text className="text-xl font-semibold text-slate-800">
          {profile?.display_name ?? "Unknown"}
        </Text>
        {profile?.bio ? (
          <Text className="text-sm text-slate-500 mt-1 text-center px-8">
            {profile.bio}
          </Text>
        ) : null}
        {profile?.age ? (
          <Text className="text-xs text-slate-400 mt-1">
            {profile.age} years old
            {profile.gender ? ` · ${profile.gender}` : ""}
          </Text>
        ) : null}
        <Text className="text-xs text-slate-400 mt-1">
          {session?.user.email}
        </Text>
      </View>

      {/* Status Toggle */}
      <Text className="text-sm font-medium text-slate-600 mb-2">Your Status</Text>
      <StatusToggle
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={statusSaving}
      />

      {/* Actions */}
      <View className="mt-8 gap-3">
        <ProfileAction
          icon="create-outline"
          label="Edit Profile"
          onPress={() => router.push("/(tabs)/edit-profile")}
        />
        <ProfileAction
          icon="shield-checkmark-outline"
          label="Privacy Settings"
          onPress={() => router.push("/(tabs)/privacy-settings")}
        />
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        className="h-12 border border-red-300 rounded-xl items-center justify-center mt-8"
        onPress={handleSignOut}
        disabled={signingOut}
        activeOpacity={0.8}
      >
        {signingOut ? (
          <ActivityIndicator color="#ef4444" />
        ) : (
          <Text className="text-red-500 text-base font-semibold">
            Sign Out
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function ProfileAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center h-14 px-4 rounded-xl border border-slate-200"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={20} color="#64748b" />
      <Text className="flex-1 text-base text-slate-700 ml-3">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </TouchableOpacity>
  );
}
