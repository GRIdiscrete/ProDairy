import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { collectionVoucherApi, type CreateCollectionVoucherRequest, type UpdateCollectionVoucherRequest } from "@/lib/api/collection-voucher"
import type { CollectionVoucher, TableFilters } from "@/lib/types"

export interface CollectionVoucherState {
    collectionVouchers: CollectionVoucher[]
    selectedCollectionVoucher: CollectionVoucher | null
    filters: TableFilters
    loading: boolean
    error: string | null
    operationLoading: {
        create: boolean
        update: boolean
        delete: boolean
        fetch: boolean
    }
}

const initialState: CollectionVoucherState = {
    collectionVouchers: [],
    selectedCollectionVoucher: null,
    filters: {},
    loading: false,
    error: null,
    operationLoading: {
        create: false,
        update: false,
        delete: false,
        fetch: false,
    },
}

// Async thunks
export const fetchCollectionVouchers = createAsyncThunk(
    "collectionVoucher/fetchCollectionVouchers",
    async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
        try {
            const response = await collectionVoucherApi.getCollectionVouchers(params)
            return response.data
        } catch (error: any) {
            const message = error?.body?.message || error?.message || 'Failed to fetch collection vouchers'
            return rejectWithValue(message)
        }
    }
)

export const fetchCollectionVoucher = createAsyncThunk(
    "collectionVoucher/fetchCollectionVoucher",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await collectionVoucherApi.getCollectionVoucher(id)
            return response.data
        } catch (error: any) {
            const message = error?.body?.message || error?.message || 'Failed to fetch collection voucher'
            return rejectWithValue(message)
        }
    }
)

export const createCollectionVoucher = createAsyncThunk(
    "collectionVoucher/createCollectionVoucher",
    async (formData: CreateCollectionVoucherRequest, { rejectWithValue }) => {
        try {
            const response = await collectionVoucherApi.createCollectionVoucher(formData)
            return response.data
        } catch (error: any) {
            const message = error?.body?.message || error?.message || 'Failed to create collection voucher'
            return rejectWithValue(message)
        }
    }
)

export const updateCollectionVoucher = createAsyncThunk(
    "collectionVoucher/updateCollectionVoucher",
    async (formData: UpdateCollectionVoucherRequest, { rejectWithValue }) => {
        try {
            const response = await collectionVoucherApi.updateCollectionVoucher(formData)
            return response.data
        } catch (error: any) {
            const message = error?.body?.message || error?.message || 'Failed to update collection voucher'
            return rejectWithValue(message)
        }
    }
)

export const deleteCollectionVoucher = createAsyncThunk(
    "collectionVoucher/deleteCollectionVoucher",
    async (id: string, { rejectWithValue }) => {
        try {
            await collectionVoucherApi.deleteCollectionVoucher(id)
            return id
        } catch (error: any) {
            const message = error?.body?.message || error?.message || 'Failed to delete collection voucher'
            return rejectWithValue(message)
        }
    }
)

const collectionVoucherSlice = createSlice({
    name: "collectionVoucher",
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = action.payload
        },
        clearError: (state) => {
            state.error = null
        },
        setSelectedCollectionVoucher: (state, action: PayloadAction<CollectionVoucher | null>) => {
            state.selectedCollectionVoucher = action.payload
        },
        clearSelectedCollectionVoucher: (state) => {
            state.selectedCollectionVoucher = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch collection vouchers
            .addCase(fetchCollectionVouchers.pending, (state) => {
                state.operationLoading.fetch = true
                state.error = null
            })
            .addCase(fetchCollectionVouchers.fulfilled, (state, action) => {
                state.operationLoading.fetch = false
                state.collectionVouchers = action.payload
            })
            .addCase(fetchCollectionVouchers.rejected, (state, action) => {
                state.operationLoading.fetch = false
                state.error = action.payload as string
            })

            // Fetch single collection voucher
            .addCase(fetchCollectionVoucher.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCollectionVoucher.fulfilled, (state, action) => {
                state.loading = false
                state.selectedCollectionVoucher = action.payload
            })
            .addCase(fetchCollectionVoucher.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // Create collection voucher
            .addCase(createCollectionVoucher.pending, (state) => {
                state.operationLoading.create = true
                state.error = null
            })
            .addCase(createCollectionVoucher.fulfilled, (state, action) => {
                state.operationLoading.create = false
                state.collectionVouchers.push(action.payload)
            })
            .addCase(createCollectionVoucher.rejected, (state, action) => {
                state.operationLoading.create = false
                state.error = action.payload as string
            })

            // Update collection voucher
            .addCase(updateCollectionVoucher.pending, (state) => {
                state.operationLoading.update = true
                state.error = null
            })
            .addCase(updateCollectionVoucher.fulfilled, (state, action) => {
                state.operationLoading.update = false
                const index = state.collectionVouchers.findIndex(voucher => voucher.id === action.payload.id)
                if (index !== -1) {
                    state.collectionVouchers[index] = action.payload
                }
                if (state.selectedCollectionVoucher?.id === action.payload.id) {
                    state.selectedCollectionVoucher = action.payload
                }
            })
            .addCase(updateCollectionVoucher.rejected, (state, action) => {
                state.operationLoading.update = false
                state.error = action.payload as string
            })

            // Delete collection voucher
            .addCase(deleteCollectionVoucher.pending, (state) => {
                state.operationLoading.delete = true
                state.error = null
            })
            .addCase(deleteCollectionVoucher.fulfilled, (state, action) => {
                state.operationLoading.delete = false
                state.collectionVouchers = state.collectionVouchers.filter(voucher => voucher.id !== action.payload)
                if (state.selectedCollectionVoucher?.id === action.payload) {
                    state.selectedCollectionVoucher = null
                }
            })
            .addCase(deleteCollectionVoucher.rejected, (state, action) => {
                state.operationLoading.delete = false
                state.error = action.payload as string
            })
    },
})

export const { setFilters, clearError, setSelectedCollectionVoucher, clearSelectedCollectionVoucher } = collectionVoucherSlice.actions
export default collectionVoucherSlice.reducer
