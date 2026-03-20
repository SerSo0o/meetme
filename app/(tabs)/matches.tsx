import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getIncomingLikes, getMatches, createLike } from "@/lib/likes";
import type { IncomingLike, Match } from "@/types/social";

export default function MeetMeScreen() {
  const [incomingLikes, setIncomingLikes] = useState<IncomingLike[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const [likesData, matchesData] = await Promise.all([
        getIncomingLikes(),
        getMatches(),
      ]);
      setIncomingLikes(likesData);
      setMatches(matchesData);
    } catch (e) {
      console.warn("Failed to load meet me data:", e);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleLikeBack(likerId: string) {
    try {
      const result = await createLike(likerId);
      if (result.is_mutual && result.match_id) {
        router.push(`/chat/${result.match_id}` as any);
      }
      // Refresh data to update lists
      await loadData();
    } catch (e) {
      console.warn("Failed to like back:", e);
    }
  }

  function openChat(matchId: string) {
    router.push(`/chat/${matchId}` as any);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const hasContent = incomingLikes.length > 0 || matches.length > 0;

  if (!hasContent) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Ionicons name="heart-outline" size={48} color="#94a3b8" />
        <Text className="text-lg font-semibold text-slate-700 mt-4 text-center">
          No connections yet
        </Text>
        <Text className="text-sm text-slate-400 mt-2 text-center">
          When someone likes you or you match with someone, they'll appear here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
      ListHeaderComponent={
        <>
          {/* Incoming Likes Section */}
          {incomingLikes.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-slate-800 mb-3">
                Likes You ({incomingLikes.length})
              </Text>
              <FlatList
                horizontal
                data={incomingLikes}
                keyExtractor={(item) => item.like_id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleLikeBack(item.liker_id)}
                    activeOpacity={0.9}
                    className="mr-3 w-32"
                  >
                    <View className="w-32 h-40 rounded-xl overflow-hidden bg-slate-100">
                      {item.avatar_url ? (
                        <Image
                          source={{ uri: item.avatar_url }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center bg-indigo-50">
                          <Text className="text-3xl font-bold text-indigo-200">
                            {item.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                          </Text>
                        </View>
                      )}
                      <View
                        className="absolute bottom-0 left-0 right-0 p-2"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                      >
                        <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                          {item.display_name}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleLikeBack(item.liker_id)}
                      className="mt-2 h-8 rounded-lg bg-indigo-500 items-center justify-center"
                    >
                      <Text className="text-white text-xs font-semibold">Like Back</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Matches Section Header */}
          {matches.length > 0 && (
            <Text className="text-lg font-bold text-slate-800 mb-3">
              Matches ({matches.length})
            </Text>
          )}
        </>
      }
      data={matches}
      keyExtractor={(item) => item.match_id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => openChat(item.match_id)}
          activeOpacity={0.8}
          className="flex-row items-center p-3 mb-2 rounded-xl bg-slate-50"
        >
          {/* Avatar */}
          <View className="w-14 h-14 rounded-full overflow-hidden bg-indigo-50">
            {item.avatar_url ? (
              <Image
                source={{ uri: item.avatar_url }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Text className="text-xl font-bold text-indigo-200">
                  {item.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-slate-800">
                {item.display_name}
              </Text>
              {item.unread_count > 0 && (
                <View className="w-5 h-5 rounded-full bg-indigo-500 items-center justify-center">
                  <Text className="text-xs text-white font-bold">
                    {item.unread_count > 9 ? "9+" : item.unread_count}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="text-sm text-slate-500 mt-0.5"
              numberOfLines={1}
            >
              {item.last_message ?? "Say hi! 👋"}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        incomingLikes.length > 0 ? (
          <View className="py-8 items-center">
            <Text className="text-sm text-slate-400">
              No matches yet. Like someone back to start chatting!
            </Text>
          </View>
        ) : null
      }
    />
  );
}
