import "../global.css";

import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { LocationProvider } from "@/providers/LocationProvider";

function AuthGate() {
  const { session, profile, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    if (!session) {
      if (!inAuthGroup) router.replace("/(auth)/sign-in");
    } else if (!profile) {
      if (!inOnboarding) router.replace("/(onboarding)");
    } else {
      if (inAuthGroup || inOnboarding) router.replace("/(tabs)");
    }
  }, [session, profile, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <LocationProvider>
          <StatusBar style="auto" />
          <AuthGate />
        </LocationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
