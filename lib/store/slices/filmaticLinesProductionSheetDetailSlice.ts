import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { filmaticLinesApi, FilmaticLinesProductionSheetDetail, CreateFilmaticLinesProductionSheetDetailRequest, UpdateFilmaticLinesProductionSheetDetailRequest } from '@/lib/api/filmatic-lines'

interface FilmaticLinesProductionSheetDetailState {
  details: FilmaticLinesProductionSheetDetail[]
  currentDetail: FilmaticLinesProductionSheetDetail | null
  loading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: string | null
}

const initialState: FilmaticLinesProductionSheetDetailState = {
  details: [],
  currentDetail: null,
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
}

// Async thunks
export const fetchFilmaticLinesProductionSheetDetails = createAsyncThunk(
  'filmaticLinesProductionSheetDetails/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getProductionSheetDetails()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch production sheet details')
    }
  }
)

export const fetchFilmaticLinesProductionSheetDetailsBySheet = createAsyncThunk(
  'filmaticLinesProductionSheetDetails/fetchBySheet',
  async (sheetId: string, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getProductionSheetDetailsBySheet(sheetId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch production sheet details')
    }
  }
)

export const createFilmaticLinesProductionSheetDetail = createAsyncThunk(
  'filmaticLinesProductionSheetDetails/create',
  async (data: CreateFilmaticLinesProductionSheetDetailRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.createProductionSheetDetail(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create production sheet detail')
    }
  }
)

export const updateFilmaticLinesProductionSheetDetail = createAsyncThunk(
  'filmaticLinesProductionSheetDetails/update',
  async (data: UpdateFilmaticLinesProductionSheetDetailRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.updateProductionSheetDetail(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update production sheet detail')
    }
  }
)

export const deleteFilmaticLinesProductionSheetDetail = createAsyncThunk(
  'filmaticLinesProductionSheetDetails/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await filmaticLinesApi.deleteProductionSheetDetail(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete production sheet detail')
    }
  }
)

const filmaticLinesProductionSheetDetailSlice = createSlice({
  name: 'filmaticLinesProductionSheetDetails',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentDetail: (state, action: PayloadAction<FilmaticLinesProductionSheetDetail | null>) => {
      state.currentDetail = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all details
      .addCase(fetchFilmaticLinesProductionSheetDetails.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesProductionSheetDetails.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.details = action.payload
      })
      .addCase(fetchFilmaticLinesProductionSheetDetails.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      // Fetch details by sheet
      .addCase(fetchFilmaticLinesProductionSheetDetailsBySheet.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesProductionSheetDetailsBySheet.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.details = action.payload
      })
      .addCase(fetchFilmaticLinesProductionSheetDetailsBySheet.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      // Create detail
      .addCase(createFilmaticLinesProductionSheetDetail.pending, (state) => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createFilmaticLinesProductionSheetDetail.fulfilled, (state, action) => {
        state.loading.create = false
        state.details.unshift(action.payload)
      })
      .addCase(createFilmaticLinesProductionSheetDetail.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.payload as string
      })
      // Update detail
      .addCase(updateFilmaticLinesProductionSheetDetail.pending, (state) => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateFilmaticLinesProductionSheetDetail.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.details.findIndex(detail => detail.id === action.payload.id)
        if (index !== -1) {
          state.details[index] = action.payload
        }
        if (state.currentDetail?.id === action.payload.id) {
          state.currentDetail = action.payload
        }
      })
      .addCase(updateFilmaticLinesProductionSheetDetail.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.payload as string
      })
      // Delete detail
      .addCase(deleteFilmaticLinesProductionSheetDetail.pending, (state) => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteFilmaticLinesProductionSheetDetail.fulfilled, (state, action) => {
        state.loading.delete = false
        state.details = state.details.filter(detail => detail.id !== action.payload)
        if (state.currentDetail?.id === action.payload) {
          state.currentDetail = null
        }
      })
      .addCase(deleteFilmaticLinesProductionSheetDetail.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentDetail } = filmaticLinesProductionSheetDetailSlice.actions
export default filmaticLinesProductionSheetDetailSlice.reducer
