import { apiRequest } from "@/lib/utils/api-request"

// Updated Types based on the actual API response structure
export interface FilmaticLinesForm2 {
  id?: string
  created_at?: string
  updated_at?: string | null
  approved: boolean | null
  process_id: string | null
  date: string
  tag?: string
  day_shift_opening_bottles?: number
  day_shift_closing_bottles?: number
  night_shift_opening_bottles?: number
  night_shift_closing_bottles?: number
  day_shift_waste_bottles?: number
  night_shift_waste_bottles?: number
  groups?: {
    id?: string
    group_a?: string[]
    group_b?: string[]
    group_c?: string[]
    manager_id?: string
    created_at?: string
    updated_at?: string
  } | null
  filmatic_line_form_2_day_shift: FilmaticLinesForm2DayShift[]
  filmatic_line_form_2_night_shift: FilmaticLinesForm2NightShift[]
}

export interface FilmaticLinesForm2DayShift {
  id?: string
  created_at?: string
  updated_at?: string | null
  operator_id: string
  supervisor_approve: boolean
  filmatic_line_form_2_day_shift_details?: FilmaticLinesForm2DayShiftDetails[]
}

export interface FilmaticLinesForm2NightShift {
  id?: string
  created_at?: string
  updated_at?: string | null
  operator_id: string
  supervisor_approve: boolean
  filmatic_line_form_2_night_shift_details?: FilmaticLinesForm2NightShiftDetails[]
}

export interface FilmaticLinesForm2DayShiftDetails {
  id?: string
  time: string
  target: number
  pallets: number
  setbacks: string
  created_at?: string
  updated_at?: string | null
  filmatic_line_form_2_day_shift_details_stoppage_time?: FilmaticLinesForm2StoppageTime[]
}

export interface FilmaticLinesForm2NightShiftDetails {
  id?: string
  time: string
  target: number
  pallets: number
  setbacks: string
  created_at?: string
  updated_at?: string | null
  filmatic_line_form_2_night_shift_details_stoppage_time?: FilmaticLinesForm2StoppageTime[]
}

export interface FilmaticLinesForm2StoppageTime {
  id?: string
  capper_1_hours?: number
  capper_2_hours?: number
  sleever_1_hours?: number
  sleever_2_hours?: number
  shrink_1_hours?: number
  shrink_2_hours?: number
  capper_1?: number
  capper_2?: number
  sleever_1?: number
  sleever_2?: number
  shrink_1?: number
  shrink_2?: number
  created_at?: string
  updated_at?: string | null
}

// Request Types
export interface CreateFilmaticLinesForm2Request {
  approved: boolean
  process_id: string
  date: string
  day_shift_opening_bottles?: number
  day_shift_closing_bottles?: number
  night_shift_opening_bottles?: number
  night_shift_closing_bottles?: number
  day_shift_waste_bottles?: number
  night_shift_waste_bottles?: number
  groups?: {
    group_a?: string[]
    group_b?: string[]
    group_c?: string[]
    manager_id?: string
  }
  day_shift?: {
    supervisor_approve: boolean
    operator_id: string
    details: Array<{
      time: string
      pallets: number
      target: number
      setbacks: string
      stoppage_time: Array<{
        capper_1?: number
        capper_2?: number
        sleever_1?: number
        sleever_2?: number
        shrink_1?: number
        shrink_2?: number
      }>
    }>
  }
  night_shift?: {
    supervisor_approve: boolean
    operator_id: string
    details: Array<{
      time: string
      pallets: number
      target: number
      setbacks: string
      stoppage_time: Array<{
        capper_1?: number
        capper_2?: number
        sleever_1?: number
        sleever_2?: number
        shrink_1?: number
        shrink_2?: number
      }>
    }>
  }
}

// API Functions
export const filmaticLinesForm2Api = {
  // Get all forms
  getForms: async () => {
    const response = await apiRequest<{statusCode: number, message: string, data: FilmaticLinesForm2[]}>('/filmatic-lines-form-2', {
      method: 'GET',
    })
    return response.data
  },

  // Get form by ID
  getForm: async (id: string) => {
    return apiRequest<FilmaticLinesForm2>(`/filmatic-lines-form-2/${id}`, {
      method: 'GET',
    })
  },

  // Create new form
  createForm: async (data: CreateFilmaticLinesForm2Request) => {
    return apiRequest<FilmaticLinesForm2>('/filmatic-lines-form-2', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update form
  updateForm: async (id: string, data: Partial<CreateFilmaticLinesForm2Request>) => {
    return apiRequest<FilmaticLinesForm2>(`/filmatic-lines-form-2`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Delete form
  deleteForm: async (id: string) => {
    return apiRequest<void>(`/filmatic-lines-form-2/${id}`, {
      method: 'DELETE',
    })
  },
}

