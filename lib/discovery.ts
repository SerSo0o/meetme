import { supabase } from "./supabase";

export type NearbyUser = {
  profile_id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  status: string;
  age: number | null;
  gender: string | null;
  distance_meters: number;
};

export async function fetchNearbyUsers(
  radiusMeters: number = 3000
): Promise<NearbyUser[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("discover_nearby_users", {
    requesting_user_id: user.id,
    radius_meters: radiusMeters,
  });

  if (error) throw error;
  return (data as NearbyUser[]) ?? [];
}
