import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { bmtControlFormApi, BMTControlForm } from '@/lib/api/bmt-control-form'

interface BMTControlFormState {
  forms: BMTControlForm[]
  currentForm: BMTControlForm | null
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

const initialState: BMTControlFormState = {
  forms: [],
  currentForm: null,
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
export const fetchBMTControlForms = createAsyncThunk(
  'bmtControlForms/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { bmtControlForms: BMTControlFormState }
      const { lastFetched, isInitialized } = state.bmtControlForms
      
      // Skip if recently fetched (within 5 seconds)
      if (isInitialized && lastFetched && Date.now() - lastFetched < 5000) {
        return state.bmtControlForms.forms
      }
      
      const forms = await bmtControlFormApi.getAll()
      
     
      
      return forms
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch BMT control forms'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchBMTControlForm = createAsyncThunk(
  'bmtControlForms/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const form = await bmtControlFormApi.getById(id)
      return form
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch BMT control form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createBMTControlFormAction = createAsyncThunk(
  'bmtControlForms/create',
  async (formData: Omit<BMTControlForm, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await bmtControlFormApi.create(formData)
      return response.data
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create BMT control form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateBMTControlFormAction = createAsyncThunk(
  'bmtControlForm/update',
  async (payload: { id: string; formData: any }, { rejectWithValue }) => {
    try {
      console.log('BMT Slice - Update ID:', payload.id)
      console.log('BMT Slice - Update Payload:', payload.formData)
      
      const response = await bmtControlFormApi.update(payload.id, payload.formData)
      return response.data
    } catch (error: any) {
      console.error('BMT Slice - Update Error:', error)
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to update BMT control form')
    }
  }
)

export const deleteBMTControlFormAction = createAsyncThunk(
  'bmtControlForms/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await bmtControlFormApi.delete(id)
      return id
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete BMT control form'
      return rejectWithValue(errorMessage)
    }
  }
)

const bmtControlFormSlice = createSlice({
  name: 'bmtControlForms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentForm: (state, action: PayloadAction<BMTControlForm | null>) => {
      state.currentForm = action.payload
    },
    clearCurrentForm: (state) => {
      state.currentForm = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all forms
      .addCase(fetchBMTControlForms.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchBMTControlForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.forms = action.payload
        state.lastFetched = Date.now()
        state.isInitialized = true
      })
      .addCase(fetchBMTControlForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single form
      .addCase(fetchBMTControlForm.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBMTControlForm.fulfilled, (state, action) => {
        state.loading = false
        state.currentForm = action.payload
      })
      .addCase(fetchBMTControlForm.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create form
      .addCase(createBMTControlFormAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createBMTControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        // Add the new form to the beginning of the list
        state.forms.unshift(action.payload)
        // Reset lastFetched to force a refresh on next fetch to get complete relationship data
        state.lastFetched = null
      })
      .addCase(createBMTControlFormAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update form
      .addCase(updateBMTControlFormAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateBMTControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.forms.findIndex(form => form.id === action.payload.id)
        if (index !== -1) {
          state.forms[index] = action.payload
        }
        if (state.currentForm?.id === action.payload.id) {
          state.currentForm = action.payload
        }
        // Reset lastFetched to force a refresh on next fetch to get complete relationship data
        state.lastFetched = null
      })
      .addCase(updateBMTControlFormAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete form
      .addCase(deleteBMTControlFormAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteBMTControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null
        }
      })
      .addCase(deleteBMTControlFormAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentForm, clearCurrentForm } = bmtControlFormSlice.actions
export default bmtControlFormSlice.reducer
