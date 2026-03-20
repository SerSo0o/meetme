import { supabase } from "./supabase";
import type {
  IncomingLike,
  Match,
  LikeStatus,
  CreateLikeResult,
} from "@/types/social";

export async function createLike(likedUserId: string): Promise<CreateLikeResult> {
  const { data, error } = await supabase.rpc("create_like", {
    p_liked_id: likedUserId,
  });

  if (error) throw error;
  return data as CreateLikeResult;
}

export async function checkLikeStatus(otherUserId: string): Promise<LikeStatus> {
  const { data, error } = await supabase.rpc("check_like_status", {
    p_other_user_id: otherUserId,
  });

  if (error) throw error;
  return data as LikeStatus;
}

export async function getIncomingLikes(): Promise<IncomingLike[]> {
  const { data, error } = await supabase.rpc("get_incoming_likes");

  if (error) throw error;
  return (data as IncomingLike[]) ?? [];
}

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase.rpc("get_matches");

  if (error) throw error;
  return (data as Match[]) ?? [];
}

export async function unlikeUser(likedUserId: string): Promise<void> {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("liked_id", likedUserId);

  if (error) throw error;
}
