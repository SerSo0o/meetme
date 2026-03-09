import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "@/lib/auth";

export default function ProfileScreen() {
  const { session, profile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center mb-4">
          <Text className="text-2xl font-bold text-indigo-500">
            {profile?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text className="text-xl font-semibold text-slate-800">
          {profile?.display_name ?? "Unknown"}
        </Text>
        {profile?.bio ? (
          <Text className="text-sm text-slate-500 mt-1 text-center px-8">
            {profile.bio}
          </Text>
        ) : null}
        <Text className="text-xs text-slate-400 mt-2">
          {session?.user.email}
        </Text>
      </View>

      <TouchableOpacity
        className="h-12 border border-red-300 rounded-xl items-center justify-center"
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
    </View>
  );
}
