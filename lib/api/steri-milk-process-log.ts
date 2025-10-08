import { apiRequest } from "@/lib/utils/api-request"

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export interface ProcessDetail {
  time: string
  temperature: number
  pressure: number
}

export interface BatchDetails {
  batch_number: number
  filling_start_details: ProcessDetail
  autoclave_start_details: ProcessDetail
  heating_start_details: ProcessDetail
  heating_finish_details: ProcessDetail
  sterilization_start_details: ProcessDetail
  sterilization_after_5_details: ProcessDetail
  sterilization_finish_details: ProcessDetail
  pre_cooling_start_details: ProcessDetail
  pre_cooling_finish_details: ProcessDetail
  cooling_1_start_details: ProcessDetail
  cooling_1_finish_details: ProcessDetail
  cooling_2_start_details: ProcessDetail
  cooling_2_finish_details: ProcessDetail
}

export interface BatchEntry {
  batch_number: number
  filling_start: ProcessDetail | null
  heating_start: ProcessDetail | null
  heating_finish: ProcessDetail | null
  autoclave_start: ProcessDetail | null
  cooling_1_start: ProcessDetail | null
  cooling_2_start: ProcessDetail | null
  cooling_1_finish: ProcessDetail | null
  cooling_2_finish: ProcessDetail | null
  pre_cooling_start: ProcessDetail | null
  pre_cooling_finish: ProcessDetail | null
  sterilization_start: ProcessDetail | null
  sterilization_finish: ProcessDetail | null
  sterilization_after_5: ProcessDetail | null
}

export interface SteriMilkProcessLog {
  id: string
  created_at?: string
  updated_at?: string | null
  approved: boolean | null
  approver_id: string
  filmatic_form_id: string
  batch_id?: string | null
  filmatic_form_2_id?: string | null
  steri_milk_process_log_batch: BatchEntry[]
}

export interface CreateSteriMilkProcessLogRequest {
  approved: boolean
  approver_id: string
  filmatic_form_id: string
  batch: BatchDetails
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
    const response = await apiRequest<ApiEnvelope<SteriMilkProcessLog>>(`/steri-milk-process-log/${id}`, { 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    })
    return response.data
  },

  async deleteLog(id: string): Promise<void> {
    await apiRequest<ApiEnvelope<void>>(`/steri-milk-process-log/${id}`, { method: 'DELETE' })
  },
}
