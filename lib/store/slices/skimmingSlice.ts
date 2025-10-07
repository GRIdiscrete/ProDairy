import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { skimmingFormApi, SkimmingForm, CreateSkimmingFormRequest } from "@/lib/api/skimming-form"

interface SkimmingState {
  forms: SkimmingForm[]
  currentForm: SkimmingForm | null
  loading: boolean
  error: string | null
  operationLoading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  isInitialized: boolean
}

const initialState: SkimmingState = {
  forms: [],
  currentForm: null,
  loading: false,
  error: null,
  operationLoading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  isInitialized: false,
}

// Async thunks
export const fetchSkimmingForms = createAsyncThunk(
  "skimming/fetchForms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await skimmingFormApi.getAll()
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch skimming forms")
    }
  }
)

export const fetchSkimmingFormById = createAsyncThunk(
  "skimming/fetchFormById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await skimmingFormApi.getById(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch skimming form")
    }
  }
)

export const createSkimmingForm = createAsyncThunk(
  "skimming/createForm",
  async (formData: CreateSkimmingFormRequest, { rejectWithValue }) => {
    try {
      const response = await skimmingFormApi.create(formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create skimming form")
    }
  }
)

export const updateSkimmingForm = createAsyncThunk(
  "skimming/updateForm",
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await skimmingFormApi.update(formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update skimming form")
    }
  }
)

export const deleteSkimmingForm = createAsyncThunk(
  "skimming/deleteForm",
  async (id: string, { rejectWithValue }) => {
    try {
      await skimmingFormApi.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete skimming form")
    }
  }
)

const skimmingSlice = createSlice({
  name: "skimming",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentForm: (state, action: PayloadAction<SkimmingForm | null>) => {
      state.currentForm = action.payload
    },
    clearCurrentForm: (state) => {
      state.currentForm = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all forms
    builder
      .addCase(fetchSkimmingForms.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchSkimmingForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.forms = action.payload
        state.isInitialized = true
      })
      .addCase(fetchSkimmingForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch form by ID
    builder
      .addCase(fetchSkimmingFormById.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchSkimmingFormById.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.currentForm = action.payload
      })
      .addCase(fetchSkimmingFormById.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.payload as string
      })

    // Create form
    builder
      .addCase(createSkimmingForm.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createSkimmingForm.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.forms.unshift(action.payload) // Add to beginning of array
      })
      .addCase(createSkimmingForm.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })

    // Update form
    builder
      .addCase(updateSkimmingForm.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateSkimmingForm.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.forms.findIndex(form => form.id === action.payload.id)
        if (index !== -1) {
          state.forms[index] = action.payload
        }
        if (state.currentForm?.id === action.payload.id) {
          state.currentForm = action.payload
        }
      })
      .addCase(updateSkimmingForm.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })

    // Delete form
    builder
      .addCase(deleteSkimmingForm.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteSkimmingForm.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null
        }
      })
      .addCase(deleteSkimmingForm.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentForm, clearCurrentForm } = skimmingSlice.actions
export default skimmingSlice.reducer
