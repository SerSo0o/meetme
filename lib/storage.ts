import { supabase } from "./supabase";

export async function uploadAvatar(
  userId: string,
  uri: string
): Promise<string> {
  console.log("[avatar] Starting upload, uri prefix:", uri.substring(0, 40));

  let file: File;
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const mimeType = blob.type || "image/jpeg";
    const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    file = new File([blob], `avatar.${ext}`, { type: mimeType });
    console.log("[avatar] File ready, size:", file.size, "type:", file.type);
  } catch (e: any) {
    console.error("[avatar] Failed to read image:", e.message);
    throw new Error("Could not read the selected image. Please try again.");
  }

  if (file.size === 0) {
    throw new Error("Selected image is empty. Please pick a different photo.");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filePath = `${userId}/${Date.now()}.${ext}`;

  console.log("[avatar] Uploading to:", filePath);

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error("[avatar] Upload error:", error.message);
    throw error;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  console.log("[avatar] Done:", data.publicUrl);
  return data.publicUrl;
}
