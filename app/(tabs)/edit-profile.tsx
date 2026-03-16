import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  Image,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import { updateProfile, getAllInterests, getProfileInterests, setProfileInterests } from "@/lib/profile";
import { uploadAvatar } from "@/lib/storage";
import { InterestPicker } from "@/components/InterestPicker";
import type { Gender, Interest } from "@/types/profile";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function EditProfileScreen() {
  const { session, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);

  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      console.log("[edit-profile] Loading profile data, avatar_url:", profile.avatar_url);
      setDisplayName(profile.display_name);
      setBio(profile.bio);
      setAge(profile.age?.toString() ?? "");
      setGender(profile.gender);
      setAvatarUri(profile.avatar_url);
    }
    loadInterests();
  }, [profile?.id, profile?.avatar_url]);

  useFocusEffect(
    useCallback(() => {
      // Refresh profile data when screen comes into focus
      if (profile?.id) {
        refreshProfile();
      }
    }, [])
  );

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function loadInterests() {
    try {
      const [all, mine] = await Promise.all([
        getAllInterests(),
        profile?.id ? getProfileInterests(profile.id) : Promise.resolve([]),
      ]);
      setAllInterests(all);
      setSelectedInterestIds(mine.map((i) => i.id));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function toggleInterest(id: string) {
    setSelectedInterestIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    if (!profile) return;
    if (!displayName.trim()) {
      const msg = "Display name is required.";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
      return;
    }
    const parsedAge = age.trim() ? parseInt(age, 10) : null;
    if (parsedAge !== null && (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 120)) {
      const msg = "Age must be between 13 and 120.";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
      return;
    }

    setSaving(true);
    try {
      let newAvatarUrl = profile.avatar_url;
      console.log("[edit-profile] Current avatar_url:", profile.avatar_url);
      console.log("[edit-profile] Selected avatarUri:", avatarUri);
      
      if (avatarUri && avatarUri !== profile.avatar_url) {
        console.log("[edit-profile] Uploading new avatar...");
        newAvatarUrl = await uploadAvatar(session!.user.id, avatarUri);
        console.log("[edit-profile] Upload complete, new URL:", newAvatarUrl);
      }
      
      console.log("[edit-profile] Updating profile with avatar_url:", newAvatarUrl);
      await updateProfile(profile.id, {
        display_name: displayName.trim(),
        bio: bio.trim(),
        age: parsedAge,
        gender,
        avatar_url: newAvatarUrl,
      });
      console.log("[edit-profile] Profile updated, saving interests...");
      await setProfileInterests(profile.id, selectedInterestIds);
      console.log("[edit-profile] Refreshing profile...");
      await refreshProfile();
      console.log("[edit-profile] Profile refreshed, navigating back");
      router.back();
    } catch (e: any) {
      console.error("[edit-profile] Save failed:", e);
      const msg = e.message || "Failed to save.";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
      <Text className="text-2xl font-bold text-slate-800 mb-6">Edit Profile</Text>

      {/* Avatar */}
      <TouchableOpacity
        onPress={pickImage}
        activeOpacity={0.8}
        className="self-center mb-6"
      >
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={{ width: 96, height: 96, borderRadius: 48 }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-indigo-100 items-center justify-center">
            <Text className="text-3xl font-bold text-indigo-300">
              {profile?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
        <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-500 items-center justify-center border-2 border-white">
          <Ionicons name="camera" size={14} color="#ffffff" />
        </View>
      </TouchableOpacity>

      {/* Display Name */}
      <Text className="text-sm font-medium text-slate-600 mb-1">Display Name</Text>
      <TextInput
        className="h-12 border border-slate-200 rounded-xl px-4 text-base text-slate-800 mb-4"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        placeholderTextColor="#94a3b8"
      />

      {/* Bio */}
      <Text className="text-sm font-medium text-slate-600 mb-1">Bio</Text>
      <TextInput
        className="h-24 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
        value={bio}
        onChangeText={setBio}
        placeholder="Tell people about yourself..."
        placeholderTextColor="#94a3b8"
        multiline
        textAlignVertical="top"
      />

      {/* Age */}
      <Text className="text-sm font-medium text-slate-600 mb-1">Age</Text>
      <TextInput
        className="h-12 border border-slate-200 rounded-xl px-4 text-base text-slate-800 mb-4"
        value={age}
        onChangeText={setAge}
        placeholder="Your age"
        placeholderTextColor="#94a3b8"
        keyboardType="number-pad"
      />

      {/* Gender */}
      <Text className="text-sm font-medium text-slate-600 mb-2">Gender</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {GENDER_OPTIONS.map((opt) => {
          const isActive = gender === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setGender(isActive ? null : opt.value)}
              activeOpacity={0.7}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-indigo-500 border-indigo-500"
                  : "bg-white border-slate-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? "text-white" : "text-slate-600"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Interests */}
      <Text className="text-sm font-medium text-slate-600 mb-2">Interests</Text>
      <InterestPicker
        allInterests={allInterests}
        selectedIds={selectedInterestIds}
        onToggle={toggleInterest}
        disabled={saving}
      />

      {/* Save */}
      <TouchableOpacity
        className="h-12 bg-indigo-500 rounded-xl items-center justify-center mt-8"
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white text-base font-semibold">Save Changes</Text>
        )}
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity
        className="h-12 items-center justify-center mt-3"
        onPress={() => router.back()}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Text className="text-slate-500 text-base">Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
