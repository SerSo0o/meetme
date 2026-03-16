import { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import { useLocation } from "@/providers/LocationProvider";
import { getPrivacyPreferences, upsertPrivacyPreferences } from "@/lib/profile";

export default function PrivacySettingsScreen() {
  const { session } = useAuth();
  const { hasPermission, requestPermission, lastUpdate, isUpdating, refreshLocation } = useLocation();
  const [requesting, setRequesting] = useState(false);

  const [showDistance, setShowDistance] = useState(true);
  const [showOnMap, setShowOnMap] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.user.id) return;
    loadPrefs();
  }, [session?.user.id]);

  async function loadPrefs() {
    try {
      const prefs = await getPrivacyPreferences(session!.user.id);
      if (prefs) {
        setShowDistance(prefs.show_distance);
        setShowOnMap(prefs.show_on_map);
        setDiscoverable(prefs.discoverable);
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }

  async function saveField(field: string, value: boolean) {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      await upsertPrivacyPreferences(session.user.id, { [field]: value });
    } catch (e: any) {
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
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24 }}>
      <Text className="text-2xl font-bold text-slate-800 mb-2">Privacy Settings</Text>
      <Text className="text-sm text-slate-400 mb-8">
        Control how others see you in discovery and on the map.
      </Text>

      {/* Location Access */}
      <View className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
        <View className="flex-row items-center gap-2 mb-1">
          <Ionicons
            name={hasPermission ? "location" : "location-outline"}
            size={18}
            color={hasPermission ? "#22c55e" : "#ef4444"}
          />
          <Text className="text-base font-medium text-slate-800">
            Location Access
          </Text>
          <View
            className="w-2.5 h-2.5 rounded-full ml-auto"
            style={{ backgroundColor: hasPermission ? "#22c55e" : "#ef4444" }}
          />
        </View>
        <Text className="text-sm text-slate-400 mb-3">
          {hasPermission
            ? lastUpdate
              ? `Active · Last updated ${lastUpdate.toLocaleTimeString()}`
              : "Granted · Waiting for first update"
            : "Not granted · Required for nearby discovery"}
        </Text>
        <TouchableOpacity
          className={`h-10 rounded-lg items-center justify-center ${
            hasPermission ? "bg-slate-200" : "bg-indigo-500"
          }`}
          onPress={async () => {
            setRequesting(true);
            if (hasPermission) {
              await refreshLocation();
            } else {
              await requestPermission();
            }
            setRequesting(false);
          }}
          disabled={requesting || isUpdating}
          activeOpacity={0.8}
        >
          {requesting || isUpdating ? (
            <ActivityIndicator color={hasPermission ? "#64748b" : "#ffffff"} size="small" />
          ) : (
            <Text
              className={`text-sm font-semibold ${
                hasPermission ? "text-slate-600" : "text-white"
              }`}
            >
              {hasPermission ? "Refresh Location" : "Grant Location Access"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <PrivacyRow
        label="Show distance"
        description="Other users can see how far you are"
        value={showDistance}
        disabled={saving}
        onValueChange={(v) => {
          setShowDistance(v);
          saveField("show_distance", v);
        }}
      />

      <PrivacyRow
        label="Show on map"
        description="Your presence appears on the discovery map"
        value={showOnMap}
        disabled={saving}
        onValueChange={(v) => {
          setShowOnMap(v);
          saveField("show_on_map", v);
        }}
      />

      <PrivacyRow
        label="Discoverable"
        description="You appear in the nearby people list"
        value={discoverable}
        disabled={saving}
        onValueChange={(v) => {
          setDiscoverable(v);
          saveField("discoverable", v);
        }}
      />
    </ScrollView>
  );
}

function PrivacyRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-slate-100">
      <View className="flex-1 mr-4">
        <Text className="text-base font-medium text-slate-800">{label}</Text>
        <Text className="text-sm text-slate-400 mt-0.5">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "#e2e8f0", true: "#818cf8" }}
        thumbColor={value ? "#6366f1" : "#f4f4f5"}
      />
    </View>
  );
}
