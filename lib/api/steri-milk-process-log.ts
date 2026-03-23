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
  batch_number: string // Changed to string to support "3A"

  filling_start?: ProcessDetail | null
  autoclave_start?: ProcessDetail | null
  heating_start?: ProcessDetail | null
  heating_finish?: ProcessDetail | null
  sterilization_start?: ProcessDetail | null
  sterilization_after_5?: ProcessDetail | null
  sterilization_finish?: ProcessDetail | null
  pre_cooling_start?: ProcessDetail | null
  pre_cooling_finish: ProcessDetail | null
  cooling_1_start: ProcessDetail | null
  cooling_1_finish: ProcessDetail | null
  cooling_2_start: ProcessDetail | null
  cooling_2_finish: ProcessDetail | null
}

// API resource shape (returns batch)
export interface SteriMilkProcessLog {
  id: string
  created_at?: string
  updated_at?: string | null
  operator: string
  approved: boolean
  approver_id: string | null
  filmatic_form_id: string | null
  updated_by?: string | null
  tag?: string
  autoclave?: { id: string; name: string } | null
  batch?: Batch | null
}

// New create/update request shape
export interface CreateSteriMilkProcessLogRequest {
  id?: string
  autoclave: string // machine ID string
  approved: boolean
  batch: Partial<Batch>
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
