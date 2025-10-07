import type { ProductionPlan, ProductionPlanRawProduct, TableFilters } from "@/lib/types"
import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export interface CreateProductionPlanRequest {
  name: string
  description?: string
  start_date: string
  end_date: string
  raw_products_object: Array<{
    raw_material_id: string
    requested_amount: number
    units: string
  }>
  supervisor: string
  status: "planned" | "ongoing" | "completed" | "cancelled"
  process_id: string
  output_value: number
  output_units: string
}

export interface UpdateProductionPlanRequest extends Omit<CreateProductionPlanRequest, 'raw_products_object'> {
  id: string
  created_at: string
  updated_at: string
  raw_products: Array<{
    raw_material_id: string
    requested_amount: number
    units: string
  }>
}

export const productionPlanApi = {
  // Get all production plans
  async getProductionPlans(params: {
    filters?: TableFilters
  } = {}): Promise<ApiEnvelope<ProductionPlan[]>> {
    return apiRequest<ApiEnvelope<ProductionPlan[]>>(API_CONFIG.ENDPOINTS.PRODUCTION_PLANS)
  },

  // Get single production plan by ID
  async getProductionPlan(id: string): Promise<ApiEnvelope<ProductionPlan>> {
    return apiRequest<ApiEnvelope<ProductionPlan>>(`${API_CONFIG.ENDPOINTS.PRODUCTION_PLANS}/${id}`)
  },

  // Create new production plan
  async createProductionPlan(planData: CreateProductionPlanRequest): Promise<ApiEnvelope<ProductionPlan>> {
    const requestData = {
      ...planData,
      created_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiEnvelope<ProductionPlan>>(API_CONFIG.ENDPOINTS.PRODUCTION_PLANS, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  // Update existing production plan
  async updateProductionPlan(planData: UpdateProductionPlanRequest): Promise<ApiEnvelope<ProductionPlan>> {
    const requestData = {
      ...planData,
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiEnvelope<ProductionPlan>>(API_CONFIG.ENDPOINTS.PRODUCTION_PLANS, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    })
  },

  // Delete production plan
  async deleteProductionPlan(id: string): Promise<ApiEnvelope<null>> {
    return apiRequest<ApiEnvelope<null>>(`${API_CONFIG.ENDPOINTS.PRODUCTION_PLANS}/${id}`, {
      method: 'DELETE',
    })
  },
}
