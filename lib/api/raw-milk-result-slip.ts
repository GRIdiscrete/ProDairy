import { apiRequest } from "@/lib/utils/api-request"

export interface CompartmentTest {
  id?: string
  temperature: number
  time: string
  ot: string
  cob: boolean
  alcohol: number
  titrable_acidity: number
  ph: number
  resazurin: string
  fat: number
  protein: number
  lr_snf: string
  total_solids: number
  fpd: number
  scc: number
  density: number
  antibiotics: boolean
  starch: boolean
  silo: string
  remark: string
}

export interface RawMilkResultSlipDetail {
  id?: string
  created_at?: string
  updated_at?: string | null
  raw_milk_result_slip_id?: string
  temperature: number
  time: string
  ot: string
  cob: boolean
  alcohol: number
  titrable_acidity: number
  ph: number
  resazurin: string
  fat: number
  protein: number
  lr_snf: string
  total_solids: number
  fpd: number
  scc: number
  density: number
  antibiotics: boolean
  starch: boolean
  silo: string
  remark: string
  compartment_test: CompartmentTest[]
}

export interface RawMilkResultSlip {
  id?: string
  created_at?: string
  updated_at?: string | null
  date: string
  time_in: string
  time_out: string
  approved_by: string
  approver_signature: string
  source: string
  analyst: string
  results_collected_by: string
  details_id?: string | null
  raw_milk_intake_id?: string | null
  raw_milk_result_slip_details?: RawMilkResultSlipDetail[]
}

export interface CreateRawMilkResultSlipRequest {
  date: string
  time_in: string
  time_out: string
  approved_by: string
  approver_signature: string
  source: string
  analyst: string
  results_collected_by: string
  raw_milk_intake_id?: string
  details: RawMilkResultSlipDetail[]
}

export interface UpdateRawMilkResultSlipRequest extends Partial<CreateRawMilkResultSlipRequest> {
  id: string
}

export interface RawMilkResultSlipResponse {
  statusCode: number
  message: string
  data: RawMilkResultSlip
}

export interface RawMilkResultSlipsResponse {
  statusCode: number
  message: string
  data: RawMilkResultSlip[]
}

export const rawMilkResultSlipApi = {
  async getAll() {
    return await apiRequest<RawMilkResultSlipsResponse>("/raw-milk-lab-test", { 
      method: "GET",
      headers: { accept: "application/json" },
    })
  },

  async create(payload: CreateRawMilkResultSlipRequest) {
    return await apiRequest<RawMilkResultSlipResponse>("/raw-milk-lab-test", {
      method: "POST",
      headers: { 
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  },

  async update(payload: UpdateRawMilkResultSlipRequest) {
    return await apiRequest<RawMilkResultSlipResponse>("/raw-milk-lab-test", {
      method: "PATCH",
      headers: { 
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  },

  async delete(id: string) {
    return await apiRequest(`/raw-milk-lab-test/${id}`, { 
      method: "DELETE",
      headers: { accept: "application/json" },
    })
  },
}
