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
  filling_start_details: ProcessDetail | null
  autoclave_start_details: ProcessDetail | null
  heating_start_details: ProcessDetail | null
  heating_finish_details: ProcessDetail | null
  sterilization_start_details: ProcessDetail | null
  sterilization_after_5_details: ProcessDetail | null
  sterilization_finish_details: ProcessDetail | null
  pre_cooling_start_details: ProcessDetail | null
  pre_cooling_finish_details: ProcessDetail | null
  cooling_1_start_details: ProcessDetail | null
  cooling_1_finish_details: ProcessDetail | null
  cooling_2_start_details: ProcessDetail | null
  cooling_2_finish_details: ProcessDetail | null
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

export interface ProcessDetail {
  time: string | null
  pressure: number
  temperature: number
}

export interface BatchEntry {
  batch_number: number
  filling_start: ProcessDetail
  heating_start: ProcessDetail
  heating_finish: ProcessDetail
  autoclave_start: ProcessDetail
  cooling_1_start: ProcessDetail
  cooling_2_start: ProcessDetail
  cooling_1_finish: ProcessDetail
  cooling_2_finish: ProcessDetail
  pre_cooling_start: ProcessDetail
  pre_cooling_finish: ProcessDetail
  sterilization_start: ProcessDetail
  sterilization_finish: ProcessDetail
  sterilization_after_5: ProcessDetail
}

export interface SteriMilkProcessLog {
  id: string
  created_at?: string
  updated_at?: string | null
  approved: boolean
  approver_id: string
  filmatic_form_id: string
  steri_milk_process_log_batch: BatchEntry[]
}

export interface CreateSteriMilkProcessLogRequest {
  approved: boolean
  approver_id: string
  filmatic_form_id: string
  steri_milk_process_log_batch: BatchEntry[]
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
