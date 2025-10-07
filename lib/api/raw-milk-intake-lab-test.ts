import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface RawMilkIntakeLabTest {
  id: string
  created_at: string
  scientist_id: string
  drivers_form_id: string | null
  date: string
  organol_eptic: string | null
  no_water: string | null
  no_starch: string | null
  milk_freshness: string | null
  bacteria_load: string | null
  accepted: boolean
  updated_at: string | null
  alcohol: number | null
  cob: boolean | null
  remarks: string | null
}

export interface CreateRawMilkIntakeLabTestRequest {
  scientist_id: string
  drivers_form_id: string
  date: string
  organol_eptic?: string
  no_water?: string
  no_starch?: string
  milk_freshness?: string
  bacteria_load?: string
  accepted: boolean
  alcohol?: number
  cob?: boolean
  remarks?: string
}

export interface UpdateRawMilkIntakeLabTestRequest extends CreateRawMilkIntakeLabTestRequest {
  id: string
  updated_at: string
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
  // Get all lab tests
  async getRawMilkIntakeLabTests(params?: { drivers_form_id?: string }): Promise<RawMilkIntakeLabTestsResponse> {
    const queryParams = params?.drivers_form_id ? `?drivers_form_id=${params.drivers_form_id}` : ''
    return apiRequest(API_CONFIG.ENDPOINTS.RAW_MILK_INTAKE_LAB_TEST + queryParams)
  },

  // Get single lab test
  async getRawMilkIntakeLabTest(id: string): Promise<RawMilkIntakeLabTestResponse> {
    return apiRequest(`${API_CONFIG.ENDPOINTS.RAW_MILK_INTAKE_LAB_TEST}/${id}`)
  },

  // Create new lab test
  async createRawMilkIntakeLabTest(testData: CreateRawMilkIntakeLabTestRequest): Promise<RawMilkIntakeLabTestResponse> {
    const requestData = {
      ...testData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return apiRequest(API_CONFIG.ENDPOINTS.RAW_MILK_INTAKE_LAB_TEST, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  // Update existing lab test
  async updateRawMilkIntakeLabTest(testData: UpdateRawMilkIntakeLabTestRequest): Promise<RawMilkIntakeLabTestResponse> {
    const requestData = {
      ...testData,
      updated_at: new Date().toISOString(),
    }

    return apiRequest(API_CONFIG.ENDPOINTS.RAW_MILK_INTAKE_LAB_TEST, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    })
  },

  // Delete lab test
  async deleteRawMilkIntakeLabTest(id: string): Promise<{ statusCode: number; message: string }> {
    return apiRequest(`${API_CONFIG.ENDPOINTS.RAW_MILK_INTAKE_LAB_TEST}/${id}`, {
      method: 'DELETE',
    })
  },
}


