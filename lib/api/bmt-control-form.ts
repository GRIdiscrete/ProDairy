import { apiRequest } from "@/lib/utils/api-request"

// ── Silo detail shapes returned by the API ───────────────────────────────────

export interface BMTSiloDetail {
  id: string
  silo_name: string
  volume: number | null
  created_at: string
  updated_at: string | null
  flow_meter_start: string | null
  flow_meter_start_reading: number | null
  flow_meter_end: string | null
  flow_meter_end_reading: number | null
  source_destination_id: string | null
}

export interface BMTSourceDestinationPair {
  id: string
  created_at: string
  updated_at: string | null
  bmt_control_form_2_id: string
  source_silo_details: BMTSiloDetail
  destination_silo_details: BMTSiloDetail | null
}

// ── Main record shape ─────────────────────────────────────────────────────────

export interface BMTControlForm {
  id: string
  created_at: string
  updated_at: string | null
  tag: string | null
  status: string | null
  product: string
  updated_by: string | null
  source_destination: string | null

  dispatch_operator_id: string | null
  dispatch_operator_signature: string | null
  dpp_operator_id: string | null
  dpp_signature: string | null
  llm_operator_id: string | null
  llm_signature: string | null

  source_destination_details: BMTSourceDestinationPair[] | null

  // legacy fields kept to avoid breaking the existing table / view components
  movement_start?: string | null
  movement_end?: string | null
  flow_meter_start?: string | null
  flow_meter_start_reading?: number | null
  flow_meter_end?: string | null
  flow_meter_end_reading?: number | null
  source_silo_id?: string[] | null
  destination_silo_id?: string | null
  volume?: number | null
  llm_operator_id_legacy?: string | null
  llm_signature_legacy?: string | null
  receiver_operator_id?: string | null
  receiver_operator_signature?: string | null
}

// ── POST payload ──────────────────────────────────────────────────────────────

export interface CreateSiloDetailRequest {
  silo_name: string
  /** Optional on POST – user may omit to let backend auto-generate */
  flow_meter_end?: string | null
  flow_meter_end_reading?: number | null
}

export interface CreateSourceDestinationPairRequest {
  source_silo_details: CreateSiloDetailRequest
  destination_silo_details?: CreateSiloDetailRequest
}

export interface CreateBMTControlFormRequest {
  dispatch_operator_id: string
  dispatch_operator_signature: string
  dpp_operator_id: string
  dpp_signature: string
  llm_operator_id: string
  llm_signature: string
  product: string
  /** Optional on POST */
  source_destination_details?: CreateSourceDestinationPairRequest[]
}

// ── PATCH payload ─────────────────────────────────────────────────────────────

export interface PatchSiloDetailRequest {
  id: string
  silo_name: string
  flow_meter_start?: string | null
  flow_meter_start_reading?: number | null
  flow_meter_end?: string | null
  flow_meter_end_reading?: number | null
  volume?: number | null
}

export interface PatchSourceDestinationPairRequest {
  id: string
  source_silo_details: PatchSiloDetailRequest
  destination_silo_details?: PatchSiloDetailRequest
}

export interface UpdateBMTControlFormRequest {
  id: string
  dispatch_operator_id: string
  dispatch_operator_signature: string
  dpp_operator_id: string
  dpp_signature: string
  llm_operator_id: string
  llm_signature: string
  product: string
  /** Mandatory on PATCH */
  source_destination_details: PatchSourceDestinationPairRequest[]
}

// ── Response wrappers ─────────────────────────────────────────────────────────

export interface BMTControlFormResponse {
  statusCode: number
  message: string
  data: BMTControlForm
}

export interface BMTControlFormsResponse {
  statusCode: number
  message: string
  data: BMTControlForm[]
}

// ── API client ────────────────────────────────────────────────────────────────

const BASE = "/bmt-control-form-2"

export const bmtControlFormApi = {
  getAll: async (): Promise<BMTControlForm[]> => {
    try {
      const response = await apiRequest<BMTControlFormsResponse>(BASE, {
        method: "GET",
        headers: { accept: "application/json" },
      })
      return response.data || []
    } catch (error) {
      console.error("Error fetching BMT control forms:", error)
      throw error
    }
  },

  getById: async (id: string): Promise<BMTControlForm> => {
    try {
      const response = await apiRequest<BMTControlFormResponse>(`${BASE}/${id}`, {
        method: "GET",
        headers: { accept: "application/json" },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching BMT control form ${id}:`, error)
      throw error
    }
  },

  create: async (formData: CreateBMTControlFormRequest): Promise<BMTControlFormResponse> => {
    try {
      const response = await apiRequest<BMTControlFormResponse>(BASE, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error("Error creating BMT control form:", error)
      throw error
    }
  },

  update: async (formData: UpdateBMTControlFormRequest): Promise<BMTControlFormResponse> => {
    try {
      console.log("BMT API PATCH body:", JSON.stringify(formData, null, 2))
      const response = await apiRequest<BMTControlFormResponse>(BASE, {
        method: "PATCH",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error("Error updating BMT control form:", error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest(`${BASE}/${id}`, {
        method: "DELETE",
        headers: { accept: "application/json" },
      })
    } catch (error) {
      console.error(`Error deleting BMT control form ${id}:`, error)
      throw error
    }
  },
}
