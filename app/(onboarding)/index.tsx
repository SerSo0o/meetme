import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { createProfile } from "@/lib/auth";

export default function OnboardingScreen() {
  const { session, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!session?.user.id) {
      setError("Session expired. Please sign in again.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createProfile(session.user.id, displayName.trim(), bio.trim());
      await refreshProfile();
    } catch (e: any) {
      setError(e.message ?? "Failed to create profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-8 bg-white">
        <Text className="text-3xl font-bold text-slate-800 text-center mb-2">
          Welcome!
        </Text>
        <Text className="text-base text-slate-500 text-center mb-10">
          Tell us a bit about yourself
        </Text>

        {error ? (
          <Text className="text-sm text-red-500 text-center mb-4">
            {error}
          </Text>
        ) : null}

        <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">
          Display Name
        </Text>
        <TextInput
          className="h-12 border border-slate-300 rounded-xl px-4 mb-4 text-base text-slate-800"
          placeholder="How should people see you?"
          placeholderTextColor="#94a3b8"
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={50}
        />

        <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">
          Bio (optional)
        </Text>
        <TextInput
          className="h-24 border border-slate-300 rounded-xl px-4 py-3 mb-6 text-base text-slate-800"
          placeholder="A few words about you..."
          placeholderTextColor="#94a3b8"
          value={bio}
          onChangeText={setBio}
          multiline
          textAlignVertical="top"
          maxLength={200}
        />

        <TouchableOpacity
          className="h-12 bg-indigo-500 rounded-xl items-center justify-center"
          onPress={handleComplete}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Get Started
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
