import { apiRequest } from "@/lib/utils/api-request"

export interface SterilisedMilkProcess {
  id: string
  created_at: string
  updated_at: string | null
  approved_by: string
  operator_id: string
  operator_signature: string
  supervisor_id: string
  supervisor_signature: string
  details: string | null
  filmatic_form_id: string | null
  tag?: string
  sterilised_milk_process_supervisor_id_fkey?: any
  sterilised_milk_process_operator_id_fkey?: any
  sterilised_milk_process_approved_by_fkey?: any
}

export interface CreateSterilisedMilkProcessRequest {
  id?: string
  created_at?: string
  updated_at?: string
  approved_by: string
  operator_id: string
  operator_signature: string
  supervisor_id: string
  supervisor_signature: string
  filmatic_form_id: string
}

export interface SterilisedMilkProcessResponse {
  statusCode: number
  message: string
  data: SterilisedMilkProcess
}

export interface SterilisedMilkProcessesResponse {
  statusCode: number
  message: string
  data: SterilisedMilkProcess[]
}

export interface SterilisedMilkProcessDetails {
  id: string
  created_at: string
  updated_at: string | null
  sterilised_milk_process_id: string
  parameter_name: string
  filling_start_reading: number
  autoclave_start_reading: number
  heating_start_reading: number
  heating_finish_reading: number
  sterilization_start_reading: number
  sterilisation_after_five_six_minutes_reading: number
  sterilisation_finish_reading: number
  precooling_start_reading: number
  precooling_finish_reading: number
  cooling_one_start_reading: number
  cooling_one_finish_reading: number
  cooling_two_start_reading: number
  cooling_two_finish_reading: number
}

export interface CreateSterilisedMilkProcessDetailsRequest extends Omit<SterilisedMilkProcessDetails, "id" | "created_at" | "updated_at"> { }

export interface SterilisedMilkProcessDetailsResponse {
  statusCode: number
  message: string
  data: SterilisedMilkProcessDetails
}

export interface SterilisedMilkProcessDetailsListResponse {
  statusCode: number
  message: string
  data: SterilisedMilkProcessDetails[]
}

export interface FilmaticForm1 {
  id: string
  created_at: string
  updated_at: string | null
  approved: boolean
  process_id: string | null
  date: string
  holding_tank_bmt: string
  day_shift_id: string | null
  night_shift_id: string | null
  day_shift_opening_bottles: number
  day_shift_closing_bottles: number
  night_shift_opening_bottles: number
  night_shift_closing_bottles: number
  day_shift_waste_bottles: number
  night_shift_waste_bottles: number
  filmatic_line_form_1_day_shift_id_fkey?: any
  filmatic_line_form_1_night_shift_id_fkey?: any
}

export interface FilmaticForm1Response {
  statusCode: number
  message: string
  data: FilmaticForm1[]
}

export const sterilisedMilkApi = {
  getAll: async () => {
    return apiRequest<SterilisedMilkProcessesResponse>(`/sterilised-milk-process`, { method: "GET" })
  },
  getById: async (id: string) => {
    return apiRequest<SterilisedMilkProcessResponse>(`/sterilised-milk-process/${id}`, { method: "GET" })
  },
  create: async (body: CreateSterilisedMilkProcessRequest) => {
    return apiRequest<SterilisedMilkProcessResponse>(`/sterilised-milk-process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  },
  update: async (id: string, body: Partial<CreateSterilisedMilkProcessRequest>) => {
    return apiRequest<SterilisedMilkProcessResponse>(`/sterilised-milk-process`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    })
  },
  delete: async (id: string) => {
    return apiRequest(`/sterilised-milk-process/${id}`, { method: "DELETE" })
  },

  // Details endpoints
  getAllDetails: async () => {
    return apiRequest<SterilisedMilkProcessDetailsListResponse>(`/sterilised-milk-process-details`, { method: "GET" })
  },
  createDetails: async (body: CreateSterilisedMilkProcessDetailsRequest) => {
    return apiRequest<SterilisedMilkProcessDetailsResponse>(`/sterilised-milk-process-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  },
  updateDetails: async (id: string, body: Partial<CreateSterilisedMilkProcessDetailsRequest>) => {
    return apiRequest<SterilisedMilkProcessDetailsResponse>(`/sterilised-milk-process-details`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    })
  },
  deleteDetails: async (id: string) => {
    return apiRequest(`/sterilised-milk-process-details/${id}`, { method: "DELETE" })
  },

  // Filmatic Form 1 endpoints
  getFilmaticForms: async () => {
    return apiRequest<FilmaticForm1Response>(`/filmatic-lines-form-1`, { method: "GET" })
  },
}


