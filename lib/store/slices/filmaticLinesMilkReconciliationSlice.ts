import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { filmaticLinesApi, FilmaticLinesMilkReconciliation, CreateFilmaticLinesMilkReconciliationRequest, UpdateFilmaticLinesMilkReconciliationRequest } from '@/lib/api/filmatic-lines'

interface FilmaticLinesMilkReconciliationState {
  reconciliations: FilmaticLinesMilkReconciliation[]
  currentReconciliation: FilmaticLinesMilkReconciliation | null
  loading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: string | null
}

const initialState: FilmaticLinesMilkReconciliationState = {
  reconciliations: [],
  currentReconciliation: null,
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
}

// Async thunks
export const fetchFilmaticLinesMilkReconciliations = createAsyncThunk(
  'filmaticLinesMilkReconciliations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getMilkReconciliations()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch milk reconciliations')
    }
  }
)

export const fetchFilmaticLinesMilkReconciliationsByDetail = createAsyncThunk(
  'filmaticLinesMilkReconciliations/fetchByDetail',
  async (detailId: string, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getMilkReconciliationsByDetail(detailId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch milk reconciliations')
    }
  }
)

export const createFilmaticLinesMilkReconciliation = createAsyncThunk(
  'filmaticLinesMilkReconciliations/create',
  async (data: CreateFilmaticLinesMilkReconciliationRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.createMilkReconciliation(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create milk reconciliation')
    }
  }
)

export const updateFilmaticLinesMilkReconciliation = createAsyncThunk(
  'filmaticLinesMilkReconciliations/update',
  async (data: UpdateFilmaticLinesMilkReconciliationRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.updateMilkReconciliation(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update milk reconciliation')
    }
  }
)

export const deleteFilmaticLinesMilkReconciliation = createAsyncThunk(
  'filmaticLinesMilkReconciliations/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await filmaticLinesApi.deleteMilkReconciliation(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete milk reconciliation')
    }
  }
)

const filmaticLinesMilkReconciliationSlice = createSlice({
  name: 'filmaticLinesMilkReconciliations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentReconciliation: (state, action: PayloadAction<FilmaticLinesMilkReconciliation | null>) => {
      state.currentReconciliation = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reconciliations
      .addCase(fetchFilmaticLinesMilkReconciliations.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesMilkReconciliations.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.reconciliations = action.payload
      })
      .addCase(fetchFilmaticLinesMilkReconciliations.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      // Fetch reconciliations by detail
      .addCase(fetchFilmaticLinesMilkReconciliationsByDetail.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesMilkReconciliationsByDetail.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.reconciliations = action.payload
      })
      .addCase(fetchFilmaticLinesMilkReconciliationsByDetail.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      // Create reconciliation
      .addCase(createFilmaticLinesMilkReconciliation.pending, (state) => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createFilmaticLinesMilkReconciliation.fulfilled, (state, action) => {
        state.loading.create = false
        state.reconciliations.unshift(action.payload)
      })
      .addCase(createFilmaticLinesMilkReconciliation.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.payload as string
      })
      // Update reconciliation
      .addCase(updateFilmaticLinesMilkReconciliation.pending, (state) => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateFilmaticLinesMilkReconciliation.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.reconciliations.findIndex(reconciliation => reconciliation.id === action.payload.id)
        if (index !== -1) {
          state.reconciliations[index] = action.payload
        }
        if (state.currentReconciliation?.id === action.payload.id) {
          state.currentReconciliation = action.payload
        }
      })
      .addCase(updateFilmaticLinesMilkReconciliation.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.payload as string
      })
      // Delete reconciliation
      .addCase(deleteFilmaticLinesMilkReconciliation.pending, (state) => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteFilmaticLinesMilkReconciliation.fulfilled, (state, action) => {
        state.loading.delete = false
        state.reconciliations = state.reconciliations.filter(reconciliation => reconciliation.id !== action.payload)
        if (state.currentReconciliation?.id === action.payload) {
          state.currentReconciliation = null
        }
      })
      .addCase(deleteFilmaticLinesMilkReconciliation.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentReconciliation } = filmaticLinesMilkReconciliationSlice.actions
export default filmaticLinesMilkReconciliationSlice.reducer
