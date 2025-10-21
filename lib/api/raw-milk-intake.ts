import { apiRequest } from "@/lib/utils/api-request"

export interface RawMilkIntakeSample {
  supplier_id: string
  amount_collected: number
  unit_of_measure: string
  serial_no: string
}

export interface RawMilkIntakeForm {
  id: string
  created_at: string
  operator_id?: string
  operator_signature: string
  date: string
  quantity_received: number
  drivers_form_id: string
  destination_silo_id: string
  samples_collected: RawMilkIntakeSample[]
  updated_at?: string
  raw_milk_intake_form_operator_id_fkey?: any
  raw_milk_intake_form_drivers_form_id_fkey?: {
    id: string
    driver: string
    end_date: string
    rejected: boolean
    delivered: boolean
    created_at: string
    start_date: string
    updated_at: string
    collected_products: Array<{
      supplier_id: string
      "e-sign-driver": string
      "e-sign-supplier": string
      raw_material_id: string
      unit_of_measure: string
      collected_amount: number
    }>
  }
  raw_milk_intake_form_destination_silo_id_fkey?: {
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
}

export interface CreateRawMilkIntakeFormRequest {
  id: string
  created_at: string
  operator_id?: string
  operator_signature: string
  date: string
  quantity_received: number
  drivers_form_id: string
  destination_silo_id: string
}

export interface RawMilkIntakeFormResponse {
  statusCode: number
  message: string
  data: RawMilkIntakeForm
}

export interface RawMilkIntakeFormsResponse {
  statusCode: number
  message: string
  data: RawMilkIntakeForm[]
}

const BASE_URL = "https://ckwkcg0o80cckkg0oog8okk8.greatssystems.co.zw"

export const rawMilkIntakeApi = {
  // Get all raw milk intake forms
  getAll: async (): Promise<RawMilkIntakeForm[]> => {
    try {
      const response = await apiRequest<RawMilkIntakeFormsResponse>("/raw-milk-intake-form", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data || []
    } catch (error) {
      console.error("Error fetching raw milk intake forms:", error)
      throw error
    }
  },

  // Get single raw milk intake form by ID
  getById: async (id: string): Promise<RawMilkIntakeForm> => {
    try {
      const response = await apiRequest<RawMilkIntakeFormResponse>(`/raw-milk-intake-form/${id}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching raw milk intake form ${id}:`, error)
      throw error
    }
  },

  // Create new raw milk intake form
  create: async (formData: CreateRawMilkIntakeFormRequest): Promise<RawMilkIntakeFormResponse> => {
    try {
      const response = await apiRequest<RawMilkIntakeFormResponse>("/raw-milk-intake-form", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error("Error creating raw milk intake form:", error)
      throw error
    }
  },

  // Update raw milk intake form
  update: async (id: string, formData: Partial<CreateRawMilkIntakeFormRequest>): Promise<RawMilkIntakeFormResponse> => {
    try {
      // Only send the required fields for PATCH request
      // const updateData = {
      //   id,
      //   operator_signature: formData.operator_signature,
      //   date: formData.date,
      //   quantity_received: formData.quantity_received,
      //   drivers_form_id: formData.drivers_form_id,
      //   destination_silo_id: formData.destination_silo_id,
      //   operator_id: formData.operator_id
      // }

      const response = await apiRequest<RawMilkIntakeFormResponse>("/raw-milk-intake-form", {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      return response
    } catch (error) {
      console.error(`Error updating raw milk intake form ${id}:`, error)
      throw error
    }
  },

  // Delete raw milk intake form
  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest(`/raw-milk-intake-form/${id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      })
    } catch (error) {
      console.error(`Error deleting raw milk intake form ${id}:`, error)
      throw error
    }
  },
}
