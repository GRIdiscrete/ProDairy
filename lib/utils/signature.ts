export function normalizeDataUrlToBase64(value: string | null | undefined): string {
  if (!value) return ""
  return value.replace(/^data:image\/\w+;base64,/, "")
}

export function base64ToPngDataUrl(value: string | null | undefined): string {
  if (!value) return ""
  if (value.startsWith("data:")) return value
  return `data:image/png;base64,${value}`
}


