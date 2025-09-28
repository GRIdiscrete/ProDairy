import { apiRequest } from "@/lib/utils/api-request"

// Types based on the API structure
export interface FilmaticLinesForm2 {
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
  // Relationships
  filmatic_line_form_2_day_shift_id_fkey?: FilmaticLinesForm2DayShift | null
  filmatic_line_form_2_night_shift_id_fkey?: FilmaticLinesForm2NightShift | null
}

export interface FilmaticLinesForm2DayShift {
  id: string
  created_at: string
  updated_at: string | null
  operator_id: string
  shift_details: string
  supervisor_approve: boolean
  filmatic_line_form_2_id: string
  // Relationships
  filmatic_line_form_2_day_shift_shift_details_fkey?: FilmaticLinesForm2DayShiftDetails | null
}

export interface FilmaticLinesForm2NightShift {
  id: string
  created_at: string
  updated_at: string | null
  operator_id: string
  shift_details: string
  supervisor_approve: boolean
  filmatic_line_form_2_id: string
  // Relationships
  filmatic_line_form_2_night_shift_shift_details_fkey?: FilmaticLinesForm2NightShiftDetails | null
}

export interface FilmaticLinesForm2DayShiftDetails {
  id: string
  time: string
  target: number
  pallets: number
  setbacks: string
  created_at: string
  updated_at: string | null
  day_shift_id: string
  stoppage_time_id: string | null
  // Relationships
  filmatic_line_form_2_day_shift_details_stoppage_time_id_fkey?: FilmaticLinesForm2StoppageTime | null
}

export interface FilmaticLinesForm2NightShiftDetails {
  id: string
  time: string
  target: number
  pallets: number
  setbacks: string
  created_at: string
  updated_at: string | null
  night_shift_id: string
  stoppage_time_id: string | null
  // Relationships
  filmatic_line_form_2_night_shift_details_stoppage_time_id_fkey?: FilmaticLinesForm2StoppageTime | null
}

export interface FilmaticLinesForm2StoppageTime {
  id: string
  capper_1: number | null
  capper_2: number | null
  sleever_1: number | null
  sleever_2: number | null
  shrink_1: number | null
  shrink_2: number | null
  created_at: string
  updated_at: string | null
  filmatic_line_form_2_day_shift_details_id?: string | null
  filmatic_line_form_2_night_shift_details_id?: string | null
}

// Request Types
export interface CreateFilmaticLinesForm2Request {
  approved: boolean
  process_id: string
  date: string
  holding_tank_bmt: string
  day_shift_opening_bottles: number
  day_shift_closing_bottles: number
  night_shift_opening_bottles: number
  night_shift_closing_bottles: number
  day_shift_waste_bottles: number
  night_shift_waste_bottles: number
  day_shift?: {
    supervisor_approve: boolean
    operator_id: string
    shift_details: {
      time: string
      pallets: number
      target: number
      setbacks: string
      stoppage_time: {
        capper_1: number
        capper_2: number
        sleever_1: number
        sleever_2: number
        shrink_1: number
        shrink_2: number
      }
    }
  }
  night_shift?: {
    supervisor_approve: boolean
    operator_id: string
    shift_details: {
      time: string
      pallets: number
      target: number
      setbacks: string
      stoppage_time: {
        capper_1: number
        capper_2: number
        sleever_1: number
        sleever_2: number
        shrink_1: number
        shrink_2: number
      }
    }
  }
}

// API Functions
export const filmaticLinesForm2Api = {
  // Get all forms
  getForms: async () => {
    return apiRequest<FilmaticLinesForm2[]>('/filmatic-lines-form-2', {
      method: 'GET',
    })
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
    return apiRequest<FilmaticLinesForm2>(`/filmatic-lines-form-2/${id}`, {
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

