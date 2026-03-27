import { apiRequest } from "@/lib/utils/api-request"

export interface StandardizingForm {
  id: string
  created_at: string
  updated_at?: string
  operator_id: string
  operator_signature: string
  bmt_id: string
  skim_milk: string | null
  tag: string | null
  standardizing_form_no_skim_skim_milk: Array<{
    id: string
    quantity: number
    created_at: string
    updated_at?: string
    resulting_fat: number
    standardizing_form_no_skim_id: string
  }>
}

export interface CreateStandardizingFormRequest {
  operator_id: string
  operator_signature: string
  bmt_id: string
  skim: {
    quantity: number
    resulting_fat: number
  }
}

export interface UpdateStandardizingFormRequest {
  id: string
  operator_id: string
  operator_signature: string
  bmt_id: string
  skim: {
    quantity: number
    resulting_fat: number
  }
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

export const standardizingFormApi = {
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
      throw error
    }
  },

  // Update standardizing form
  update: async (formData: UpdateStandardizingFormRequest): Promise<StandardizingFormResponse> => {
    try {
      const response = await apiRequest<StandardizingFormResponse>("/standardizing-form", {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error("Error updating standardizing form:", error)
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
