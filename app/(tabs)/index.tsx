import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import { useLocation } from "@/providers/LocationProvider";
import { fetchNearbyUsers, type NearbyUser } from "@/lib/discovery";
import { DiscoveryCard } from "@/components/DiscoveryCard";
import { ProfileSheet } from "@/components/ProfileSheet";

export default function NearbyScreen() {
  const { session } = useAuth();
  const { hasPermission, isUpdating } = useLocation();
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

  // Permission not granted
  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Ionicons name="location-outline" size={48} color="#94a3b8" />
        <Text className="text-lg font-semibold text-slate-700 mt-4 text-center">
          Location access needed
        </Text>
        <Text className="text-sm text-slate-400 mt-2 text-center">
          Meet Me needs your location to find people nearby. Please enable location in your device settings.
        </Text>
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
        numColumns={2}
        contentContainerStyle={{ padding: 18, paddingTop: 8 }}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
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
