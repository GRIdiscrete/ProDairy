import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  bmtControlFormApi,
  BMTControlForm,
  CreateBMTControlFormRequest,
  UpdateBMTControlFormRequest,
} from '@/lib/api/bmt-control-form'

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

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchBMTControlForms = createAsyncThunk(
  'bmtControlForms/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { bmtControlForms: BMTControlFormState }
      const { lastFetched, isInitialized } = state.bmtControlForms

      if (isInitialized && lastFetched && Date.now() - lastFetched < 5000) {
        return state.bmtControlForms.forms
      }

      return await bmtControlFormApi.getAll()
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to fetch BMT control forms')
    }
  }
)

export const fetchBMTControlForm = createAsyncThunk(
  'bmtControlForms/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      return await bmtControlFormApi.getById(id)
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to fetch BMT control form')
    }
  }
)

export const createBMTControlFormAction = createAsyncThunk(
  'bmtControlForms/create',
  async (formData: CreateBMTControlFormRequest, { rejectWithValue }) => {
    try {
      const response = await bmtControlFormApi.create(formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to create BMT control form')
    }
  }
)

export const updateBMTControlFormAction = createAsyncThunk(
  'bmtControlForms/update',
  async (formData: UpdateBMTControlFormRequest, { rejectWithValue }) => {
    try {
      console.log('BMT Slice - Update Payload:', formData)
      const response = await bmtControlFormApi.update(formData)
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
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to delete BMT control form')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

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
      // Fetch all
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

      // Fetch one
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

      // Create
      .addCase(createBMTControlFormAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createBMTControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.forms.unshift(action.payload)
        state.lastFetched = null
      })
      .addCase(createBMTControlFormAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })

      // Update
      .addCase(updateBMTControlFormAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateBMTControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.forms.findIndex((f) => f.id === action.payload.id)
        if (index !== -1) state.forms[index] = action.payload
        if (state.currentForm?.id === action.payload.id) state.currentForm = action.payload
        state.lastFetched = null
      })
      .addCase(updateBMTControlFormAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })

      // Delete
      .addCase(deleteBMTControlFormAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteBMTControlFormAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.forms = state.forms.filter((f) => f.id !== action.payload)
        if (state.currentForm?.id === action.payload) state.currentForm = null
      })
      .addCase(deleteBMTControlFormAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentForm, clearCurrentForm } = bmtControlFormSlice.actions
export default bmtControlFormSlice.reducer
