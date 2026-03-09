import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const isMissing = !supabaseUrl || !supabaseAnonKey;

if (isMissing) {
  console.warn(
    "Supabase URL or anon key is missing. Check your .env file."
  );
}

const memoryStorage = new Map<string, string>();

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return memoryStorage.get(key) ?? null;
    }
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      memoryStorage.set(key, value);
      return;
    }
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      memoryStorage.delete(key);
      return;
    }
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      storage: safeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export const isSupabaseConfigured = !isMissing;
