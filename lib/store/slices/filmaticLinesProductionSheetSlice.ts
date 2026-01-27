import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { filmaticLinesApi, FilmaticLinesProductionSheet, CreateFilmaticLinesProductionSheetRequest, UpdateFilmaticLinesProductionSheetRequest } from '@/lib/api/filmatic-lines'

interface FilmaticLinesProductionSheetState {
  sheets: FilmaticLinesProductionSheet[]
  currentSheet: FilmaticLinesProductionSheet | null
  loading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: string | null
  isInitialized: boolean
}

const initialState: FilmaticLinesProductionSheetState = {
  sheets: [],
  currentSheet: null,
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
  isInitialized: false,
}

// Async thunks
export const fetchFilmaticLinesProductionSheets = createAsyncThunk(
  'filmaticLinesProductionSheets/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getProductionSheets()
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch production sheets')
    }
  }
)

export const fetchFilmaticLinesProductionSheet = createAsyncThunk(
  'filmaticLinesProductionSheets/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getProductionSheet(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch production sheet')
    }
  }
)

export const createFilmaticLinesProductionSheet = createAsyncThunk(
  'filmaticLinesProductionSheets/create',
  async (data: CreateFilmaticLinesProductionSheetRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.createProductionSheet(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create production sheet')
    }
  }
)

export const updateFilmaticLinesProductionSheet = createAsyncThunk(
  'filmaticLinesProductionSheets/update',
  async (data: UpdateFilmaticLinesProductionSheetRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.updateProductionSheet(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update production sheet')
    }
  }
)

export const deleteFilmaticLinesProductionSheet = createAsyncThunk(
  'filmaticLinesProductionSheets/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await filmaticLinesApi.deleteProductionSheet(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete production sheet')
    }
  }
)

const filmaticLinesProductionSheetSlice = createSlice({
  name: 'filmaticLinesProductionSheets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentSheet: (state, action: PayloadAction<FilmaticLinesProductionSheet | null>) => {
      state.currentSheet = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all sheets
      .addCase(fetchFilmaticLinesProductionSheets.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesProductionSheets.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.sheets = action.payload
        state.isInitialized = true
      })
      .addCase(fetchFilmaticLinesProductionSheets.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
        state.isInitialized = true
      })
      // Fetch single sheet
      .addCase(fetchFilmaticLinesProductionSheet.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesProductionSheet.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.currentSheet = action.payload
      })
      .addCase(fetchFilmaticLinesProductionSheet.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      // Create sheet
      .addCase(createFilmaticLinesProductionSheet.pending, (state) => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createFilmaticLinesProductionSheet.fulfilled, (state, action) => {
        state.loading.create = false
        state.sheets.unshift(action.payload)
      })
      .addCase(createFilmaticLinesProductionSheet.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.payload as string
      })
      // Update sheet
      .addCase(updateFilmaticLinesProductionSheet.pending, (state) => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateFilmaticLinesProductionSheet.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.sheets.findIndex(sheet => sheet.id === action.payload.id)
        if (index !== -1) {
          state.sheets[index] = action.payload
        }
        if (state.currentSheet?.id === action.payload.id) {
          state.currentSheet = action.payload
        }
      })
      .addCase(updateFilmaticLinesProductionSheet.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.payload as string
      })
      // Delete sheet
      .addCase(deleteFilmaticLinesProductionSheet.pending, (state) => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteFilmaticLinesProductionSheet.fulfilled, (state, action) => {
        state.loading.delete = false
        state.sheets = state.sheets.filter(sheet => sheet.id !== action.payload)
        if (state.currentSheet?.id === action.payload) {
          state.currentSheet = null
        }
      })
      .addCase(deleteFilmaticLinesProductionSheet.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentSheet } = filmaticLinesProductionSheetSlice.actions
export default filmaticLinesProductionSheetSlice.reducer
