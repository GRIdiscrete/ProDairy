import { apiRequest } from '@/lib/utils/api-request'
import { RawMilkResultSlipBeforeIntake, UntestedCompartment } from '@/lib/types'

export interface ApiResponse<T> {
    statusCode: number
    message: string
    data: T
}

export interface CreateRawMilkResultSlipRequest {
    voucher_id: string
    truck_compartment_number: number
    date: string
    time_in: string
    time_out: string
    approved_by: string
    approver_signature: string
    analyst: string
    results_collected_by: string
    tag: string
    lab_test: {
        temperature: number | null
        time: string
        ot: string | null
        cob: boolean | null
        alcohol: number | null
        titratable_acidity: number | null
        ph: number | null
        resazurin: string | null
        fat: number | null
        protein: number | null
        lr_snf: string | null
        total_solids: number | null
        fpd: number | null
        scc: number | null
        density: number | null
        antibiotics: boolean | null
        starch: boolean | null
        remark: string | null
        pass: boolean
    }
}

export interface UpdateRawMilkResultSlipRequest {
    id: string
    voucher_id?: string
    truck_compartment_number?: number
    date?: string
    time_in?: string
    time_out?: string
    approved_by?: string
    approver_signature?: string
    analyst?: string
    results_collected_by?: string
    tag?: string
    lab_test: Partial<CreateRawMilkResultSlipRequest['lab_test']> & { id: string, accepted?: boolean }
}

export const rawMilkTestBeforeIntakeApi = {
    // Get all result slips
    getAll: async () => {
        return apiRequest<ApiResponse<RawMilkResultSlipBeforeIntake[]>>('/raw-milk-result-slip-before-intake')
    },

    // Get pending vouchers
    getPendingVouchers: async () => {
        return apiRequest<ApiResponse<any[]>>('/raw-milk-result-slip-before-intake/pending-vouchers')
    },

    // Get untested compartments
    getUntestedCompartments: async () => {
        return apiRequest<ApiResponse<UntestedCompartment[]>>('/raw-milk-result-slip-before-intake/untestd-compartments')
    },

    // Create new result slip
    create: async (data: CreateRawMilkResultSlipRequest) => {
        return apiRequest<ApiResponse<RawMilkResultSlipBeforeIntake>>('/raw-milk-result-slip-before-intake', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    // Update result slip
    update: async (data: UpdateRawMilkResultSlipRequest) => {
        return apiRequest<ApiResponse<RawMilkResultSlipBeforeIntake>>('/raw-milk-result-slip-before-intake', {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    },

    // Delete result slip
    delete: async (id: string) => {
        return apiRequest<ApiResponse<null>>(`/raw-milk-result-slip-before-intake/${id}`, {
            method: 'DELETE',
        })
    }
}
