import type { CollectionVoucher, CollectionVoucherDetails, CollectionVoucherLabTest, TableFilters } from "@/lib/types"
import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface ApiEnvelope<T> {
    statusCode: number
    message: string
    data: T
}

// Request types for create
export interface CreateCollectionVoucherRequest {
    driver: string
    number_of_compartments: number
    date: string
    route: string
    farmer: string // supplier ID
    details: {
        temperature: number
        dip_reading: number
        meter_start: number
        meter_finish: number
        volume: number
        dairy_total: number
        farmer_tank_number: number[]
        truck_compartment_number: number
        route_total: number
    }[]
    truck_number: string
    time_in: string
    time_out: string
    lab_test: {
        ot_result?: string
        cob_result?: boolean
        organoleptic?: string
        alcohol?: string
    }[]
    remark: string
    driver_signature: string
}

// Request type for update
export interface UpdateCollectionVoucherRequest extends CreateCollectionVoucherRequest {
    id: string
}

export const collectionVoucherApi = {
    // Get all collection vouchers
    async getCollectionVouchers(params: {
        filters?: TableFilters
    } = {}): Promise<ApiEnvelope<CollectionVoucher[]>> {
        return apiRequest<ApiEnvelope<CollectionVoucher[]>>('/raw-milk-collection-voucher')
    },

    // Get single collection voucher by ID
    async getCollectionVoucher(id: string): Promise<ApiEnvelope<CollectionVoucher>> {
        return apiRequest<ApiEnvelope<CollectionVoucher>>(`/raw-milk-collection-voucher/${id}`)
    },

    // Create new collection voucher
    async createCollectionVoucher(formData: CreateCollectionVoucherRequest): Promise<ApiEnvelope<CollectionVoucher>> {
        return apiRequest<ApiEnvelope<CollectionVoucher>>('/raw-milk-collection-voucher', {
            method: 'POST',
            body: JSON.stringify(formData),
        })
    },

    // Update existing collection voucher
    async updateCollectionVoucher(formData: UpdateCollectionVoucherRequest): Promise<ApiEnvelope<CollectionVoucher>> {
        return apiRequest<ApiEnvelope<CollectionVoucher>>('/raw-milk-collection-voucher', {
            method: 'PATCH',
            body: JSON.stringify(formData),
        })
    },

    // Delete collection voucher
    async deleteCollectionVoucher(id: string): Promise<ApiEnvelope<null>> {
        return apiRequest<ApiEnvelope<null>>(`/raw-milk-collection-voucher/${id}`, {
            method: 'DELETE',
        })
    },
}
