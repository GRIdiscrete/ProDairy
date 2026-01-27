import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { pasteurizingApi, PasteurizingForm, CreatePasteurizingFormRequest, UpdatePasteurizingFormRequest } from "@/lib/api/pasteurizing"

interface PasteurizingState {
  forms: PasteurizingForm[]
  currentForm: PasteurizingForm | null
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

const initialState: PasteurizingState = {
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
export const fetchPasteurizingForms = createAsyncThunk(
  "pasteurizing/fetchForms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await pasteurizingApi.getAll()
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch pasteurizing forms")
    }
  }
)

export const fetchPasteurizingFormById = createAsyncThunk(
  "pasteurizing/fetchFormById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await pasteurizingApi.getById(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch pasteurizing form")
    }
  }
)

export const createPasteurizingForm = createAsyncThunk(
  "pasteurizing/createForm",
  async (formData: CreatePasteurizingFormRequest, { rejectWithValue }) => {
    try {
      const response = await pasteurizingApi.create(formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create pasteurizing form")
    }
  }
)

export const updatePasteurizingForm = createAsyncThunk(
  "pasteurizing/updateForm",
  async ({ id, formData }: { id: string; formData: UpdatePasteurizingFormRequest }, { rejectWithValue }) => {
    try {
      const response = await pasteurizingApi.update(id, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update pasteurizing form")
    }
  }
)

export const deletePasteurizingForm = createAsyncThunk(
  "pasteurizing/deleteForm",
  async (id: string, { rejectWithValue }) => {
    try {
      await pasteurizingApi.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete pasteurizing form")
    }
  }
)

const pasteurizingSlice = createSlice({
  name: "pasteurizing",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentForm: (state, action: PayloadAction<PasteurizingForm | null>) => {
      state.currentForm = action.payload
    },
    clearCurrentForm: (state) => {
      state.currentForm = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all forms
    builder
      .addCase(fetchPasteurizingForms.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchPasteurizingForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.forms = action.payload
        state.isInitialized = true
      })
      .addCase(fetchPasteurizingForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch form by ID
    builder
      .addCase(fetchPasteurizingFormById.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchPasteurizingFormById.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.currentForm = action.payload
      })
      .addCase(fetchPasteurizingFormById.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.payload as string
      })

    // Create form
    builder
      .addCase(createPasteurizingForm.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createPasteurizingForm.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.forms.unshift(action.payload) // Add to beginning of array
      })
      .addCase(createPasteurizingForm.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })

    // Update form
    builder
      .addCase(updatePasteurizingForm.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updatePasteurizingForm.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.forms.findIndex(form => form.id === action.payload.id)
        if (index !== -1) {
          state.forms[index] = action.payload
        }
        if (state.currentForm?.id === action.payload.id) {
          state.currentForm = action.payload
        }
      })
      .addCase(updatePasteurizingForm.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })

    // Delete form
    builder
      .addCase(deletePasteurizingForm.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deletePasteurizingForm.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null
        }
      })
      .addCase(deletePasteurizingForm.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentForm, clearCurrentForm } = pasteurizingSlice.actions
export default pasteurizingSlice.reducer
