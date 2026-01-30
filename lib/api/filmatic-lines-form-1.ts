import { apiRequest } from "@/lib/utils/api-request"

// Updated Types based on the actual API response structure
export interface FilmaticLinesForm1 {
  id?: string
  tag?: string
  created_at?: string
  updated_at?: string | null
  approved: boolean | null
  process_id: string | null
  date: string
  holding_tank_bmt: string
  groups?: {
    id?: string
    tag?: string
    group_a?: string[]
    group_b?: string[]
    group_c?: string[]
    manager_id?: string
    created_at?: string
    updated_at?: string
  } | null
  day_shift_opening_bottles?: number | null
  night_shift_opening_bottles?: number | null
  day_shift_closing_bottles?: number | null
  night_shift_closing_bottles?: number | null
  day_shift_waste_bottles?: number | null
  night_shift_waste_bottles?: number | null
  day_shift_received_bottles?: number | null
  night_shift_received_bottles?: number | null
  day_shift_damaged_bottles?: number | null
  night_shift_damaged_bottles?: number | null
  day_shift_foiled_bottles?: number | null
  night_shift_foiled_bottles?: number | null
  transferrable_milk?: number | null
  day_shift_id?: FilmaticLinesForm1Shift | null
  night_shift_id?: FilmaticLinesForm1Shift | null
}

export interface FilmaticLinesForm1Shift {
  id?: string
  supervisor_approve: boolean | null
  operator_id: string
  shift_details: FilmaticLinesForm1ShiftDetail | null
}

export interface FilmaticLinesForm1ShiftDetail {
  id?: string
  time: string
  target: number
  pallets: number
  setbacks: string
  stoppage_time_id: FilmaticLinesForm1StoppageTime | null
}

export interface FilmaticLinesForm1StoppageTime {
  id?: string
  product_1?: number | null
  product_2?: number | null
  filler_1?: number | null
  filler_2?: number | null
  capper_1?: number | null
  capper_2?: number | null
  sleever_1?: number | null
  sleever_2?: number | null
  shrink_1?: number | null
  shrink_2?: number | null
  product_1_hours?: number | null
  product_2_hours?: number | null
  filler_1_hours?: number | null
  filler_2_hours?: number | null
}

// Request Types
export interface CreateFilmaticLinesForm1Request {
  approved: boolean
  process_id: string
  date: string
  holding_tank_bmt: string
  day_shift_opening_bottles?: number | null
  day_shift_closing_bottles?: number | null
  night_shift_opening_bottles?: number | null
  night_shift_closing_bottles?: number | null
  day_shift_waste_bottles?: number | null
  night_shift_waste_bottles?: number | null
  groups?: {
    id?: string
    group_a?: string[]
    group_b?: string[]
    group_c?: string[]
    manager_id?: string
  }
  day_shift?: {
    id?: string
    supervisor_approve: boolean
    operator_id: string
    shift_details: {
      id?: string
      time: string
      pallets: number
      target: number
      setbacks: string
      stoppage_time_id: {
        id?: string
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
      }
    }
  } | null
  night_shift?: {
    id?: string
    supervisor_approve: boolean
    operator_id: string
    shift_details: {
      id?: string
      time: string
      pallets: number
      target: number
      setbacks: string
      stoppage_time_id: {
        id?: string
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
      }
    }
  } | null
}

// API Functions
export const filmaticLinesForm1Api = {
  // Get all forms
  getForms: async () => {
    const response = await apiRequest<{ statusCode: number, message: string, data: FilmaticLinesForm1[] }>('/filmatic-lines-form-1', {
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
