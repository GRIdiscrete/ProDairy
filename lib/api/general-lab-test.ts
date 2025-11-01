// API client for General Lab Test

import { apiRequest } from "../utils/api-request"




export interface GeneralLabTest {
  id?: string
  created_at?: string
  updated_at?: string | null
  source_silo: string
  time: string
  temperature: number
  fat: number
  protein: number
  lactometer_reading: number
  snf: number
  ts: number
  ph: number
  alcohol: string
  ta: number
  ot: string
  density: number
  antibiotics: string
  scc: number
  resazurin: number
  sedimentation_index: string
  creaming_index: number
  phosphate: string
  clot_on_boil: string
  coffee: string
  hydrogen_peroxide: string
  turbidity: number
  brix: number
  viscosity: number
  moisture: number
  salt: number
  curd: string
  appearance_body: string
  consistency: string
  color: string
  taste: string
  retention_sample_taken: boolean
  percent_raw_milk: number
  coliforms: string
  tbc: number
  y_m: number
  e_coli: string
  s_aureus: string
  salmonella: string
  ts_duplicate: number
  tts: number
  tms: number
  psychrotrophs: number
  atp: number
  tds: number
  hardness: number
  chlorine: number
  p_alkalinity: number
  oh_alkalinity: number
  chlorides: number
  sulphites: string
  calcium_hardness: number
  analyst: string
}

export interface GeneralLabTestListResponse {
  statusCode: number
  message: string
  data: GeneralLabTest[]
}

export interface GeneralLabTestSingleResponse {
  statusCode: number
  message: string
  data: GeneralLabTest
}

export const generalLabTestApi = {
  getAll: async (): Promise<GeneralLabTestListResponse> => {
    return apiRequest<GeneralLabTestListResponse>("/lab-test-main")
  },
  create: async (payload: GeneralLabTest): Promise<GeneralLabTestSingleResponse> => {
    return apiRequest<GeneralLabTestSingleResponse>("/lab-test-main", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  },
  update: async (id: string, payload: GeneralLabTest): Promise<GeneralLabTestSingleResponse> => {
    return apiRequest<GeneralLabTestSingleResponse>(`/lab-test-main`, {
      method: "PATCH",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  },
  delete: async (id: string): Promise<{ statusCode: number; message: string }> => {
    return apiRequest<{ statusCode: number; message: string }>(`/lab-test-main/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
      },
    })
  },
  getById: async (id: string): Promise<GeneralLabTestSingleResponse> => {
    return apiRequest<GeneralLabTestSingleResponse>(`/lab-test-main/${id}`)
  }
}
