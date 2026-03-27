import { apiRequest } from "@/lib/utils/api-request"

export interface BMTControlFormSilo {
  id: string
  name: string
  product: string
  created_at: string
  updated_at: string | null
  flow_meter_end: string | null
  flow_meter_start: string | null
  bmt_control_form_id: string
  flow_meter_end_reading: number | null
  flow_meter_start_reading: number | null
  source_silo_quantity_requested: number | null
}

export interface BMTControlForm {
  id: string
  created_at: string
  flow_meter_start: string | null
  flow_meter_start_reading: number | null
  flow_meter_end: string | null
  flow_meter_end_reading: number | null
  source_silo_id: string[] | null
  movement_start: string | null
  movement_end: string | null
  destination_silo_id: string | null
  volume: number | null
  llm_operator_id: string | null
  llm_signature: string | null
  dpp_operator_id: string | null
  dpp_signature: string | null
  product: string // Accept any string for product (e.g., "Raw milk")
  updated_at?: string | null
  dispatch_operator_id?: string | null
  dispatch_operator_signature?: string | null
  tag?: string | null
  received_bottles?: number | null
  receiver_operator_id?: string | null
  receiver_operator_signature?: string | null
  status?: string | null
  destination_silo?: BMTControlFormSilo | null
  bmt_control_form_source_silo?: BMTControlFormSilo[] | null
}

export interface CreateBMTControlFormRequest {
  flow_meter_start: string
  flow_meter_start_reading: number
  flow_meter_end: string
  flow_meter_end_reading: number
  source_silo_id: string[]
  movement_start: string
  movement_end: string
  destination_silo_id: string
  volume: number
  llm_operator_id: string
  llm_signature: string
  dpp_operator_id: string
  dpp_signature: string
  product: "Raw Milk" | "Skim Milk" | "Standardized Milk" | "Pasteurized Milk"
}

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

export const bmtControlFormApi = {
  // Get all BMT control forms
  getAll: async (): Promise<BMTControlForm[]> => {
    try {
      const response = await apiRequest<BMTControlFormsResponse>("/bmt-control-form", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data || []
    } catch (error) {
      console.error("Error fetching BMT control forms:", error)
      throw error
    }
  },

  // Get single BMT control form by ID
  getById: async (id: string): Promise<BMTControlForm> => {
    try {
      const response = await apiRequest<BMTControlFormResponse>(`/bmt-control-form/${id}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching BMT control form ${id}:`, error)
      throw error
    }
  },

  // Create new BMT control form
  create: async (formData: CreateBMTControlFormRequest): Promise<BMTControlFormResponse> => {
    try {
      const response = await apiRequest<BMTControlFormResponse>("/bmt-control-form", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error("Error creating BMT control form:", error)
      throw error
    }
  },

  // Update BMT control form
  update: async (id: string, formData: Partial<CreateBMTControlFormRequest>): Promise<BMTControlFormResponse> => {
    try {
      const requestBody = { id, ...formData }
      
      // Debug: Log the final request body
      console.log('API Request Body:', JSON.stringify(requestBody, null, 2))
      
      const response = await apiRequest<BMTControlFormResponse>("/bmt-control-form", {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
      return response
    } catch (error) {
      console.error(`Error updating BMT control form ${id}:`, error)
      throw error
    }
  },

  // Delete BMT control form
  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest(`/bmt-control-form/${id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      })
    } catch (error) {
      console.error(`Error deleting BMT control form ${id}:`, error)
      throw error
    }
  },
}
