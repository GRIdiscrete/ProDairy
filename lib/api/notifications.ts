export interface NotificationItem {
  id: string
  created_at: string
  updated_at: string | null
  form_id: string
  action: 'created' | 'updated' | 'deleted' | string
  module: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://assc4gos404g88scso8go4oc.102.218.14.210.sslip.io'

export async function getRecentNotifications(limit = 8): Promise<NotificationItem[]> {
  const url = `${BASE_URL}/notifications/recent?limit=${encodeURIComponent(String(limit))}`
  const res = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store' })
  if (!res.ok) return []
  const body = await res.json().catch(() => ({}))
  return Array.isArray(body?.data) ? body.data : []
}

export interface GetNotificationsParams {
  page?: number
  limit?: number
}

export async function getNotifications({ page = 1, limit = 20 }: GetNotificationsParams = {}): Promise<NotificationItem[]> {
  const url = `${BASE_URL}/notifications?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  const res = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store' })
  if (!res.ok) return []
  const body = await res.json().catch(() => ({}))
  return Array.isArray(body?.data) ? body.data : []
}

export async function getModuleNotifications(module: string, { page = 1, limit = 20 }: GetNotificationsParams = {}): Promise<NotificationItem[]> {
  const url = `${BASE_URL}/notifications/module/${encodeURIComponent(module)}?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  const res = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store' })
  if (!res.ok) return []
  const body = await res.json().catch(() => ({}))
  return Array.isArray(body?.data) ? body.data : []
}

export function humanizeModule(module: string): string {
  return module
    .replace(/_/g, ' ')
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
}

export function moduleToRoute(module: string, formId?: string): string | null {
  // Map backend module identifiers to app routes
  const map: Record<string, string> = {
    'raw-milk-intake': '/data-capture/raw-milk-intake',
    'standardizing': '/data-capture/standardizing',
    'pasteurizing': '/data-capture/pasteurizing',
    'filmatic_line_form_1': '/data-capture/filmatic-lines',
    'filmatic_line_groups': '/admin/filmatic-lines-groups',
    'process_log': '/data-capture/process-log',
    'filmatic_lines_2': '/data-capture/filmatic-lines',
    'palletiser_sheet': '/data-capture/palletiser-sheet',
    'incubation': '/data-capture/incubation',
    'test': '/data-capture/test',
    'qa_release_note': '/data-capture/qa-corrective-measures',
    'dispatch': '/drivers',
  }
  return map[module] ?? null
}


