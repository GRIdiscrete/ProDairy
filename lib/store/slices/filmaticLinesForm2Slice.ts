import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { filmaticLinesForm2Api, FilmaticLinesForm2, CreateFilmaticLinesForm2Request } from '@/lib/api/filmatic-lines-form-2'

// Initial state
interface FilmaticLinesForm2State {
  forms: FilmaticLinesForm2[]
  loading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: string | null
  isInitialized: boolean
}

const initialState: FilmaticLinesForm2State = {
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
export const fetchFilmaticLinesForm2s = createAsyncThunk(
  'filmaticLinesForm2/fetchForms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesForm2Api.getForms()
      // Handle the API response structure: { statusCode, message, data }
      return response.data || response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Filmatic Lines Form 2')
    }
  }
)

export const createFilmaticLinesForm2 = createAsyncThunk(
  'filmaticLinesForm2/createForm',
  async (formData: CreateFilmaticLinesForm2Request, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesForm2Api.createForm(formData)
      // Handle the API response structure: { statusCode, message, data }
      return response.data || response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create Filmatic Lines Form 2')
    }
  }
)

export const updateFilmaticLinesForm2 = createAsyncThunk(
  'filmaticLinesForm2/updateForm',
  async ({ id, data }: { id: string; data: Partial<CreateFilmaticLinesForm2Request> }, { rejectWithValue }) => {
    try {
      const response = await filmaticLinesForm2Api.updateForm(id, data)
      // Handle the API response structure: { statusCode, message, data }
      return response.data || response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update Filmatic Lines Form 2')
    }
  }
)

export const deleteFilmaticLinesForm2 = createAsyncThunk(
  'filmaticLinesForm2/deleteForm',
  async (id: string, { rejectWithValue }) => {
    try {
      await filmaticLinesForm2Api.deleteForm(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete Filmatic Lines Form 2')
    }
  }
)

// Slice
const filmaticLinesForm2Slice = createSlice({
  name: 'filmaticLinesForm2',
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
      .addCase(fetchFilmaticLinesForm2s.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchFilmaticLinesForm2s.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.forms = action.payload
        state.isInitialized = true
      })
      .addCase(fetchFilmaticLinesForm2s.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
      })
      
      // Create form
      .addCase(createFilmaticLinesForm2.pending, (state) => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createFilmaticLinesForm2.fulfilled, (state, action) => {
        state.loading.create = false
        state.forms.unshift(action.payload) // Add to beginning of array
      })
      .addCase(createFilmaticLinesForm2.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.payload as string
      })
      
      // Update form
      .addCase(updateFilmaticLinesForm2.pending, (state) => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateFilmaticLinesForm2.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.forms.findIndex(form => form.id === action.payload.id)
        if (index !== -1) {
          state.forms[index] = action.payload
        }
      })
      .addCase(updateFilmaticLinesForm2.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.payload as string
      })
      
      // Delete form
      .addCase(deleteFilmaticLinesForm2.pending, (state) => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteFilmaticLinesForm2.fulfilled, (state, action) => {
        state.loading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
      })
      .addCase(deleteFilmaticLinesForm2.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, resetState } = filmaticLinesForm2Slice.actions
export default filmaticLinesForm2Slice.reducer

