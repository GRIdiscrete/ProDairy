import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { filmaticLinesApi, FilmaticLinesStoppageTimeMinutes, CreateFilmaticLinesStoppageTimeMinutesRequest, UpdateFilmaticLinesStoppageTimeMinutesRequest } from '@/lib/api/filmatic-lines'

interface FilmaticLinesStoppageTimeMinutesState {
  stoppages: FilmaticLinesStoppageTimeMinutes[]
  currentStoppage: FilmaticLinesStoppageTimeMinutes | null
  loading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: string | null
}

const initialState: FilmaticLinesStoppageTimeMinutesState = {
  stoppages: [],
  currentStoppage: null,
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
}

// Async thunks
export const fetchFilmaticLinesStoppageTimeMinutes = createAsyncThunk(
  'filmaticLinesStoppageTimeMinutes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getStoppageTimeMinutes()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch stoppage time minutes')
    }
  }
)

export const fetchFilmaticLinesStoppageTimeMinutesByDetail = createAsyncThunk(
  'filmaticLinesStoppageTimeMinutes/fetchByDetail',
  async (detailId: string, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.getStoppageTimeMinutesByDetail(detailId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch stoppage time minutes')
    }
  }
)

export const createFilmaticLinesStoppageTimeMinutes = createAsyncThunk(
  'filmaticLinesStoppageTimeMinutes/create',
  async (data: CreateFilmaticLinesStoppageTimeMinutesRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.createStoppageTimeMinutes(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create stoppage time minutes')
    }
  }
)

export const updateFilmaticLinesStoppageTimeMinutes = createAsyncThunk(
  'filmaticLinesStoppageTimeMinutes/update',
  async (data: UpdateFilmaticLinesStoppageTimeMinutesRequest, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesApi.updateStoppageTimeMinutes(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update stoppage time minutes')
    }
  }
)

export const deleteFilmaticLinesStoppageTimeMinutes = createAsyncThunk(
  'filmaticLinesStoppageTimeMinutes/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await filmaticLinesApi.deleteStoppageTimeMinutes(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete stoppage time minutes')
    }
  }
)

const filmaticLinesStoppageTimeMinutesSlice = createSlice({
  name: 'filmaticLinesStoppageTimeMinutes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentStoppage: (state, action: PayloadAction<FilmaticLinesStoppageTimeMinutes | null>) => {
      state.currentStoppage = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all stoppages
      .addCase(fetchFilmaticLinesStoppageTimeMinutes.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesStoppageTimeMinutes.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.stoppages = action.payload
      })
      .addCase(fetchFilmaticLinesStoppageTimeMinutes.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      // Fetch stoppages by detail
      .addCase(fetchFilmaticLinesStoppageTimeMinutesByDetail.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesStoppageTimeMinutesByDetail.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.stoppages = action.payload
      })
      .addCase(fetchFilmaticLinesStoppageTimeMinutesByDetail.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      // Create stoppage
      .addCase(createFilmaticLinesStoppageTimeMinutes.pending, (state) => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createFilmaticLinesStoppageTimeMinutes.fulfilled, (state, action) => {
        state.loading.create = false
        state.stoppages.unshift(action.payload)
      })
      .addCase(createFilmaticLinesStoppageTimeMinutes.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.payload as string
      })
      // Update stoppage
      .addCase(updateFilmaticLinesStoppageTimeMinutes.pending, (state) => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateFilmaticLinesStoppageTimeMinutes.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.stoppages.findIndex(stoppage => stoppage.id === action.payload.id)
        if (index !== -1) {
          state.stoppages[index] = action.payload
        }
        if (state.currentStoppage?.id === action.payload.id) {
          state.currentStoppage = action.payload
        }
      })
      .addCase(updateFilmaticLinesStoppageTimeMinutes.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.payload as string
      })
      // Delete stoppage
      .addCase(deleteFilmaticLinesStoppageTimeMinutes.pending, (state) => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteFilmaticLinesStoppageTimeMinutes.fulfilled, (state, action) => {
        state.loading.delete = false
        state.stoppages = state.stoppages.filter(stoppage => stoppage.id !== action.payload)
        if (state.currentStoppage?.id === action.payload) {
          state.currentStoppage = null
        }
      })
      .addCase(deleteFilmaticLinesStoppageTimeMinutes.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentStoppage } = filmaticLinesStoppageTimeMinutesSlice.actions
export default filmaticLinesStoppageTimeMinutesSlice.reducer
