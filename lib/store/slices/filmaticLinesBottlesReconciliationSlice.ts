import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { filmaticLinesApi, FilmaticLinesBottlesReconciliation, CreateFilmaticLinesBottlesReconciliationRequest, UpdateFilmaticLinesBottlesReconciliationRequest } from '@/lib/api/filmatic-lines'

interface FilmaticLinesBottlesReconciliationState {
  reconciliations: FilmaticLinesBottlesReconciliation[]
  currentReconciliation: FilmaticLinesBottlesReconciliation | null
  loading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: string | null
}

const initialState: FilmaticLinesBottlesReconciliationState = {
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
export const fetchFilmaticLinesBottlesReconciliations = createAsyncThunk(
  'filmaticLinesBottlesReconciliations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getBottlesReconciliations()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bottles reconciliations')
    }
  }
)

export const fetchFilmaticLinesBottlesReconciliationsByDetail = createAsyncThunk(
  'filmaticLinesBottlesReconciliations/fetchByDetail',
  async (detailId: string, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getBottlesReconciliationsByDetail(detailId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bottles reconciliations')
    }
  }
)

export const createFilmaticLinesBottlesReconciliation = createAsyncThunk(
  'filmaticLinesBottlesReconciliations/create',
  async (data: CreateFilmaticLinesBottlesReconciliationRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.createBottlesReconciliation(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create bottles reconciliation')
    }
  }
)

export const updateFilmaticLinesBottlesReconciliation = createAsyncThunk(
  'filmaticLinesBottlesReconciliations/update',
  async (data: UpdateFilmaticLinesBottlesReconciliationRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.updateBottlesReconciliation(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update bottles reconciliation')
    }
  }
)

export const deleteFilmaticLinesBottlesReconciliation = createAsyncThunk(
  'filmaticLinesBottlesReconciliations/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await filmaticLinesApi.deleteBottlesReconciliation(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete bottles reconciliation')
    }
  }
)

const filmaticLinesBottlesReconciliationSlice = createSlice({
  name: 'filmaticLinesBottlesReconciliations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentReconciliation: (state, action: PayloadAction<FilmaticLinesBottlesReconciliation | null>) => {
      state.currentReconciliation = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reconciliations
      .addCase(fetchFilmaticLinesBottlesReconciliations.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesBottlesReconciliations.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.reconciliations = action.payload
      })
      .addCase(fetchFilmaticLinesBottlesReconciliations.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      // Fetch reconciliations by detail
      .addCase(fetchFilmaticLinesBottlesReconciliationsByDetail.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesBottlesReconciliationsByDetail.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.reconciliations = action.payload
      })
      .addCase(fetchFilmaticLinesBottlesReconciliationsByDetail.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      // Create reconciliation
      .addCase(createFilmaticLinesBottlesReconciliation.pending, (state) => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createFilmaticLinesBottlesReconciliation.fulfilled, (state, action) => {
        state.loading.create = false
        state.reconciliations.unshift(action.payload)
      })
      .addCase(createFilmaticLinesBottlesReconciliation.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.payload as string
      })
      // Update reconciliation
      .addCase(updateFilmaticLinesBottlesReconciliation.pending, (state) => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateFilmaticLinesBottlesReconciliation.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.reconciliations.findIndex(reconciliation => reconciliation.id === action.payload.id)
        if (index !== -1) {
          state.reconciliations[index] = action.payload
        }
        if (state.currentReconciliation?.id === action.payload.id) {
          state.currentReconciliation = action.payload
        }
      })
      .addCase(updateFilmaticLinesBottlesReconciliation.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.payload as string
      })
      // Delete reconciliation
      .addCase(deleteFilmaticLinesBottlesReconciliation.pending, (state) => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteFilmaticLinesBottlesReconciliation.fulfilled, (state, action) => {
        state.loading.delete = false
        state.reconciliations = state.reconciliations.filter(reconciliation => reconciliation.id !== action.payload)
        if (state.currentReconciliation?.id === action.payload) {
          state.currentReconciliation = null
        }
      })
      .addCase(deleteFilmaticLinesBottlesReconciliation.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentReconciliation } = filmaticLinesBottlesReconciliationSlice.actions
export default filmaticLinesBottlesReconciliationSlice.reducer
