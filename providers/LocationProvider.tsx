import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "./AuthProvider";
import * as Location from "expo-location";
import {
  requestLocationPermission,
  getCurrentLocation,
  upsertUserLocation,
} from "@/lib/location";

type LocationState = {
  hasPermission: boolean | null;
  isUpdating: boolean;
  lastUpdate: Date | null;
  refreshLocation: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
};

const LocationContext = createContext<LocationState>({
  hasPermission: null,
  isUpdating: false,
  lastUpdate: null,
  refreshLocation: async () => {},
  requestPermission: async () => false,
});

export function useLocation() {
  return useContext(LocationContext);
}

const UPDATE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export function LocationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function updateLocation() {
    if (!session?.user.id) return;
    setIsUpdating(true);
    try {
      const coords = await getCurrentLocation();
      if (coords) {
        await upsertUserLocation(session.user.id, coords.latitude, coords.longitude);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.warn("Location update failed:", e);
    } finally {
      setIsUpdating(false);
    }
  }

  async function requestPermission(): Promise<boolean> {
    const granted = await requestLocationPermission();
    setHasPermission(granted);
    if (granted) {
      await updateLocation();
    }
    return granted;
  }

  // Check existing permission on mount (don't trigger the native dialog)
  async function checkExistingPermission() {
    const { status } = await Location.getForegroundPermissionsAsync();
    const granted = status === "granted";
    setHasPermission(granted);
    if (granted) {
      await updateLocation();
    }
  }

  useEffect(() => {
    if (!session?.user.id) return;

    checkExistingPermission();

    // Periodic updates every 15 min
    intervalRef.current = setInterval(() => {
      if (hasPermission) updateLocation();
    }, UPDATE_INTERVAL_MS);

    // Also update on app foreground
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active" && hasPermission) {
        updateLocation();
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [session?.user.id]);

  return (
    <LocationContext.Provider
      value={{ hasPermission, isUpdating, lastUpdate, refreshLocation: updateLocation, requestPermission }}
    >
      {children}
    </LocationContext.Provider>
  );
}
