import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import { useLocation } from "@/providers/LocationProvider";
import { isSecureContext } from "@/lib/location";
import { fetchNearbyUsers, type NearbyUser } from "@/lib/discovery";
import { DiscoveryCard } from "@/components/DiscoveryCard";
import { ProfileSheet } from "@/components/ProfileSheet";

export default function NearbyScreen() {
  const { session } = useAuth();
  const { hasPermission, isUpdating, requestPermission } = useLocation();
  const [requesting, setRequesting] = useState(false);
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["70%", "95%"], []);

  async function loadNearby() {
    try {
      const data = await fetchNearbyUsers(3000);
      setUsers(data);
    } catch (e) {
      console.warn("Discovery error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadNearby();
    setRefreshing(false);
  }

  useEffect(() => {
    if (session?.user.id && hasPermission) {
      loadNearby();
    } else if (hasPermission === false) {
      setLoading(false);
    }
  }, [session?.user.id, hasPermission, isUpdating]);

  function openProfile(user: NearbyUser) {
    setSelectedUser(user);
    sheetRef.current?.snapToIndex(0);
  }

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) setSelectedUser(null);
  }, []);

  async function handleGrantAccess() {
    setRequesting(true);
    const granted = await requestPermission();
    if (granted) {
      setLoading(true);
      await loadNearby();
    }
    setRequesting(false);
  }

  const secure = isSecureContext();

  // Non-HTTPS connection (LAN IP) — geolocation unavailable
  if (!secure) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Ionicons name="warning-outline" size={48} color="#eab308" />
        <Text className="text-lg font-semibold text-slate-700 mt-4 text-center">
          Secure connection required
        </Text>
        <Text className="text-sm text-slate-400 mt-2 text-center leading-5">
          Location only works on HTTPS or localhost.{"\n\n"}
          On this device, open:{"\n"}
          <Text className="font-mono text-indigo-500">http://localhost:8081</Text>
          {"\n\n"}
          On other devices, location will work once the app is deployed with HTTPS or run natively.
        </Text>
      </View>
    );
  }

  // Permission denied — on iOS must open Settings
  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Ionicons name="location-outline" size={48} color="#94a3b8" />
        <Text className="text-lg font-semibold text-slate-700 mt-4 text-center">
          Location access needed
        </Text>
        <Text className="text-sm text-slate-400 mt-2 text-center">
          Meet Me needs your location to find people nearby.{Platform.OS === "ios" ? "\nPlease enable it in Settings." : ""}
        </Text>
        <TouchableOpacity
          className="mt-6 h-12 px-8 bg-indigo-500 rounded-xl items-center justify-center"
          onPress={Platform.OS === "ios" ? () => Linking.openSettings() : handleGrantAccess}
          disabled={requesting}
          activeOpacity={0.8}
        >
          {requesting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-base font-semibold">
              {Platform.OS === "ios" ? "Open Settings" : "Grant Location Access"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Permission not yet determined
  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Ionicons name="location-outline" size={48} color="#94a3b8" />
        <Text className="text-lg font-semibold text-slate-700 mt-4 text-center">
          Enable location
        </Text>
        <Text className="text-sm text-slate-400 mt-2 text-center">
          Tap below to allow Meet Me to find people near you.
        </Text>
        <TouchableOpacity
          className="mt-6 h-12 px-8 bg-indigo-500 rounded-xl items-center justify-center"
          onPress={handleGrantAccess}
          disabled={requesting}
          activeOpacity={0.8}
        >
          {requesting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-base font-semibold">Grant Location Access</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Loading
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-sm text-slate-400 mt-3">Finding people nearby...</Text>
      </View>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Ionicons name="people-outline" size={48} color="#94a3b8" />
        <Text className="text-lg font-semibold text-slate-700 mt-4 text-center">
          No one nearby yet
        </Text>
        <Text className="text-sm text-slate-400 mt-2 text-center">
          There are no visible users within 3km right now. Try again later or change your status to Green to be discoverable too.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={users}
        keyExtractor={(item) => item.profile_id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        renderItem={({ item }) => (
          <DiscoveryCard user={item} onPress={() => openProfile(item)} />
        )}
      />

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        backgroundStyle={{ borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: "#cbd5e1" }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          {selectedUser && <ProfileSheet user={selectedUser} />}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
