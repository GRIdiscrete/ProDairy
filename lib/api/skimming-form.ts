import { apiRequest } from "@/lib/utils/api-request"

export interface SkimmingForm {
  id: string
  created_at: string
  updated_at?: string
  operator_id: string
  operator_signature: string
  bmt_id: string
  raw_milk_id: string | null
  skim_milk_id: string | null
  cream_id: string | null
  standardizing_form_raw_milk: Array<{
    id: string
    fat: number
    quantity: number
    created_at: string
    updated_at?: string
    source_silo_id: string
    unit_of_measure: string
    raw_milk_form_id: string
    standardizing_form_id: string
  }>
  standardizing_form_skim_milk: Array<{
    id: string
    fat: number
    quantity: number
    created_at: string
    updated_at?: string
    filmatic_form_id: string
    destination_silo_id: string
    standardizing_form_id: string
  }>
  standardizing_form_cream: Array<{
    id: string
    fat: number
    quantity: number
    created_at: string
    updated_at?: string
    transfer_end: string
    transfer_start: string
    standardizing_form_id: string
  }>
}

export interface CreateSkimmingFormRequest {
  operator_id: string
  operator_signature: string
  bmt_id: string
  raw_milk: {
    quantity: number
    raw_milk_form_id: string
    fat: number
    unit_of_measure: string
    source_silo_id: string
  }
  skim_milk: {
    quantity: number
    fat: number
    destination_silo_id: string
  }
  cream: {
    quantity: number
    fat: number
    transfer_start: string
    transfer_end: string
  }
}

export interface UpdateSkimmingFormRequest {
  id: string
  operator_id: string
  operator_signature: string
  bmt_id: string
  raw_milk: {
    quantity: number
    raw_milk_form_id: string
    fat: number
    unit_of_measure: string
    source_silo_id: string
  }
  skim_milk: {
    quantity: number
    fat: number
    destination_silo_id: string
  }
  cream: {
    quantity: number
    fat: number
    transfer_start: string
    transfer_end: string
  }
}

export interface SkimmingFormResponse {
  statusCode: number
  message: string
  data: SkimmingForm
}

export interface SkimmingFormsResponse {
  statusCode: number
  message: string
  data: SkimmingForm[]
}

export const skimmingFormApi = {
  // Get all skimming forms
  getAll: async (): Promise<SkimmingForm[]> => {
    try {
      const response = await apiRequest<SkimmingFormsResponse>("/skimming-form", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data || []
    } catch (error) {
      console.error("Error fetching skimming forms:", error)
      throw error
    }
  },

  // Get single skimming form by ID
  getById: async (id: string): Promise<SkimmingForm> => {
    try {
      const response = await apiRequest<SkimmingFormResponse>(`/skimming-form/${id}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching skimming form ${id}:`, error)
      throw error
    }
  },

  // Create new skimming form
  create: async (formData: CreateSkimmingFormRequest): Promise<SkimmingFormResponse> => {
    try {
      const response = await apiRequest<SkimmingFormResponse>("/skimming-form", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error("Error creating skimming form:", error)
      throw error
    }
  },

  // Update skimming form
  update: async (formData: UpdateSkimmingFormRequest): Promise<SkimmingFormResponse> => {
    try {
      const response = await apiRequest<SkimmingFormResponse>("/skimming-form", {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error("Error updating skimming form:", error)
      throw error
    }
  },

  // Delete skimming form
  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest(`/skimming-form/${id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      })
    } catch (error) {
      console.error(`Error deleting skimming form ${id}:`, error)
      throw error
    }
  },
}
