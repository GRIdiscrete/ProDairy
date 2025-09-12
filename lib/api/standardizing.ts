import { apiRequest } from "@/lib/utils/api-request"

export interface RawMilk {
  quantity: number
  fat: number
  unit_of_measure: string
  source_silo_id: string
}

export interface SkimMilk {
  quantity: number
  fat: number
  destination_silo_id: string
  bmt_id: string
}

export interface Cream {
  quantity: number
  fat: number
  destination_silo_id: string
  transfer_start: string
  transfer_end: string
}

export interface StandardizingForm {
  id: string
  created_at: string
  updated_at?: string
  operator_id?: string
  operator_signature: string
  bmt_id: string
  raw_milk: RawMilk[]
  skim_milk: SkimMilk[]
  cream: Cream[]
  standardizing_form_operator_id_fkey?: any
  standardizing_form_bmt_id_fkey?: {
    id: string
    volume: number
    product: string
    created_at: string
    updated_at: string
    movement_end: string
    dpp_signature: string
    llm_signature: string
    flow_meter_end: string
    movement_start: string
    source_silo_id: string
    dpp_operator_id: string
    llm_operator_id: string
    flow_meter_start: string
    destination_silo_id: string
    flow_meter_end_reading: number
    flow_meter_start_reading: number
  }
}

export interface CreateStandardizingFormRequest {
  id: string
  operator_signature: string
  bmt_id: string
  raw_milk: RawMilk[]
  skim_milk: SkimMilk[]
  cream: Cream[]
}

export interface StandardizingFormResponse {
  statusCode: number
  message: string
  data: StandardizingForm
}

export interface StandardizingFormsResponse {
  statusCode: number
  message: string
  data: StandardizingForm[]
}

const BASE_URL = "https://ckwkcg0o80cckkg0oog8okk8.greatssystems.co.zw"

export const standardizingApi = {
  // Get all standardizing forms
  getAll: async (): Promise<StandardizingForm[]> => {
    try {
      const response = await apiRequest<StandardizingFormsResponse>("/standardizing-form", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data || []
    } catch (error) {
      console.error("Error fetching standardizing forms:", error)
      throw error
    }
  },

  // Get single standardizing form by ID
  getById: async (id: string): Promise<StandardizingForm> => {
    try {
      const response = await apiRequest<StandardizingFormResponse>(`/standardizing-form/${id}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching standardizing form ${id}:`, error)
      throw error
    }
  },

  // Create new standardizing form
  create: async (formData: CreateStandardizingFormRequest): Promise<StandardizingFormResponse> => {
    try {
      const response = await apiRequest<StandardizingFormResponse>("/standardizing-form", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error("Error creating standardizing form:", error)
      throw error
    }
  },

  // Update standardizing form
  update: async (id: string, formData: Partial<CreateStandardizingFormRequest>): Promise<StandardizingFormResponse> => {
    try {
      // Only send the required fields for PATCH request
      const patchData = {
        id,
        operator_signature: formData.operator_signature,
        bmt_id: formData.bmt_id,
        raw_milk: formData.raw_milk || [],
        skim_milk: formData.skim_milk || [],
        cream: formData.cream || []
      }

      const response = await apiRequest<StandardizingFormResponse>("/standardizing-form", {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchData),
      })
      return response
    } catch (error) {
      console.error(`Error updating standardizing form ${id}:`, error)
      throw error
    }
  },

  // Delete standardizing form
  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest(`/standardizing-form/${id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      })
    } catch (error) {
      console.error(`Error deleting standardizing form ${id}:`, error)
      throw error
    }
  },
}
