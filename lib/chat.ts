import { supabase } from "./supabase";
import type { Message } from "@/types/social";
import type { RealtimeChannel } from "@supabase/supabase-js";

export async function sendMessage(
  matchId: string,
  content: string
): Promise<string> {
  const { data, error } = await supabase.rpc("send_message", {
    p_match_id: matchId,
    p_content: content,
  });

  if (error) throw error;
  return data as string;
}

export async function getMessages(matchId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as Message[]) ?? [];
}

export async function markMessagesAsRead(matchId: string): Promise<void> {
  const { error } = await supabase.rpc("mark_messages_read", {
    p_match_id: matchId,
  });

  if (error) throw error;
}

export function subscribeToMessages(
  matchId: string,
  onMessage: (message: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromMessages(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
