import { apiRequest } from "@/lib/utils/api-request"

// Updated Types based on the actual API response structure
export interface FilmaticLinesForm1 {
  id?: string
  created_at?: string
  updated_at?: string | null
  approved: boolean | null
  process_id: string | null
  date: string
  holding_tank_bmt: string
  groups?: {
    id?: string
    group_a?: string[]
    group_b?: string[]
    group_c?: string[]
    manager_id?: string
    created_at?: string
    updated_at?: string
  } | null
  filmatic_line_form_1_day_shift: FilmaticLinesForm1DayShift[]
  filmatic_line_form_1_night_shift: FilmaticLinesForm1NightShift[]
}

export interface FilmaticLinesForm1DayShift {
  supervisor_approve: boolean | null
  operator_id: string
  filmatic_line_form_1_day_shift_details: FilmaticLinesForm1DayShiftDetail[]
}

export interface FilmaticLinesForm1NightShift {
  supervisor_approve: boolean | null
  operator_id: string
  filmatic_line_form_1_night_shift_details: FilmaticLinesForm1NightShiftDetail[]
}

export interface FilmaticLinesForm1DayShiftDetail {
  time: string
  pallets: number
  target: number
  setbacks: string
  filmatic_line_form_1_day_shift_details_stoppage_time: FilmaticLinesForm1StoppageTime[]
}

export interface FilmaticLinesForm1NightShiftDetail {
  time: string
  pallets: number
  target: number
  setbacks: string
  filmatic_line_form_1_night_shift_details_stoppage_time: FilmaticLinesForm1StoppageTime[]
}

export interface FilmaticLinesForm1StoppageTime {
  product_1?: number
  product_2?: number
  filler_1?: number
  filler_2?: number
  capper_1?: number
  capper_2?: number
  sleever_1?: number
  sleever_2?: number
  shrink_1?: number
  shrink_2?: number
}

// Request Types
export interface CreateFilmaticLinesForm1Request {
  approved: boolean
  process_id: string
  date: string
  holding_tank_bmt: string
  day_shift_opening_bottles?: number
  day_shift_closing_bottles?: number
  night_shift_opening_bottles?: number
  night_shift_closing_bottles?: number
  day_shift_waste_bottles?: number
  night_shift_waste_bottles?: number
  groups?: {
    group_a?: string[]
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
        product_1?: number
        product_2?: number
        filler_1?: number
        filler_2?: number
        capper_1?: number
        capper_2?: number
        sleever_1?: number
        sleever_2?: number
        shrink_1?: number
        shrink_2?: number
        product_1_hours?: number
        product_2_hours?: number
        filler_1_hours?: number
        filler_2_hours?: number
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
        product_1?: number
        product_2?: number
        filler_1?: number
        filler_2?: number
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
export const filmaticLinesForm1Api = {
  // Get all forms
  getForms: async () => {
    const response = await apiRequest<{statusCode: number, message: string, data: FilmaticLinesForm1[]}>('/filmatic-lines-form-1', {
      method: 'GET',
    })
    return response.data
  },

  // Get form by ID
  getForm: async (id: string) => {
    return apiRequest<FilmaticLinesForm1>(`/filmatic-lines-form-1/${id}`, {
      method: 'GET',
    })
  },

  // Create new form
  createForm: async (data: CreateFilmaticLinesForm1Request) => {
    return apiRequest<FilmaticLinesForm1>('/filmatic-lines-form-1', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update form
  updateForm: async (id: string, data: Partial<CreateFilmaticLinesForm1Request>) => {
    return apiRequest<FilmaticLinesForm1>(`/filmatic-lines-form-1`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Delete form
  deleteForm: async (id: string) => {
    return apiRequest<void>(`/filmatic-lines-form-1/${id}`, {
      method: 'DELETE',
    })
  },
}
