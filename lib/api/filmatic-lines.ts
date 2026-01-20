import { apiRequest } from "@/lib/utils/api-request"

// Types
export interface FilmaticLinesProductionSheet {
  id: string
  created_at: string
  updated_at: string | null
  approved_by: string
  date: string
  shift: string
  product: string
  tag: string
  details: string | null
  filmatic_lines_production_sheet_details_fkey?: FilmaticLinesProductionSheetDetail | null
  filmatic_lines_production_sheet_approved_by_fkey?: {
    id: string
    role_name: string
    views: string[]
    role_operations: string[]
    user_operations: string[]
    devices_operations: string[]
    process_operations: string[]
    supplier_operations: string[]
    silo_item_operations: string[]
    machine_item_operations: string[]
    created_at: string
    updated_at: string
  }
}

export interface CreateFilmaticLinesProductionSheetRequest {
  approved_by: string
  date: string
  shift: string
  product: string
  tag: string
}

export interface UpdateFilmaticLinesProductionSheetRequest {
  id: string
  approved_by: string
  date: string
  shift: string
  product: string
  tag: string
}

export interface FilmaticLinesProductionSheetDetail {
  id: string
  created_at: string
  updated_at: string | null
  filmatic_lines_production_sheet_id: string
  day_shift_hours: string
  no_of_pallets: number
  hourly_target: number
  variance: number
  reason_for_variance: string
  operator: string | null
  operator_signature: string | null
  supervisor: string | null
  supervisor_signature: string | null
  bottles_reconciliation?: FilmaticLinesBottlesReconciliation | null
  milk_reconciliation?: FilmaticLinesMilkReconciliation | null
  stoppages?: string | null
  filmatic_lines_production_sheet_details_stoppages_fkey?: FilmaticLinesStoppageTimeMinutes | null
  filmatic_lines_production_she_filmatic_lines_production_sh_fkey?: FilmaticLinesProductionSheet
}

export interface CreateFilmaticLinesProductionSheetDetailRequest {
  filmatic_lines_production_sheet_id: string
  day_shift_hours: string
  no_of_pallets: number
  hourly_target: number
  variance: number
  reason_for_variance: string
}

export interface UpdateFilmaticLinesProductionSheetDetailRequest {
  id: string
  filmatic_lines_production_sheet_id: string
  day_shift_hours: string
  no_of_pallets: number
  hourly_target: number
  variance: number
  reason_for_variance: string
}

export interface FilmaticLinesBottlesReconciliation {
  id: string
  created_at: string
  updated_at: string
  filmatic_lines_production_sheet_details_id: string
  shift: string
  opening: number
  added: number
  closing: number
  wastes: number
  damages: number
}

export interface CreateFilmaticLinesBottlesReconciliationRequest {
  filmatic_lines_production_sheet_details_id: string
  shift: string
  opening: number
  added: number
  closing: number
  wastes: number
  damages: number
}

export interface UpdateFilmaticLinesBottlesReconciliationRequest {
  id: string
  filmatic_lines_production_sheet_details_id: string
  shift: string
  opening: number
  added: number
  closing: number
  wastes: number
  damages: number
}

export interface FilmaticLinesMilkReconciliation {
  id: string
  created_at: string
  updated_at: string | null
  filmatic_lines_production_sheet_details_id: string
  shift: string
  opening: number
  added: number
  closing: number
  total: number
  transfer: number
}

export interface CreateFilmaticLinesMilkReconciliationRequest {
  filmatic_lines_production_sheet_details_id: string
  shift: string
  opening: number
  added: number
  closing: number
  total: number
  transfer: number
}

export interface UpdateFilmaticLinesMilkReconciliationRequest {
  id: string
  filmatic_lines_production_sheet_details_id: string
  shift: string
  opening: number
  added: number
  closing: number
  total: number
  transfer: number
}

export interface FilmaticLinesStoppageTimeMinutes {
  id: string
  created_at: string
  updated_at: string | null
  filmatic_lines_production_sheet_details_id: string
  product_1: number
  product_2: number
  filler_1: number
  filler_2: number
  capper_1: number
  capper_2: number
  sleever_1: number
  sleever_2: number
  shrink_1: number
  shrink_2: number
  filmatic_lines_production_sh_filmatic_lines_production_sh_fkey1?: FilmaticLinesProductionSheetDetail
}

export interface CreateFilmaticLinesStoppageTimeMinutesRequest {
  filmatic_lines_production_sheet_details_id: string
  product_1: number
  product_2: number
  filler_1: number
  filler_2: number
  capper_1: number
  capper_2: number
  sleever_1: number
  sleever_2: number
  shrink_1: number
  shrink_2: number
}

export interface UpdateFilmaticLinesStoppageTimeMinutesRequest {
  id: string
  filmatic_lines_production_sheet_details_id: string
  product_1: number
  product_2: number
  filler_1: number
  filler_2: number
  capper_1: number
  capper_2: number
  sleever_1: number
  sleever_2: number
  shrink_1: number
  shrink_2: number
}

// API Functions
export const filmaticLinesApi = {
  // Production Sheet APIs
  createProductionSheet: async (data: CreateFilmaticLinesProductionSheetRequest) => {
    return apiRequest<FilmaticLinesProductionSheet>('/filmatic-lines-production-sheet', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getProductionSheets: async () => {
    return apiRequest<FilmaticLinesProductionSheet[]>('/filmatic-lines-production-sheet', {
      method: 'GET',
    })
  },

  getProductionSheet: async (id: string) => {
    return apiRequest<FilmaticLinesProductionSheet>(`/filmatic-lines-production-sheet/${id}`, {
      method: 'GET',
    })
  },

  updateProductionSheet: async (data: UpdateFilmaticLinesProductionSheetRequest) => {
    return apiRequest<FilmaticLinesProductionSheet>('/filmatic-lines-production-sheet', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteProductionSheet: async (id: string) => {
    return apiRequest<void>(`/filmatic-lines-production-sheet/${id}`, {
      method: 'DELETE',
    })
  },

  // Production Sheet Detail APIs
  createProductionSheetDetail: async (data: CreateFilmaticLinesProductionSheetDetailRequest) => {
    return apiRequest<FilmaticLinesProductionSheetDetail>('/filmatic-lines-production-sheet-detail', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getProductionSheetDetails: async () => {
    return apiRequest<FilmaticLinesProductionSheetDetail[]>('/filmatic-lines-production-sheet-detail', {
      method: 'GET',
    })
  },

  getProductionSheetDetailsBySheet: async (sheetId: string) => {
    return apiRequest<FilmaticLinesProductionSheetDetail[]>(`/filmatic-lines-production-sheet-detail/sheet/${sheetId}`, {
      method: 'GET',
    })
  },

  updateProductionSheetDetail: async (data: UpdateFilmaticLinesProductionSheetDetailRequest) => {
    return apiRequest<FilmaticLinesProductionSheetDetail>('/filmatic-lines-production-sheet-detail', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteProductionSheetDetail: async (id: string) => {
    return apiRequest<void>(`/filmatic-lines-production-sheet-detail/${id}`, {
      method: 'DELETE',
    })
  },

  // Bottles Reconciliation APIs
  createBottlesReconciliation: async (data: CreateFilmaticLinesBottlesReconciliationRequest) => {
    return apiRequest<FilmaticLinesBottlesReconciliation>('/filmatic-lines-production-sheet-details-bottles-reconciliation', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getBottlesReconciliations: async () => {
    return apiRequest<FilmaticLinesBottlesReconciliation[]>('/filmatic-lines-production-sheet-details-bottles-reconciliation', {
      method: 'GET',
    })
  },

  getBottlesReconciliationsByDetail: async (detailId: string) => {
    return apiRequest<FilmaticLinesBottlesReconciliation[]>(`/filmatic-lines-production-sheet-details-bottles-reconciliation/detail/${detailId}`, {
      method: 'GET',
    })
  },

  updateBottlesReconciliation: async (data: UpdateFilmaticLinesBottlesReconciliationRequest) => {
    return apiRequest<FilmaticLinesBottlesReconciliation>('/filmatic-lines-production-sheet-details-bottles-reconciliation', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteBottlesReconciliation: async (id: string) => {
    return apiRequest<void>(`/filmatic-lines-production-sheet-details-bottles-reconciliation/${id}`, {
      method: 'DELETE',
    })
  },

  // Milk Reconciliation APIs
  createMilkReconciliation: async (data: CreateFilmaticLinesMilkReconciliationRequest) => {
    return apiRequest<FilmaticLinesMilkReconciliation>('/filmatic-lines-production-sheet-details-milk-reconciliation', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getMilkReconciliations: async () => {
    return apiRequest<FilmaticLinesMilkReconciliation[]>('/filmatic-lines-production-sheet-details-milk-reconciliation', {
      method: 'GET',
    })
  },

  getMilkReconciliationsByDetail: async (detailId: string) => {
    return apiRequest<FilmaticLinesMilkReconciliation[]>(`/filmatic-lines-production-sheet-details-milk-reconciliation/detail/${detailId}`, {
      method: 'GET',
    })
  },

  updateMilkReconciliation: async (data: UpdateFilmaticLinesMilkReconciliationRequest) => {
    return apiRequest<FilmaticLinesMilkReconciliation>('/filmatic-lines-production-sheet-details-milk-reconciliation', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteMilkReconciliation: async (id: string) => {
    return apiRequest<void>(`/filmatic-lines-production-sheet-details-milk-reconciliation/${id}`, {
      method: 'DELETE',
    })
  },

  // Stoppage Time Minutes APIs
  createStoppageTimeMinutes: async (data: CreateFilmaticLinesStoppageTimeMinutesRequest) => {
    return apiRequest<FilmaticLinesStoppageTimeMinutes>('/filmatic-lines-production-sheet-details-stoppage-time-minutes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getStoppageTimeMinutes: async () => {
    return apiRequest<FilmaticLinesStoppageTimeMinutes[]>('/filmatic-lines-production-sheet-details-stoppage-time-minutes', {
      method: 'GET',
    })
  },

  getStoppageTimeMinutesByDetail: async (detailId: string) => {
    return apiRequest<FilmaticLinesStoppageTimeMinutes[]>(`/filmatic-lines-production-sheet-details-stoppage-time-minutes/detail/${detailId}`, {
      method: 'GET',
    })
  },

  updateStoppageTimeMinutes: async (data: UpdateFilmaticLinesStoppageTimeMinutesRequest) => {
    return apiRequest<FilmaticLinesStoppageTimeMinutes>('/filmatic-lines-production-sheet-details-stoppage-time-minutes', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteStoppageTimeMinutes: async (id: string) => {
    return apiRequest<void>(`/filmatic-lines-production-sheet-details-stoppage-time-minutes/${id}`, {
      method: 'DELETE',
    })
  },
}
