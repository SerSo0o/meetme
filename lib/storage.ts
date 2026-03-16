import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { decode as atob } from "base-64";
import { supabase } from "./supabase";

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function uploadAvatar(
  userId: string,
  uri: string
): Promise<string> {
  console.log("[avatar] Starting upload, uri prefix:", uri.substring(0, 40));

  let fileData: ArrayBuffer;
  let mimeType = "image/jpeg";

  if (Platform.OS === "web") {
    // Web: fetch → blob works fine
    const response = await fetch(uri);
    const blob = await response.blob();
    mimeType = blob.type || "image/jpeg";
    fileData = await blob.arrayBuffer();
    console.log("[avatar] Web blob ready, size:", fileData.byteLength);
  } else {
    // Native: use expo-file-system for reliable file reading
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64' as any,
      });
      fileData = base64ToArrayBuffer(base64);

      // Detect mime type from extension
      const lower = uri.toLowerCase();
      if (lower.endsWith(".png")) mimeType = "image/png";
      else if (lower.endsWith(".webp")) mimeType = "image/webp";
      else mimeType = "image/jpeg";

      console.log("[avatar] Native file ready, size:", fileData.byteLength, "type:", mimeType);
    } catch (e: any) {
      console.error("[avatar] Failed to read image:", e.message);
      throw new Error("Could not read the selected image. Please try again.");
    }
  }

  if (fileData.byteLength === 0) {
    throw new Error("Selected image is empty. Please pick a different photo.");
  }

  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const filePath = `${userId}/${Date.now()}.${ext}`;

  console.log("[avatar] Uploading to:", filePath, "size:", fileData.byteLength);

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, fileData, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error("[avatar] Upload error:", error.message);
    throw error;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  console.log("[avatar] Done:", data.publicUrl);
  return data.publicUrl;
}
