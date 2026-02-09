import { apiRequest } from "@/lib/utils/api-request"

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

// normalized process detail used in "details" objects
export interface ProcessDetail {
  id?: string
  time: string | null
  temperature: number
  pressure: number
}

// Batch object matching new API payload
export interface Batch {
  id?: string
  date?: string | null
  batch_number: number

  // // time references (IDs or null)
  // filling_start?: string | null
  // autoclave_start?: string | null
  // heating_start?: string | null
  // heating_finish?: string | null
  // sterilization_start?: string | null
  // sterilization_after_5?: string | null
  // sterilization_finish?: string | null
  // pre_cooling_start?: string | null
  // pre_cooling_finish?: string | null
  // cooling_1_start?: string | null
  // cooling_1_finish?: string | null
  // cooling_2_start?: string | null
  // cooling_2_finish?: string | null

  // detailed readings
  filling_start_details?: ProcessDetail | null
  autoclave_start_details?: ProcessDetail | null
  heating_start_details?: ProcessDetail | null
  heating_finish_details?: ProcessDetail | null
  sterilization_start_details?: ProcessDetail | null
  sterilization_after_5_details?: ProcessDetail | null
  sterilization_finish_details?: ProcessDetail | null
  pre_cooling_start_details?: ProcessDetail | null
  pre_cooling_finish_details?: ProcessDetail | null
  cooling_1_start_details?: ProcessDetail | null
  cooling_1_finish_details?: ProcessDetail | null
  cooling_2_start_details?: ProcessDetail | null
  cooling_2_finish_details?: ProcessDetail | null
}

// API resource shape (returns batch)
export interface SteriMilkProcessLog {
  id: string
  created_at?: string
  updated_at?: string | null
  approved: boolean
  approver_id: string
  filmatic_form_id: string | null
  tag?: string           // <- new field returned by API
  batch_id?: Batch | null // <- API returns a single batch object or null
}

// New create request shape (single batch)
export interface CreateSteriMilkProcessLogRequest {
  approved: boolean
  approver_id: string
  filmatic_form_id: string | null
  batch: Batch
  id?: string
}

export const steriMilkProcessLogApi = {
  async getLogs(params?: { filters?: { filmatic_form_id?: string; search?: string } }): Promise<SteriMilkProcessLog[]> {
    const queryParams = new URLSearchParams()
    if (params?.filters?.filmatic_form_id) {
      queryParams.append('filmatic_form_id', params.filters.filmatic_form_id)
    }
    if (params?.filters?.search) {
      queryParams.append('search', params.filters.search)
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/steri-milk-process-log?${queryString}` : '/steri-milk-process-log'
    const response = await apiRequest<ApiEnvelope<SteriMilkProcessLog[]>>(endpoint, { method: 'GET' })
    return response.data
  },

  async getLog(id: string): Promise<SteriMilkProcessLog> {
    const response = await apiRequest<ApiEnvelope<SteriMilkProcessLog>>(`/steri-milk-process-log/${id}`, { method: 'GET' })
    return response.data
  },

  async createLog(data: CreateSteriMilkProcessLogRequest): Promise<SteriMilkProcessLog> {
    const response = await apiRequest<ApiEnvelope<SteriMilkProcessLog>>('/steri-milk-process-log', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return response.data
  },

  async updateLog(id: string, data: Partial<CreateSteriMilkProcessLogRequest>): Promise<SteriMilkProcessLog> {
    const response = await apiRequest<ApiEnvelope<SteriMilkProcessLog>>(`/steri-milk-process-log`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
    return response.data
  },

  async deleteLog(id: string): Promise<void> {
    await apiRequest<ApiEnvelope<void>>(`/steri-milk-process-log/${id}`, { method: 'DELETE' })
  },
}
