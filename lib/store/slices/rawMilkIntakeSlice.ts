import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { rawMilkIntakeApi, RawMilkIntakeForm, CreateRawMilkIntakeFormRequest } from "@/lib/api/raw-milk-intake"

interface RawMilkIntakeState {
  forms: RawMilkIntakeForm[]
  currentForm: RawMilkIntakeForm | null
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

const initialState: RawMilkIntakeState = {
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
export const fetchRawMilkIntakeForms = createAsyncThunk(
  "rawMilkIntake/fetchForms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.getAll()
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch raw milk intake forms")
    }
  }
)

export const fetchRawMilkIntakeFormById = createAsyncThunk(
  "rawMilkIntake/fetchFormById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.getById(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch raw milk intake form")
    }
  }
)

export const createRawMilkIntakeForm = createAsyncThunk(
  "rawMilkIntake/createForm",
  async (formData: CreateRawMilkIntakeFormRequest, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.create(formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create raw milk intake form")
    }
  }
)

export const updateRawMilkIntakeForm = createAsyncThunk(
  "rawMilkIntake/updateForm",
  async ({ id, formData }: { id: string; formData: Partial<CreateRawMilkIntakeFormRequest> }, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.update(id, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update raw milk intake form")
    }
  }
)

export const deleteRawMilkIntakeForm = createAsyncThunk(
  "rawMilkIntake/deleteForm",
  async (id: string, { rejectWithValue }) => {
    try {
      await rawMilkIntakeApi.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete raw milk intake form")
    }
  }
)

const rawMilkIntakeSlice = createSlice({
  name: "rawMilkIntake",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentForm: (state, action: PayloadAction<RawMilkIntakeForm | null>) => {
      state.currentForm = action.payload
    },
    clearCurrentForm: (state) => {
      state.currentForm = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all forms
    builder
      .addCase(fetchRawMilkIntakeForms.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchRawMilkIntakeForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.forms = action.payload
        state.isInitialized = true
      })
      .addCase(fetchRawMilkIntakeForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch form by ID
    builder
      .addCase(fetchRawMilkIntakeFormById.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchRawMilkIntakeFormById.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.currentForm = action.payload
      })
      .addCase(fetchRawMilkIntakeFormById.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.payload as string
      })

    // Create form
    builder
      .addCase(createRawMilkIntakeForm.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createRawMilkIntakeForm.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.forms.unshift(action.payload) // Add to beginning of array
      })
      .addCase(createRawMilkIntakeForm.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })

    // Update form
    builder
      .addCase(updateRawMilkIntakeForm.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateRawMilkIntakeForm.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.forms.findIndex(form => form.id === action.payload.id)
        if (index !== -1) {
          state.forms[index] = action.payload
        }
        if (state.currentForm?.id === action.payload.id) {
          state.currentForm = action.payload
        }
      })
      .addCase(updateRawMilkIntakeForm.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })

    // Delete form
    builder
      .addCase(deleteRawMilkIntakeForm.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteRawMilkIntakeForm.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.forms = state.forms.filter(form => form.id !== action.payload)
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null
        }
      })
      .addCase(deleteRawMilkIntakeForm.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentForm, clearCurrentForm } = rawMilkIntakeSlice.actions
export default rawMilkIntakeSlice.reducer
