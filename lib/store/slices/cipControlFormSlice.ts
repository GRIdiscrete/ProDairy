import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  CIPControlForm,
  getCIPControlForms,
  getCIPControlForm,
  createCIPControlForm,
  updateCIPControlForm,
  deleteCIPControlForm
} from '@/lib/api/data-capture-forms'

interface CIPControlFormState {
  forms: CIPControlForm[]
  currentForm: CIPControlForm | null
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

const initialState: CIPControlFormState = {
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
export const fetchCIPControlForms = createAsyncThunk(
  'cipControlForms/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cipControlForms: CIPControlFormState }
      const { lastFetched, isInitialized } = state.cipControlForms
      
      // Skip if recently fetched (within 5 seconds)
      if (isInitialized && lastFetched && Date.now() - lastFetched < 5000) {
        return state.cipControlForms.forms
      }
      
      const forms = await getCIPControlForms()
      return forms
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch CIP control forms'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchCIPControlForm = createAsyncThunk(
  'cipControlForms/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const form = await getCIPControlForm(id)
      return form
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch CIP control form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createCIPControlFormAction = createAsyncThunk(
  'cipControlForms/create',
  async (formData: Omit<CIPControlForm, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const newForm = await createCIPControlForm(formData)
      return newForm
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create CIP control form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateCIPControlFormAction = createAsyncThunk(
  'cipControlForms/update',
  async (formData: CIPControlForm, { rejectWithValue }) => {
    try {
      const updatedForm = await updateCIPControlForm(formData)
      return updatedForm
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update CIP control form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteCIPControlFormAction = createAsyncThunk(
  'cipControlForms/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteCIPControlForm(id)
      return id
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete CIP control form'
      return rejectWithValue(errorMessage)
    }
  }
)

const cipControlFormSlice = createSlice({
  name: 'cipControlForms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentForm: (state, action: PayloadAction<CIPControlForm | null>) => {
      state.currentForm = action.payload
    },
    clearCurrentForm: (state) => {
      state.currentForm = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all forms
      .addCase(fetchCIPControlForms.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchCIPControlForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.forms = action.payload
        state.lastFetched = Date.now()
        state.isInitialized = true
      })
      .addCase(fetchCIPControlForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single form
      .addCase(fetchCIPControlForm.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCIPControlForm.fulfilled, (state, action) => {
        state.loading = false
        state.currentForm = action.payload
      })
      .addCase(fetchCIPControlForm.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create form
      .addCase(createCIPControlFormAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createCIPControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        // Add the new form to the beginning of the list
        state.forms.unshift(action.payload)
        // Reset lastFetched to force a refresh on next fetch to get complete relationship data
        state.lastFetched = null
      })
      .addCase(createCIPControlFormAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update form
      .addCase(updateCIPControlFormAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateCIPControlFormAction.fulfilled, (state, action) => {
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
      .addCase(updateCIPControlFormAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete form
      .addCase(deleteCIPControlFormAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteCIPControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null
        }
      })
      .addCase(deleteCIPControlFormAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentForm, clearCurrentForm } = cipControlFormSlice.actions
export default cipControlFormSlice.reducer
