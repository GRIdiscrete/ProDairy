import { apiRequest } from "@/lib/utils/api-request"
import { ApiEnvelope } from "@/lib/api/steri-milk-process-log"

export interface QaRejectNoteDetail {
  id?: string
  reject_date: string
  mnf_date: string
  batch_no: string
  pack_size: number
  product: string
  status: string
  pallets_rejected?: number
  reason?: string
  qa_reject_note_id?: string
  created_at?: string
  updated_at?: string | null
}

export interface QaRejectNote {
  id: string
  created_at?: string
  updated_at?: string | null
  approved_by?: string | null
  approver_signature?: string | null
  details_id?: string | QaRejectNoteDetail | null
  tag?: string
  qa_reject_note_details?: QaRejectNoteDetail[] // sometimes API nests details differently
}

export interface CreateQaRejectNoteRequest {
  approved_by?: string | null
  approver_signature?: string | null
  details: QaRejectNoteDetail | { [k:string]: any }
}

export interface UpdateQaRejectNoteRequest {
  id: string
  approved_by?: string | null
  approver_signature?: string | null
  details?: QaRejectNoteDetail | { [k:string]: any }
}

export const qaRejectNoteApi = {
  async getAll(): Promise<QaRejectNote[]> {
    const res = await apiRequest<ApiEnvelope<QaRejectNote[]>>(`/qa-reject-note`, { method: "GET" })
    return res.data
  },

  async get(id: string): Promise<QaRejectNote> {
    const res = await apiRequest<ApiEnvelope<QaRejectNote>>(`/qa-reject-note/${id}`, { method: "GET" })
    return res.data
  },

  async create(payload: CreateQaRejectNoteRequest): Promise<QaRejectNote> {
    const res = await apiRequest<ApiEnvelope<QaRejectNote>>(`/qa-reject-note`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
    return res.data
  },

  async update(payload: UpdateQaRejectNoteRequest): Promise<QaRejectNote> {
    const res = await apiRequest<ApiEnvelope<QaRejectNote>>(`/qa-reject-note`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    })
    return res.data
  },

  async delete(id: string): Promise<void> {
    await apiRequest<ApiEnvelope<void>>(`/qa-reject-note/${id}`, { method: "DELETE" })
  }
}
