import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  getPalletiserSheets, 
  getPalletiserSheet, 
  createPalletiserSheet, 
  updatePalletiserSheet, 
  deletePalletiserSheet,
  PalletiserSheet
} from '@/lib/api/data-capture-forms'

interface PalletiserSheetState {
  sheets: PalletiserSheet[]
  currentSheet: PalletiserSheet | null
  loading: boolean
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
  error: string | null
  lastFetched: number | null
  isInitialized: boolean
}

const initialState: PalletiserSheetState = {
  sheets: [],
  currentSheet: null,
  loading: false,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false,
  },
  error: null,
  lastFetched: null,
  isInitialized: false,
}

// Async thunks
export const fetchPalletiserSheets = createAsyncThunk(
  'palletiserSheets/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { palletiserSheets: PalletiserSheetState }
      const { lastFetched, isInitialized } = state.palletiserSheets
      
      // Skip if recently fetched (within 5 seconds)
      if (isInitialized && lastFetched && Date.now() - lastFetched < 5000) {
        return state.palletiserSheets.sheets
      }
      
      const sheets = await getPalletiserSheets()
      return sheets
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch palletiser sheets'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchPalletiserSheet = createAsyncThunk(
  'palletiserSheets/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const sheet = await getPalletiserSheet(id)
      return sheet
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch palletiser sheet'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createPalletiserSheetAction = createAsyncThunk(
  'palletiserSheets/create',
  async (data: Omit<PalletiserSheet, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const sheet = await createPalletiserSheet(data)
      return sheet
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create palletiser sheet'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updatePalletiserSheetAction = createAsyncThunk(
  'palletiserSheets/update',
  async (args: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const { id, data } = args
      // merge id into payload expected by API
      const payload = { id, ...data }
      const sheet = await updatePalletiserSheet(payload as PalletiserSheet)
      return sheet
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update palletiser sheet'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deletePalletiserSheetAction = createAsyncThunk(
  'palletiserSheets/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deletePalletiserSheet(id)
      return id
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete palletiser sheet'
      return rejectWithValue(errorMessage)
    }
  }
)

const palletiserSheetSlice = createSlice({
  name: 'palletiserSheets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentSheet: (state, action: PayloadAction<PalletiserSheet | null>) => {
      state.currentSheet = action.payload
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch all sheets
      .addCase(fetchPalletiserSheets.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchPalletiserSheets.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.sheets = action.payload
        state.lastFetched = Date.now()
        state.isInitialized = true
      })
      .addCase(fetchPalletiserSheets.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single sheet
      .addCase(fetchPalletiserSheet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPalletiserSheet.fulfilled, (state, action) => {
        state.loading = false
        state.currentSheet = action.payload
      })
      .addCase(fetchPalletiserSheet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create sheet
      .addCase(createPalletiserSheetAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createPalletiserSheetAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        if (action.payload) {
          state.sheets.unshift(action.payload)
        }
        // Reset lastFetched to force refresh on next fetch
        state.lastFetched = null
      })
      .addCase(createPalletiserSheetAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update sheet
      .addCase(updatePalletiserSheetAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updatePalletiserSheetAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        if (action.payload) {
          const index = state.sheets.findIndex(sheet => sheet.id === action.payload.id)
          if (index !== -1) {
            state.sheets[index] = action.payload
          }
          if (state.currentSheet?.id === action.payload.id) {
            state.currentSheet = action.payload
          }
        }
        // Reset lastFetched to force refresh on next fetch
        state.lastFetched = null
      })
      .addCase(updatePalletiserSheetAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete sheet
      .addCase(deletePalletiserSheetAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deletePalletiserSheetAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.sheets = state.sheets.filter(sheet => sheet.id !== action.payload)
        if (state.currentSheet?.id === action.payload) {
          state.currentSheet = null
        }
      })
      .addCase(deletePalletiserSheetAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentSheet, resetState } = palletiserSheetSlice.actions
export default palletiserSheetSlice.reducer
