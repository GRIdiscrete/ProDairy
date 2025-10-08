import { apiRequest } from "@/lib/utils/api-request"

export interface LabTestPostProcessEntity {
  id: string
  created_at: string
  updated_at: string
  scientist_id: string
  batch_number: number
  time: string
  temperature: number
  alcohol: number
  phosphatase: number
  res: number
  cob: boolean
  ph: number
  ci_si: string
  lr_snf: string
  acidity: number
  coffee: string
  turbidity: boolean
  remarks: string
}

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export interface CreateLabTestPostProcessRequest {
  scientist_id: string
  batch_number: number
  time: string
  temperature: number
  alcohol: number
  phosphatase: number
  res: number
  cob: boolean
  ph: number
  ci_si: string
  lr_snf: string
  acidity: number
  coffee: string
  turbidity: boolean
  remarks: string
}

export const labTestPostProcessApi = {
  getAll: async (): Promise<ApiEnvelope<LabTestPostProcessEntity[]>> => {
    return apiRequest<ApiEnvelope<LabTestPostProcessEntity[]>>("/lab-test-post-process")
  },
  create: async (payload: CreateLabTestPostProcessRequest): Promise<ApiEnvelope<LabTestPostProcessEntity>> => {
    return apiRequest<ApiEnvelope<LabTestPostProcessEntity>>("/lab-test-post-process", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  },
}


