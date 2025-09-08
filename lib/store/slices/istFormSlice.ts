import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  ISTForm,
  getISTForms,
  getISTForm,
  createISTForm,
  updateISTForm,
  deleteISTForm
} from '@/lib/api/data-capture-forms'

interface ISTFormState {
  forms: ISTForm[]
  currentForm: ISTForm | null
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

const initialState: ISTFormState = {
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
export const fetchISTForms = createAsyncThunk(
  'istForms/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { istForms: ISTFormState }
      const { lastFetched, isInitialized } = state.istForms
      
      // Skip if recently fetched (within 5 seconds)
      if (isInitialized && lastFetched && Date.now() - lastFetched < 5000) {
        return state.istForms.forms
      }
      
      const forms = await getISTForms()
      return forms
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch IST forms'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchISTForm = createAsyncThunk(
  'istForms/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const form = await getISTForm(id)
      return form
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch IST form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createISTFormAction = createAsyncThunk(
  'istForms/create',
  async (formData: Omit<ISTForm, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const newForm = await createISTForm(formData)
      return newForm
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create IST form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateISTFormAction = createAsyncThunk(
  'istForms/update',
  async (formData: ISTForm, { rejectWithValue }) => {
    try {
      const updatedForm = await updateISTForm(formData)
      return updatedForm
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update IST form'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteISTFormAction = createAsyncThunk(
  'istForms/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteISTForm(id)
      return id
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete IST form'
      return rejectWithValue(errorMessage)
    }
  }
)

const istFormSlice = createSlice({
  name: 'istForms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentForm: (state, action: PayloadAction<ISTForm | null>) => {
      state.currentForm = action.payload
    },
    clearCurrentForm: (state) => {
      state.currentForm = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all forms
      .addCase(fetchISTForms.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchISTForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.forms = action.payload
        state.lastFetched = Date.now()
        state.isInitialized = true
      })
      .addCase(fetchISTForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single form
      .addCase(fetchISTForm.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchISTForm.fulfilled, (state, action) => {
        state.loading = false
        state.currentForm = action.payload
      })
      .addCase(fetchISTForm.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create form
      .addCase(createISTFormAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createISTFormAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.forms.unshift(action.payload)
      })
      .addCase(createISTFormAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update form
      .addCase(updateISTFormAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateISTFormAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.forms.findIndex(form => form.id === action.payload.id)
        if (index !== -1) {
          state.forms[index] = action.payload
        }
        if (state.currentForm?.id === action.payload.id) {
          state.currentForm = action.payload
        }
      })
      .addCase(updateISTFormAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete form
      .addCase(deleteISTFormAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteISTFormAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null
        }
      })
      .addCase(deleteISTFormAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentForm, clearCurrentForm } = istFormSlice.actions
export default istFormSlice.reducer
