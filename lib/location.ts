import { Platform } from "react-native";
import * as Location from "expo-location";
import { supabase } from "./supabase";

export function isSecureContext(): boolean {
  if (Platform.OS !== "web") return true;
  if (typeof window === "undefined") return true;
  return window.isSecureContext ?? window.location.protocol === "https:";
}

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === "web" && !isSecureContext()) {
    console.warn(
      "[location] Geolocation blocked: not a secure context (HTTPS required). " +
      "Access via localhost or HTTPS instead of LAN IP."
    );
    return false;
  }
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log("[location] Permission status:", status);
    return status === "granted";
  } catch (e) {
    console.warn("[location] Permission request failed:", e);
    return false;
  }
}

export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}

export async function upsertUserLocation(
  userId: string,
  latitude: number,
  longitude: number
) {
  const point = `POINT(${longitude} ${latitude})`;
  const { error } = await supabase.rpc("upsert_user_location", {
    p_user_id: userId,
    p_point: point,
  });
  if (error) throw error;
}
