import { apiRequest } from "@/lib/utils/api-request"

export interface RawMilkDetails {
  id?: string
  fat: number | null
  quantity: number | null
  source_silo_name: string | null
}

export interface SkimMilkDetails {
  id?: string
  fat: number | null
  quantity: number | null
  destination_silo_name: string | null
}

export interface CreamDetails {
  id?: string
  fat: number | null
  quantity: number | null
  cream_tank: string | null
}

export interface SkimmingForm {
  id: string
  tag: string
  created_at?: string
  updated_at?: string
  operator_id?: string
  operator_signature?: string
  raw_milk: RawMilkDetails | null
  skim_milk: SkimMilkDetails | null
  cream: CreamDetails | null
}

export interface CreateSkimmingFormRequest {
  operator_id: string
  operator_signature: string
  raw_milk: {
    source_silo_name: string
    quantity: number
    fat: number
  }
  skim_milk?: {
    quantity: number
    fat: number
    destination_silo_name: string
  }
  cream?: {
    quantity: number
    fat: number
    cream_tank: string
  }
}

export interface UpdateSkimmingFormRequest {
  id: string
  tag?: string
  raw_milk?: RawMilkDetails
  skim_milk?: SkimMilkDetails
  cream?: CreamDetails
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
