import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TabIconProps = {
  color: string;
  size: number;
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0.5,
          borderTopColor: "#e2e8f0",
        },
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Nearby",
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Meet Me",
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          title: "Edit Profile",
          href: null,
        }}
      />
      <Tabs.Screen
        name="privacy-settings"
        options={{
          title: "Privacy Settings",
          href: null,
        }}
      />
    </Tabs>
  );
}
