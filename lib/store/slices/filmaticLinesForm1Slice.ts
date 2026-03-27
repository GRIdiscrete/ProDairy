import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { filmaticLinesForm1Api, FilmaticLinesForm1, CreateFilmaticLinesForm1Request } from '@/lib/api/filmatic-lines-form-1'

// Initial state
interface FilmaticLinesForm1State {
  forms: FilmaticLinesForm1[]
  loading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: string | null
  isInitialized: boolean
}

const initialState: FilmaticLinesForm1State = {
  forms: [],
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
export const fetchFilmaticLinesForm1s = createAsyncThunk(
  'filmaticLinesForm1/fetchForms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesForm1Api.getForms()
      // Handle the API response structure: { statusCode, message, data }
      return response.data || response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Filmatic Lines Form 1')
    }
  }
)

export const createFilmaticLinesForm1 = createAsyncThunk(
  'filmaticLinesForm1/createForm',
  async (formData: CreateFilmaticLinesForm1Request, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesForm1Api.createForm(formData)
      // Handle the API response structure: { statusCode, message, data }
      return response.data || response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create Filmatic Lines Form 1')
    }
  }
)

export const updateFilmaticLinesForm1 = createAsyncThunk(
  'filmaticLinesForm1/updateForm',
  async ({ id, data }: { id: string; data: Partial<CreateFilmaticLinesForm1Request> }, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesForm1Api.updateForm(id, data)
      // Handle the API response structure: { statusCode, message, data }
      return response.data || response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update Filmatic Lines Form 1')
    }
  }
)

export const deleteFilmaticLinesForm1 = createAsyncThunk(
  'filmaticLinesForm1/deleteForm',
  async (id: string, { rejectWithValue }) => {
    try {
      await filmaticLinesForm1Api.deleteForm(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete Filmatic Lines Form 1')
    }
  }
)

// Slice
const filmaticLinesForm1Slice = createSlice({
  name: 'filmaticLinesForm1',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetState: (state) => {
      state.forms = []
      state.loading = {
        fetch: false,
        create: false,
        update: false,
        delete: false,
      }
      state.error = null
      state.isInitialized = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch forms
      .addCase(fetchFilmaticLinesForm1s.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesForm1s.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.forms = action.payload
        state.isInitialized = true
      })
      .addCase(fetchFilmaticLinesForm1s.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      
      // Create form
      .addCase(createFilmaticLinesForm1.pending, (state) => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createFilmaticLinesForm1.fulfilled, (state, action) => {
        state.loading.create = false
        state.forms.unshift(action.payload) // Add to beginning of array
      })
      .addCase(createFilmaticLinesForm1.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.payload as string
      })
      
      // Update form
      .addCase(updateFilmaticLinesForm1.pending, (state) => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateFilmaticLinesForm1.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.forms.findIndex(form => form.id === action.payload.id)
        if (index !== -1) {
          state.forms[index] = action.payload
        }
      })
      .addCase(updateFilmaticLinesForm1.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.payload as string
      })
      
      // Delete form
      .addCase(deleteFilmaticLinesForm1.pending, (state) => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteFilmaticLinesForm1.fulfilled, (state, action) => {
        state.loading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
      })
      .addCase(deleteFilmaticLinesForm1.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, resetState } = filmaticLinesForm1Slice.actions
export default filmaticLinesForm1Slice.reducer
