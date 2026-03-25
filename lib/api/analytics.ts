import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

// Collection summary item (per truck or TOTAL)
export interface CollectionSummaryItem {
  truck_number: string
  volume_today: number
  volume_wtd: number
  volume_mtd: number
  volume_qtd: number
  volume_ytd: number
  volume_yesterday: number
  volume_previous_week: number
  volume_previous_month: number
  volume_last_7_days: number
  volume_last_30_days: number
  volume_last_90_days: number
  volume_last_365_days: number
}

// Collection detail item (per truck compartment)
export interface CollectionDetailItem extends CollectionSummaryItem {
  truck_compartment_number: string
  suppliers: Array<{
    tank: string
    volume: number
    voucher: string
    last_name: string
    first_name: string
  }> | null
}

// Intake summary item
export interface IntakeSummaryItem {
  truck: string
  volume_today: number
  volume_wtd: number
  volume_mtd: number
  volume_qtd: number
  volume_ytd: number
  volume_yesterday: number
  volume_previous_week: number
  volume_previous_month: number
  volume_last_7_days: number
  volume_last_30_days: number
  volume_last_90_days: number
  volume_last_365_days: number
}

// Intake detail item
export interface IntakeDetailItem extends IntakeSummaryItem {
  truck_compartment_number: number
}

// CIP item
export interface CIPItem {
  machine: string | null
  silo: string | null
  tag: string
  status: 'Draft' | 'In Progress' | 'Completed' | 'Failed'
  stage: string | null
}

// Production detail item
export interface ProductionDetailItem {
  production_plan_id: string
  product_name: string
  plan_name: string
  total_expected_output: number
  total_input: number | null
  total_day_bottles: number | null
  total_day_litres: number | null
  total_night_bottles: number | null
  total_night_litres: number | null
}

export const analyticsApi = {
  // Collection endpoints
  async getCollectionSummary(): Promise<ApiEnvelope<CollectionSummaryItem[]>> {
    return apiRequest<ApiEnvelope<CollectionSummaryItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.COLLECTION_SUMMARY)
  },

  async getCollectionDetails(): Promise<ApiEnvelope<CollectionDetailItem[]>> {
    return apiRequest<ApiEnvelope<CollectionDetailItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.COLLECTION_DETAILS)
  },

  async getFailedCollectionSummary(): Promise<ApiEnvelope<CollectionSummaryItem[]>> {
    return apiRequest<ApiEnvelope<CollectionSummaryItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.FAILED_COLLECTION_SUMMARY)
  },

  async getSuccessfulCollectionSummary(): Promise<ApiEnvelope<CollectionSummaryItem[]>> {
    return apiRequest<ApiEnvelope<CollectionSummaryItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.SUCCESSFUL_COLLECTION_SUMMARY)
  },

  async getTestedCollectionSummary(): Promise<ApiEnvelope<CollectionSummaryItem[]>> {
    return apiRequest<ApiEnvelope<CollectionSummaryItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.TESTED_COLLECTION_SUMMARY)
  },

  async getTestedCollectionDetails(): Promise<ApiEnvelope<CollectionDetailItem[]>> {
    return apiRequest<ApiEnvelope<CollectionDetailItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.TESTED_COLLECTION_DETAILS)
  },

  async getUntestedCollectionSummary(): Promise<ApiEnvelope<CollectionSummaryItem[]>> {
    return apiRequest<ApiEnvelope<CollectionSummaryItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.UNTESTED_COLLECTION_SUMMARY)
  },

  async getUntestedCollectionDetails(): Promise<ApiEnvelope<CollectionDetailItem[]>> {
    return apiRequest<ApiEnvelope<CollectionDetailItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.UNTESTED_COLLECTION_DETAILS)
  },

  // Intake endpoints
  async getIntakeSummary(): Promise<ApiEnvelope<IntakeSummaryItem[]>> {
    return apiRequest<ApiEnvelope<IntakeSummaryItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.INTAKE_SUMMARY)
  },

  async getIntakeDetails(): Promise<ApiEnvelope<IntakeDetailItem[]>> {
    return apiRequest<ApiEnvelope<IntakeDetailItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.INTAKE_DETAILS)
  },

  // CIP endpoints
  async getCIPData(): Promise<ApiEnvelope<CIPItem[]>> {
    return apiRequest<ApiEnvelope<CIPItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.CIP)
  },

  // Production endpoints
  async getProductionDetails(): Promise<ApiEnvelope<ProductionDetailItem[]>> {
    return apiRequest<ApiEnvelope<ProductionDetailItem[]>>(API_CONFIG.ENDPOINTS.ANALYTICS.PRODUCTION_DETAILS)
  },
}
