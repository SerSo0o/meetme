import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  unsubscribeFromMessages,
} from "@/lib/chat";
import { getMatches } from "@/lib/likes";
import type { Message, Match } from "@/types/social";

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [matchInfo, setMatchInfo] = useState<Match | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!matchId) return;

    async function loadChat() {
      try {
        const [messagesData, matchesData] = await Promise.all([
          getMessages(matchId!),
          getMatches(),
        ]);
        setMessages(messagesData);
        
        const match = matchesData.find((m) => m.match_id === matchId);
        setMatchInfo(match ?? null);

        // Mark messages as read
        await markMessagesAsRead(matchId!);
      } catch (e) {
        console.warn("Failed to load chat:", e);
      } finally {
        setLoading(false);
      }
    }

    loadChat();

    // Subscribe to real-time messages
    const channel = subscribeToMessages(matchId, (newMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      
      // Mark as read if not from current user
      if (newMessage.sender_id !== session?.user.id) {
        markMessagesAsRead(matchId!);
      }
    });

    return () => {
      unsubscribeFromMessages(channel);
    };
  }, [matchId, session?.user.id]);

  async function handleSend() {
    if (!inputText.trim() || !matchId || sending) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      await sendMessage(matchId, text);
      // Message will appear via realtime subscription
    } catch (e) {
      console.warn("Failed to send message:", e);
      setInputText(text); // Restore on error
    } finally {
      setSending(false);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isMe = item.sender_id === session?.user.id;

    return (
      <View
        className={`mb-2 max-w-[80%] ${isMe ? "self-end" : "self-start"}`}
      >
        <View
          className={`px-4 py-2.5 rounded-2xl ${
            isMe ? "bg-indigo-500 rounded-br-md" : "bg-slate-100 rounded-bl-md"
          }`}
        >
          <Text
            className={`text-base ${isMe ? "text-white" : "text-slate-800"}`}
          >
            {item.content}
          </Text>
        </View>
        <Text
          className={`text-xs text-slate-400 mt-1 ${
            isMe ? "text-right" : "text-left"
          }`}
        >
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: matchInfo?.display_name ?? "Chat",
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
          headerRight: () =>
            matchInfo ? (
              <TouchableOpacity
                onPress={() => router.push(`/chat/user/${matchInfo.other_user_id}` as any)}
                activeOpacity={0.7}
                className="w-9 h-9 rounded-full overflow-hidden bg-indigo-50 items-center justify-center"
              >
                {matchInfo.avatar_url ? (
                  <Image
                    source={{ uri: matchInfo.avatar_url }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-base font-bold text-indigo-300">
                    {matchInfo.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                  </Text>
                )}
              </TouchableOpacity>
            ) : null,
        }}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? "center" : "flex-end",
          }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View className="items-center py-8">
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#cbd5e1" />
              <Text className="text-slate-400 mt-3 text-center">
                No messages yet.{"\n"}Say hi to start the conversation!
              </Text>
            </View>
          }
        />

        {/* Input area */}
        <View className="flex-row items-end px-4 py-3 border-t border-slate-100">
          <TextInput
            className="flex-1 min-h-[44px] max-h-24 px-4 py-2.5 bg-slate-100 rounded-2xl text-base text-slate-800"
            placeholder="Type a message..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.7}
            className="ml-2 w-11 h-11 rounded-full bg-indigo-500 items-center justify-center"
            style={{ opacity: inputText.trim() ? 1 : 0.5 }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
