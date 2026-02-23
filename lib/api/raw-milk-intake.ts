import { apiRequest } from '@/lib/utils/api-request'

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

// ── New API response types ─────────────────────────────────────────────────────

/** Detail entry returned in GET /raw-milk-intake-2 */
export interface RawMilkIntakeDetail {
  id?: string
  created_at?: string
  updated_at?: string | null
  raw_milk_intake_form_2_id?: string
  truck_compartment_number: number
  silo_name: string
  /** Time string e.g. "10:27:22" */
  flow_meter_start?: string | null
  flow_meter_start_reading?: number | null
  /** Time string e.g. "00:30:00", null if not yet recorded */
  flow_meter_end?: string | null
  flow_meter_end_reading?: number | null
  /** Only present on some API endpoints; derive from readings when absent */
  quantity?: number | null
  status?: string | null
}

/** Main form record returned from GET /raw-milk-intake-2 */
export interface RawMilkIntakeForm {
  id: string
  /** Not always present in list response */
  created_at?: string
  updated_at?: string | null
  /** New API returns operator as an object */
  operator: string | { first_name: string; last_name: string }
  truck: string
  tag?: string
  updated_by?: string | null
  details: RawMilkIntakeDetail[]
}

// ── Tested-trucks response types ──────────────────────────────────────────────

/** One truck ready for intake from GET /raw-milk-intake-2/tested-trucks */
export interface TestedTruck {
  truck: string
  route: string
  driver_first_name: string
  driver_last_name: string
}

/** One voucher contribution inside a compartment */
export interface VoucherContribution {
  volume: number
  voucher_tag: string
  voucher_date: string
  supplier_tank: string
  supplier_last_name: string
  supplier_first_name: string
}

/** Compartment returned from GET /raw-milk-intake-2/tested-truck/<truck_number> */
export interface TruckCompartment {
  truck_number: string
  truck_compartment_number: number
  route_name: string
  driver_first_name: string
  driver_last_name: string
  total_compartment_volume: number
  voucher_contributions: VoucherContribution[]
}

// Legacy alias kept for any remaining references
export type TruckPendingIntake = TruckCompartment

// ── Request types ─────────────────────────────────────────────────────────────

export interface CreateDetailRequest {
  truck_compartment_number: number
  silo_name: string
  flow_meter_start_reading?: number | null
  flow_meter_end_reading?: number | null
  quantity?: number | null
  status?: string | null
}

export interface CreateRawMilkIntakeFormRequest {
  id?: string
  operator: string
  truck: string
  details: CreateDetailRequest[]
}

// ── Legacy types (kept for backward compatibility) ────────────────────────────

export interface RawMilkIntakePendingVoucher {
  id: string
  tag: string
  date: string
  route: string
  supplier: string
  truck_number: string
  truck_compartment_number: number
  driver: string
  driver_first_name: string
  driver_last_name: string
  driver_signature: string
  time_in: string
  time_out: string
  ot_result: string | null
  cob_result: string | null
  remark: string | null
  lab_test: any | null
  number_of_compartments: number | null
  route_total: number | null
  created_at: string
  updated_at: string
}

// ── API client ────────────────────────────────────────────────────────────────

export const rawMilkIntakeApi = {
  /** GET /raw-milk-intake-2 — list all forms */
  getAll: async (params: { filters?: Record<string, any> } = {}) => {
    const { filters } = params
    if (!filters || Object.keys(filters).length === 0) {
      return apiRequest<ApiResponse<RawMilkIntakeForm[]>>('/raw-milk-intake-2')
    }
    const queryParams = new URLSearchParams(filters as Record<string, string>)
    return apiRequest<ApiResponse<RawMilkIntakeForm[]>>(`/raw-milk-intake-2?${queryParams.toString()}`)
  },

  /** GET /raw-milk-intake-2/:id */
  getById: async (id: string) =>
    apiRequest<ApiResponse<RawMilkIntakeForm>>(`/raw-milk-intake-2/${id}`),

  /** GET /raw-milk-intake-2/tested-trucks — trucks ready for intake */
  getTestedTrucks: async () =>
    apiRequest<ApiResponse<TestedTruck[]>>('/raw-milk-intake-2/tested-trucks'),

  /** GET /raw-milk-intake-2/tested-truck/:truck_number — compartments for a given truck */
  getCompartmentsByTruck: async (truckNumber: string) =>
    apiRequest<ApiResponse<TruckCompartment[]>>(
      `/raw-milk-intake-2/tested-truck/${encodeURIComponent(truckNumber)}`
    ),

  /** POST /raw-milk-intake-2 */
  create: async (formData: CreateRawMilkIntakeFormRequest) =>
    apiRequest<ApiResponse<RawMilkIntakeForm>>('/raw-milk-intake-2', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  /** PATCH /raw-milk-intake-2 */
  update: async (formData: CreateRawMilkIntakeFormRequest) => {
    if (!formData.id) throw new Error('Form ID is required for update')
    return apiRequest<ApiResponse<RawMilkIntakeForm>>('/raw-milk-intake-2', {
      method: 'PATCH',
      body: JSON.stringify(formData),
    })
  },

  /** DELETE /raw-milk-intake-2/:id */
  delete: async (id: string) =>
    apiRequest<ApiResponse<null>>(`/raw-milk-intake-2/${id}`, { method: 'DELETE' }),

  // Legacy method kept for backward compatibility
  getTrucks: async () =>
    apiRequest<ApiResponse<TruckCompartment[]>>('/raw-milk-intake-2/tested-trucks'),

  getVouchersPendingTransfer: async () =>
    apiRequest<ApiResponse<RawMilkIntakePendingVoucher[]>>(
      '/raw-milk-intake-form/vouchers-pending-transfer'
    ),
}
