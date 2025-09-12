import { apiRequest } from "@/lib/utils/api-request"

export interface Production {
  product: string
  quantity: number
}

export interface PasteurizingForm {
  id: string
  created_at: string
  updated_at?: string
  machine: string
  source_silo: string
  preheating_start: string
  water_circulation: string
  production_start: string
  production_end: string
  machine_start: string
  machine_end: string
  bmt: string
  fat: number
  production: Production[]
}

export interface CreatePasteurizingFormRequest {
  machine: string
  source_silo: string
  preheating_start: string
  water_circulation: string
  production_start: string
  production_end: string
  machine_start: string
  machine_end: string
  bmt: string
  fat: number
  production: Production[]
}

export interface PasteurizingFormResponse {
  statusCode: number
  message: string
  data: PasteurizingForm
}

export interface PasteurizingFormsResponse {
  statusCode: number
  message: string
  data: PasteurizingForm[]
}

const BASE_URL = "https://ckwkcg0o80cckkg0oog8okk8.greatssystems.co.zw"

export const pasteurizingApi = {
  // Get all pasteurizing forms
  getAll: async (): Promise<PasteurizingForm[]> => {
    try {
      const response = await apiRequest<PasteurizingFormsResponse>("/steri-milk-pasteurizing-form", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data || []
    } catch (error) {
      console.error("Error fetching pasteurizing forms:", error)
      throw error
    }
  },

  // Get single pasteurizing form by ID
  getById: async (id: string): Promise<PasteurizingForm> => {
    try {
      const response = await apiRequest<PasteurizingFormResponse>(`/steri-milk-pasteurizing-form/${id}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching pasteurizing form ${id}:`, error)
      throw error
    }
  },

  // Create new pasteurizing form
  create: async (formData: CreatePasteurizingFormRequest): Promise<PasteurizingFormResponse> => {
    try {
      const response = await apiRequest<PasteurizingFormResponse>("/steri-milk-pasteurizing-form", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error("Error creating pasteurizing form:", error)
      throw error
    }
  },

  // Update pasteurizing form
  update: async (id: string, formData: Partial<CreatePasteurizingFormRequest>): Promise<PasteurizingFormResponse> => {
    try {
      const patchData = {
        id,
        machine: formData.machine,
        source_silo: formData.source_silo,
        preheating_start: formData.preheating_start,
        water_circulation: formData.water_circulation,
        production_start: formData.production_start,
        production_end: formData.production_end,
        machine_start: formData.machine_start,
        machine_end: formData.machine_end,
        bmt: formData.bmt,
        fat: formData.fat,
        production: formData.production || []
      }

      const response = await apiRequest<PasteurizingFormResponse>("/steri-milk-pasteurizing-form", {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchData),
      })
      return response
    } catch (error) {
      console.error(`Error updating pasteurizing form ${id}:`, error)
      throw error
    }
  },

  // Delete pasteurizing form
  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest(`/steri-milk-pasteurizing-form/${id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      })
    } catch (error) {
      console.error(`Error deleting pasteurizing form ${id}:`, error)
      throw error
    }
  },
}
