import { apiRequest } from "@/lib/utils/api-request"

export interface RawMilkIntakeLabTest {
  id: string
  created_at?: string | null
  scientist_id: string
  raw_milk_intake_id: string
  date: string
  organol_eptic: string
  no_water: string
  no_starch: string
  milk_freshness: string
  bacteria_load: string
  accepted: boolean
  updated_at?: string | null
  raw_milk_intake_lab_test_scientist_id_fkey?: any
  raw_milk_intake_lab_test_raw_milk_intake_id_fkey?: any
}

export interface CreateRawMilkIntakeLabTestRequest {
  scientist_id: string
  raw_milk_intake_id: string
  date: string
  organol_eptic: string
  no_water: string
  no_starch: string
  milk_freshness: string
  bacteria_load: string
  accepted: boolean
  updated_at?: string
}

export interface UpdateRawMilkIntakeLabTestRequest extends Partial<CreateRawMilkIntakeLabTestRequest> {
  id: string
}

export interface RawMilkIntakeLabTestResponse {
  statusCode: number
  message: string
  data: RawMilkIntakeLabTest
}

export interface RawMilkIntakeLabTestsResponse {
  statusCode: number
  message: string
  data: RawMilkIntakeLabTest[]
}

export const rawMilkIntakeLabTestApi = {
  async getAll() {
    return await apiRequest<RawMilkIntakeLabTestsResponse>("/raw-milk-intake-lab-test", { 
      method: "GET",
      headers: { accept: "application/json" },
    })
  },

  async create(payload: CreateRawMilkIntakeLabTestRequest) {
    return await apiRequest<RawMilkIntakeLabTestResponse>("/raw-milk-intake-lab-test", {
      method: "POST",
      headers: { 
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  },

  async update(payload: UpdateRawMilkIntakeLabTestRequest) {
    return await apiRequest<RawMilkIntakeLabTestResponse>("/raw-milk-intake-lab-test", {
      method: "PATCH",
      headers: { 
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  },

  async delete(id: string) {
    return await apiRequest(`/raw-milk-intake-lab-test/${id}`, { 
      method: "DELETE",
      headers: { accept: "application/json" },
    })
  },
}


