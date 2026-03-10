import * as Location from "expo-location";
import { supabase } from "./supabase";

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
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
