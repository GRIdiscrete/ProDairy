import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function base64ToPngDataUrl(base64: string) {
  if (!base64) return "";
  if (base64.startsWith("data:image/png;base64,")) return base64;
  return `data:image/png;base64,${base64}`;
}

export function normalizeDataUrlToBase64(dataUrl: string) {
  if (!dataUrl) return "";
  if (dataUrl.startsWith("data:image/png;base64,")) {
    return dataUrl.replace("data:image/png;base64,", "");
  }
  return dataUrl;
}
