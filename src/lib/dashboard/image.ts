"use client";
import { db } from "./db";

/** Réduit et compresse une image dans le navigateur (WebP si possible). Aucune dépendance. */
export async function compressImage(file: File, maxSide: number, quality = 0.8): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Ce fichier n'est pas une image.");
  const bmp = await createImageBitmap(file);
  const ratio = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * ratio), h = Math.round(bmp.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));
  return (await toBlob("image/webp")) ?? (await toBlob("image/jpeg")) ?? Promise.reject(new Error("Compression impossible."));
}

/** Envoie l'image dans le bucket (dossier = id du restaurant, exigé par les règles de sécurité). */
export async function uploadImage(
  bucket: "resto-logos" | "resto-photos-plats" | "resto-couvertures",
  restaurantId: string, kind: string, file: File, maxSide: number
): Promise<string> {
  const blob = await compressImage(file, maxSide);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${restaurantId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await db().storage.from(bucket).upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) throw error;
  return db().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
