import { apiRequest } from "@/lib/utils/api-request"

export interface Production {
  time: string
  temp_hot_water: number
  temp_product_pasteurisation: number
  homogenisation_pressure_stage_1: number
  homogenisation_pressure_stage_2: number
  total_homogenisation_pressure: number
  temperature_product_out: number
  process_id: string
  output_target: {
    value: number
    unit_of_measure: string
  }
}

export interface PasteurizingForm {
  id: string
  created_at: string
  updated_at?: string
  operator?: string
  date?: string
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
  // Related data from API response
  steri_milk_pasteurizing_form_operator_fkey?: any
  steri_milk_pasteurizing_form_machine_fkey?: {
    id: string
    name: string
    status: string
    category: string
    location: string
    counter_id?: string
    created_at: string
    updated_at: string
    cases_packed?: number
    serial_number: string
  }
  steri_milk_pasteurizing_form_source_silo_fkey?: {
    id: string
    name: string
    status: string
    capacity: number
    category: string
    location: string
    created_at: string
    updated_at: string
    milk_volume: number
    serial_number: string
  }
  steri_milk_pasteurizing_form_bmt_fkey?: {
    id: string
    volume: number
    product?: string
    created_at: string
    updated_at?: string
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

export interface CreatePasteurizingFormRequest {
  operator: string
  date: string
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
