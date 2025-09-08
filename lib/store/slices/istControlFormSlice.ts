import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  ISTControlForm,
  getISTControlForms,
  getISTControlForm,
  createISTControlForm,
  updateISTControlForm,
  deleteISTControlForm
} from '@/lib/api/data-capture-forms'

interface ISTControlFormState {
  forms: ISTControlForm[]
  currentForm: ISTControlForm | null
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

const initialState: ISTControlFormState = {
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
export const fetchISTControlForms = createAsyncThunk(
  'istControlForms/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { istControlForms: ISTControlFormState }
      const { lastFetched, isInitialized } = state.istControlForms
      
      // Skip if recently fetched (within 5 seconds)
      if (isInitialized && lastFetched && Date.now() - lastFetched < 5000) {
        return state.istControlForms.forms
      }
      
      const forms = await getISTControlForms()
      return forms
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch IST control forms'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchISTControlForm = createAsyncThunk(
  'istControlForms/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const form = await getISTControlForm(id)
      return form
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch IST control form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createISTControlFormAction = createAsyncThunk(
  'istControlForms/create',
  async (formData: Omit<ISTControlForm, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const newForm = await createISTControlForm(formData)
      return newForm
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create IST control form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateISTControlFormAction = createAsyncThunk(
  'istControlForms/update',
  async (formData: ISTControlForm, { rejectWithValue }) => {
    try {
      const updatedForm = await updateISTControlForm(formData)
      return updatedForm
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update IST control form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteISTControlFormAction = createAsyncThunk(
  'istControlForms/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteISTControlForm(id)
      return id
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete IST control form'
      return rejectWithValue(errorMessage)
    }
  }
)

const istControlFormSlice = createSlice({
  name: 'istControlForms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentForm: (state, action: PayloadAction<ISTControlForm | null>) => {
      state.currentForm = action.payload
    },
    clearCurrentForm: (state) => {
      state.currentForm = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all forms
      .addCase(fetchISTControlForms.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchISTControlForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.forms = action.payload
        state.lastFetched = Date.now()
        state.isInitialized = true
      })
      .addCase(fetchISTControlForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single form
      .addCase(fetchISTControlForm.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchISTControlForm.fulfilled, (state, action) => {
        state.loading = false
        state.currentForm = action.payload
      })
      .addCase(fetchISTControlForm.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create form
      .addCase(createISTControlFormAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createISTControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        // Add the new form to the beginning of the list
        state.forms.unshift(action.payload)
        // Reset lastFetched to force a refresh on next fetch to get complete relationship data
        state.lastFetched = null
      })
      .addCase(createISTControlFormAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update form
      .addCase(updateISTControlFormAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateISTControlFormAction.fulfilled, (state, action) => {
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
      .addCase(updateISTControlFormAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete form
      .addCase(deleteISTControlFormAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteISTControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null
        }
      })
      .addCase(deleteISTControlFormAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentForm, clearCurrentForm } = istControlFormSlice.actions
export default istControlFormSlice.reducer
