import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface RawMilkSilos {
  tank: string
  time: string
  temperature: number
  alcohol: number
  res: number
  cob: number
  ph: number
  fat: number
  lr_snf: string
  acidity: number
  remarks: string
}

export interface OtherTests {
  sample_details: string
  ph: number
  caustic: number
  acid: number
  chlorine: number
  hd: number
  tds: number
  hydrogen_peroxide: number
  remarks: string
}

export interface StandardisationAndPasteurisation {
  tank: string
  batch: number
  time: string
  temperature: number
  ot: string
  alcohol: number
  phosphatase: string
  ph: number
  cob: boolean
  fat: number
  ci_si: string
  lr_snf: string
  acidity: number
  analyst: string
  remarks: string
}

export interface UhtSteriMilk {
  time: string
  batch: string
  temperature: number
  ot: string
  alc: number
  res: number
  cob: boolean
  ph: number
  fat: number
  lr_snf: string
  ci_si: string
  total_solids: number
  acidity: number
  coffee: number
  hydrogen_peroxide_or_turbidity: string
  analyst: string
  remarks: string
}

export interface CreateSteriMilkTestReportRequest {
  issue_date: string
  approved_by: string
  approver_signature: string
  date_of_production: string
  batch_number: number
  variety: string
  raw_milk_silos: RawMilkSilos
  other_tests: OtherTests
  standardisation_and_pasteurisation: StandardisationAndPasteurisation
  uht_steri_milk: UhtSteriMilk
}

export interface SteriMilkTestReport {
  id: string
  created_at: string
  updated_at: string | null
  issue_date: string
  approved_by: string
  approver_signature: string
  other_tests_id: string | null
  raw_milk_silos_id: string | null
  standardisation_and_pasteurisation_id: string | null
  uht_steri_milk_id: string | null
  date_of_production: string | null
  batch_number: number | null
  variety: string | null
  steri_milk_test_report_other_tests_id_fkey: OtherTests | null
  steri_milk_test_report_raw_milk_silos_id_fkey: RawMilkSilos | null
  steri_milk_test_report_standardisation_and_pasteurisation__fkey: StandardisationAndPasteurisation | null
  steri_milk_test_report_uht_steri_milk_id_fkey: UhtSteriMilk | null
}

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export const steriMilkTestReportApi = {
  createTestReport: async (payload: CreateSteriMilkTestReportRequest): Promise<ApiEnvelope<SteriMilkTestReport>> => {
    return apiRequest<ApiEnvelope<SteriMilkTestReport>>(API_CONFIG.ENDPOINTS.STERI_MILK_TEST_REPORT, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  
  getTestReports: async (): Promise<ApiEnvelope<SteriMilkTestReport[]>> => {
    return apiRequest<ApiEnvelope<SteriMilkTestReport[]>>(API_CONFIG.ENDPOINTS.STERI_MILK_TEST_REPORT)
  },
  
  getTestReport: async (id: string): Promise<ApiEnvelope<SteriMilkTestReport>> => {
    return apiRequest<ApiEnvelope<SteriMilkTestReport>>(`${API_CONFIG.ENDPOINTS.STERI_MILK_TEST_REPORT}/${id}`)
  }
}
