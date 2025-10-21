import { apiRequest } from "@/lib/utils/api-request"

export interface DriverFormLabTest {
  id: string
  created_at?: string | null
  scientist_id: string
  drivers_form_id: string
  date: string
  organol_eptic: string
  no_water?: string | null
  no_starch: string
  milk_freshness?: string | null
  bacteria_load: string
  accepted: boolean
  updated_at?: string | null
  driver_form_lab_test_scientist_id_fkey?: any
  driver_form_lab_test_drivers_form_id_fkey?: any
}

export interface CreateDriverFormLabTestRequest {
  scientist_id: string
  collected_product_id: string
  date: string
  organol_eptic: string
  no_water?: string
  no_starch: string
  milk_freshness?: string
  bacteria_load: string
  accepted: boolean
}

export interface UpdateDriverFormLabTestRequest extends Partial<CreateDriverFormLabTestRequest> {
  id: string
}

export interface DriverFormLabTestResponse {
  statusCode: number
  message: string
  data: DriverFormLabTest
}

export interface DriverFormLabTestsResponse {
  statusCode: number
  message: string
  data: DriverFormLabTest[]
}

export const driverFormLabTestApi = {
  async getAll() {
    return await apiRequest<DriverFormLabTestsResponse>("/driver-lab-test", { 
      method: "GET",
      headers: { accept: "application/json" },
    })
  },

  async create(payload: CreateDriverFormLabTestRequest) {
    return await apiRequest<DriverFormLabTestResponse>("/driver-lab-test", {
      method: "POST",
      headers: { 
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  },

  async update(payload: UpdateDriverFormLabTestRequest) {
    return await apiRequest<DriverFormLabTestResponse>("/driver-lab-test", {
      method: "PATCH",
      headers: { 
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  },

  async delete(id: string) {
    return await apiRequest(`/driver-lab-test/${id}`, { 
      method: "DELETE",
      headers: { accept: "application/json" },
    })
  },
}
