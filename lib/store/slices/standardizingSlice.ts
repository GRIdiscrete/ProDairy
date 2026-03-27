import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { standardizingFormApi, StandardizingForm, CreateStandardizingFormRequest } from "@/lib/api/standardizing-form"

interface StandardizingState {
  forms: StandardizingForm[]
  currentForm: StandardizingForm | null
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

const initialState: StandardizingState = {
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
export const fetchStandardizingForms = createAsyncThunk(
  "standardizing/fetchForms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await standardizingFormApi.getAll()
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch standardizing forms")
    }
  }
)

export const fetchStandardizingFormById = createAsyncThunk(
  "standardizing/fetchFormById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await standardizingFormApi.getById(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch standardizing form")
    }
  }
)

export const createStandardizingForm = createAsyncThunk(
  "standardizing/createForm",
  async (formData: CreateStandardizingFormRequest, { rejectWithValue }) => {
    try {
      const response = await standardizingFormApi.create(formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create standardizing form")
    }
  }
)

export const updateStandardizingForm = createAsyncThunk(
  "standardizing/updateForm",
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await standardizingFormApi.update(formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update standardizing form")
    }
  }
)

export const deleteStandardizingForm = createAsyncThunk(
  "standardizing/deleteForm",
  async (id: string, { rejectWithValue }) => {
    try {
      await standardizingFormApi.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete standardizing form")
    }
  }
)

const standardizingSlice = createSlice({
  name: "standardizing",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentForm: (state, action: PayloadAction<StandardizingForm | null>) => {
      state.currentForm = action.payload
    },
    clearCurrentForm: (state) => {
      state.currentForm = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all forms
    builder
      .addCase(fetchStandardizingForms.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchStandardizingForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.forms = action.payload
        state.isInitialized = true
      })
      .addCase(fetchStandardizingForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch form by ID
    builder
      .addCase(fetchStandardizingFormById.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchStandardizingFormById.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.currentForm = action.payload
      })
      .addCase(fetchStandardizingFormById.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.payload as string
      })

    // Create form
    builder
      .addCase(createStandardizingForm.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createStandardizingForm.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.forms.unshift(action.payload) // Add to beginning of array
      })
      .addCase(createStandardizingForm.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })

    // Update form
    builder
      .addCase(updateStandardizingForm.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateStandardizingForm.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.forms.findIndex(form => form.id === action.payload.id)
        if (index !== -1) {
          state.forms[index] = action.payload
        }
        if (state.currentForm?.id === action.payload.id) {
          state.currentForm = action.payload
        }
      })
      .addCase(updateStandardizingForm.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })

    // Delete form
    builder
      .addCase(deleteStandardizingForm.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteStandardizingForm.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null
        }
      })
      .addCase(deleteStandardizingForm.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentForm, clearCurrentForm } = standardizingSlice.actions
export default standardizingSlice.reducer
