import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { rawMilkTestBeforeIntakeApi, CreateRawMilkResultSlipRequest, UpdateRawMilkResultSlipRequest } from '@/lib/api/raw-milk-test-before-intake'
import { RawMilkResultSlipBeforeIntake, UntestedCompartment } from '@/lib/types'

interface RawMilkTestBeforeIntakeState {
    resultSlips: RawMilkResultSlipBeforeIntake[]
    pendingVouchers: any[]
    untestedCompartments: UntestedCompartment[]
    operationLoading: {
        fetch: boolean
        fetchPending: boolean
        fetchUntested: boolean
        create: boolean
        update: boolean
        delete: boolean
    }
    error: any
}

const initialState: RawMilkTestBeforeIntakeState = {
    resultSlips: [],
    pendingVouchers: [],
    untestedCompartments: [],
    operationLoading: {
        fetch: false,
        fetchPending: false,
        fetchUntested: false,
        create: false,
        update: false,
        delete: false
    },
    error: null
}

export const fetchResultSlips = createAsyncThunk(
    'rawMilkTestBeforeIntake/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await rawMilkTestBeforeIntakeApi.getAll()
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch result slips')
        }
    }
)

export const fetchPendingVouchers = createAsyncThunk(
    'rawMilkTestBeforeIntake/fetchPending',
    async (_, { rejectWithValue }) => {
        try {
            const response = await rawMilkTestBeforeIntakeApi.getPendingVouchers()
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch pending vouchers')
        }
    }
)

export const fetchUntestedCompartments = createAsyncThunk(
    'rawMilkTestBeforeIntake/fetchUntested',
    async (_, { rejectWithValue }) => {
        try {
            const response = await rawMilkTestBeforeIntakeApi.getUntestedCompartments()
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch untested compartments')
        }
    }
)

export const createResultSlip = createAsyncThunk(
    'rawMilkTestBeforeIntake/create',
    async (data: CreateRawMilkResultSlipRequest, { rejectWithValue }) => {
        try {
            const response = await rawMilkTestBeforeIntakeApi.create(data)
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create result slip')
        }
    }
)

export const updateResultSlip = createAsyncThunk(
    'rawMilkTestBeforeIntake/update',
    async (data: UpdateRawMilkResultSlipRequest, { rejectWithValue }) => {
        try {
            const response = await rawMilkTestBeforeIntakeApi.update(data)
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update result slip')
        }
    }
)

export const deleteResultSlip = createAsyncThunk(
    'rawMilkTestBeforeIntake/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await rawMilkTestBeforeIntakeApi.delete(id)
            return id
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete result slip')
        }
    }
)

const rawMilkTestBeforeIntakeSlice = createSlice({
    name: 'rawMilkTestBeforeIntake',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch result slips
            .addCase(fetchResultSlips.pending, (state) => {
                state.operationLoading.fetch = true
            })
            .addCase(fetchResultSlips.fulfilled, (state, action) => {
                state.operationLoading.fetch = false
                state.resultSlips = action.payload || []
            })
            .addCase(fetchResultSlips.rejected, (state, action) => {
                state.operationLoading.fetch = false
                state.error = action.payload
            })
            // Fetch pending vouchers
            .addCase(fetchPendingVouchers.pending, (state) => {
                state.operationLoading.fetchPending = true
            })
            .addCase(fetchPendingVouchers.fulfilled, (state, action) => {
                state.operationLoading.fetchPending = false
                state.pendingVouchers = action.payload || []
            })
            .addCase(fetchPendingVouchers.rejected, (state, action) => {
                state.operationLoading.fetchPending = false
                state.error = action.payload
            })
            // Fetch untested compartments
            .addCase(fetchUntestedCompartments.pending, (state) => {
                state.operationLoading.fetchUntested = true
            })
            .addCase(fetchUntestedCompartments.fulfilled, (state, action) => {
                state.operationLoading.fetchUntested = false
                state.untestedCompartments = action.payload || []
            })
            .addCase(fetchUntestedCompartments.rejected, (state, action) => {
                state.operationLoading.fetchUntested = false
                state.error = action.payload
            })
            // Create
            .addCase(createResultSlip.pending, (state) => {
                state.operationLoading.create = true
            })
            .addCase(createResultSlip.fulfilled, (state, action) => {
                state.operationLoading.create = false
                state.resultSlips.unshift(action.payload)
            })
            .addCase(createResultSlip.rejected, (state, action) => {
                state.operationLoading.create = false
                state.error = action.payload
            })
            // Update
            .addCase(updateResultSlip.pending, (state) => {
                state.operationLoading.update = true
            })
            .addCase(updateResultSlip.fulfilled, (state, action) => {
                state.operationLoading.update = false
                const index = state.resultSlips.findIndex(s => s.id === action.payload.id)
                if (index !== -1) {
                    state.resultSlips[index] = action.payload
                }
            })
            .addCase(updateResultSlip.rejected, (state, action) => {
                state.operationLoading.update = false
                state.error = action.payload
            })
            // Delete
            .addCase(deleteResultSlip.pending, (state) => {
                state.operationLoading.delete = true
            })
            .addCase(deleteResultSlip.fulfilled, (state, action) => {
                state.operationLoading.delete = false
                state.resultSlips = state.resultSlips.filter(s => s.id !== action.payload)
            })
            .addCase(deleteResultSlip.rejected, (state, action) => {
                state.operationLoading.delete = false
                state.error = action.payload
            })
    }
})

export const { clearError } = rawMilkTestBeforeIntakeSlice.actions
export default rawMilkTestBeforeIntakeSlice.reducer
