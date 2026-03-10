import { supabase } from "./supabase";
import type { UserStatus, Gender, Interest } from "@/types/profile";
import type { PrivacyPreferences } from "@/types/privacy";

export async function updateProfile(
  profileId: string,
  fields: {
    display_name?: string;
    bio?: string;
    avatar_url?: string | null;
    age?: number | null;
    gender?: Gender | null;
  }
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStatus(profileId: string, status: UserStatus) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllInterests(): Promise<Interest[]> {
  const { data, error } = await supabase
    .from("interests")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getProfileInterests(profileId: string): Promise<Interest[]> {
  const { data, error } = await supabase
    .from("profile_interests")
    .select("interest_id, interests(id, name, created_at)")
    .eq("profile_id", profileId);
  if (error) throw error;
  return (data ?? []).map((row: any) => row.interests);
}

export async function setProfileInterests(
  profileId: string,
  interestIds: string[]
) {
  const { error: deleteError } = await supabase
    .from("profile_interests")
    .delete()
    .eq("profile_id", profileId);
  if (deleteError) throw deleteError;

  if (interestIds.length === 0) return;

  const rows = interestIds.map((interestId) => ({
    profile_id: profileId,
    interest_id: interestId,
  }));
  const { error: insertError } = await supabase
    .from("profile_interests")
    .insert(rows);
  if (insertError) throw insertError;
}

export async function getPrivacyPreferences(
  userId: string
): Promise<PrivacyPreferences | null> {
  const { data, error } = await supabase
    .from("privacy_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertPrivacyPreferences(
  userId: string,
  prefs: {
    show_distance?: boolean;
    show_on_map?: boolean;
    discoverable?: boolean;
  }
) {
  const { data, error } = await supabase
    .from("privacy_preferences")
    .upsert({ user_id: userId, ...prefs }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
