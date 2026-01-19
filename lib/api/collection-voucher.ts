import type { CollectionVoucher2, TableFilters } from "@/lib/types"
import { apiRequest } from '@/lib/utils/api-request'

export interface ApiEnvelope<T> {
    statusCode: number
    message: string
    data: T
}

// Request types for create
export interface CreateCollectionVoucherRequest {
    driver: string
    date: string
    route: string
    supplier: string // supplier ID
    truck_number: string
    time_in: string
    time_out: string
    remark: string
    driver_signature: string
    details: {
        supplier_tanks: {
            supplier_tank_id: string
            truck_compartment_number: number
            temperature: number
            dip_reading: number
            meter_start: number
            meter_finish: number
            volume: number
            dairy_total: number
            lab_test: {
                ot_result?: string
                cob_result?: boolean
                organoleptic?: string
                alcohol?: string
            }
        }[]
    }[]
}

// Request type for update
export interface UpdateCollectionVoucherRequest {
    id: string
    driver?: string
    date?: string
    route?: string
    supplier?: string
    truck_number?: string
    time_in?: string
    time_out?: string
    remark?: string
    driver_signature?: string
    details: {
        id?: string
        supplier_tanks: {
            id?: string
            supplier_tank_id: string
            truck_compartment_number: number
            temperature: number
            dip_reading: number
            meter_start: number
            meter_finish: number
            volume: number
            dairy_total: number
            lab_test: {
                id?: string
                ot_result?: string
                cob_result?: boolean
                organoleptic?: string
                alcohol?: string
            }
        }[]
    }[]
}

export const collectionVoucherApi = {
    // Get all collection vouchers
    async getCollectionVouchers(params: {
        filters?: TableFilters
    } = {}): Promise<ApiEnvelope<CollectionVoucher2[]>> {
        return apiRequest<ApiEnvelope<CollectionVoucher2[]>>('/raw-milk-collection-voucher-2')
    },

    // Get single collection voucher by ID
    async getCollectionVoucher(id: string): Promise<ApiEnvelope<CollectionVoucher2>> {
        return apiRequest<ApiEnvelope<CollectionVoucher2>>(`/raw-milk-collection-voucher-2/${id}`)
    },

    // Create new collection voucher
    async createCollectionVoucher(formData: CreateCollectionVoucherRequest): Promise<ApiEnvelope<CollectionVoucher2>> {
        return apiRequest<ApiEnvelope<CollectionVoucher2>>('/raw-milk-collection-voucher-2', {
            method: 'POST',
            body: JSON.stringify(formData),
        })
    },

    // Update existing collection voucher
    async updateCollectionVoucher(formData: UpdateCollectionVoucherRequest): Promise<ApiEnvelope<CollectionVoucher2>> {
        return apiRequest<ApiEnvelope<CollectionVoucher2>>(`/raw-milk-collection-voucher-2`, {
            method: 'PATCH',
            body: JSON.stringify(formData),
        })
    },

    // Delete collection voucher
    async deleteCollectionVoucher(id: string): Promise<ApiEnvelope<null>> {
        return apiRequest<ApiEnvelope<null>>(`/raw-milk-collection-voucher-2/${id}`, {
            method: 'DELETE',
        })
    },
}
