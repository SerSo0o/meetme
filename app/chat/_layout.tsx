import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerBackTitle: "Back",
      }}
    />
  );
}
