export type QaReleaseNoteDetail = {
  id?: string
  release_date: string
  mnf_date: string
  batch_no: string
  pack_size_ml: number
  product: string
  status: string
  pallets_on_hold?: number
  hold_times?: number
  qa_release_note_id?: string
}

export type QaReleaseNote = {
  id?: string
  approved_by?: string
  approver_signature?: string
  details?: QaReleaseNoteDetail[]
  tag?: string
  created_at?: string
  updated_at?: string | null
  details_id?: string | null
  qa_release_note_details?: QaReleaseNoteDetail[]
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://assc4gos404g88scso8go4oc.102.218.14.210.sslip.io/qa-release-note"

const handleResp = async (res: Response) => {
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw json?.message || json || "Request failed"
  return json
}

export const qaReleaseNoteApi = {
  async getAll() {
    const res = await fetch(BASE, { method: "GET", headers: { accept: "application/json" } })
    return handleResp(res)
  },
  async create(payload: any) {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload)
    })
    return handleResp(res)
  },
  async update(payload: any) {
    const res = await fetch(BASE, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload)
    })
    return handleResp(res)
  },
  async remove(id: string) {
    const res = await fetch(`${BASE}/${id}`, {
      method: "DELETE",
      headers: { accept: "application/json" }
    })
    return handleResp(res)
  }
}
