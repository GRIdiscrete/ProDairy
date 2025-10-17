import { apiRequest } from "@/lib/utils/api-request"
import { ApiEnvelope } from "./steri-milk-process-log"

// Detail item returned/accepted by the API
export interface QaReleaseNoteDetail {
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
  created_at?: string
  updated_at?: string | null
}

// Top-level QA release note object returned by the API
export interface QaReleaseNote {
  id: string
  created_at?: string
  updated_at?: string | null
  approved_by?: string | null
  approver_signature?: string | null
  details_id?: string | null
  tag?: string
  qa_release_note_details?: QaReleaseNoteDetail[]
}

// Create / Update request payloads
export interface CreateQaReleaseNoteRequest {
  approved_by?: string | null
  approver_signature?: string | null
  details: QaReleaseNoteDetail[]
}

export interface UpdateQaReleaseNoteRequest {
  id: string
  approved_by?: string | null
  approver_signature?: string | null
  details?: QaReleaseNoteDetail[] // full details array for patch
}

export const qaReleaseNoteApi = {
  async getAll(): Promise<QaReleaseNote[]> {
    const response = await apiRequest<ApiEnvelope<QaReleaseNote[]>>(`/qa-release-note`, { method: "GET" })
    return response.data
  },

  async get(id: string): Promise<QaReleaseNote> {
    const response = await apiRequest<ApiEnvelope<QaReleaseNote>>(`/qa-release-note/${id}`, { method: "GET" })
    return response.data
  },

  async create(payload: CreateQaReleaseNoteRequest): Promise<QaReleaseNote> {
    const response = await apiRequest<ApiEnvelope<QaReleaseNote>>(`/qa-release-note`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
    return response.data
  },

  async update(payload: UpdateQaReleaseNoteRequest): Promise<QaReleaseNote> {
    const response = await apiRequest<ApiEnvelope<QaReleaseNote>>(`/qa-release-note`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiRequest<ApiEnvelope<void>>(`/qa-release-note/${id}`, { method: "DELETE" })
  }
}
