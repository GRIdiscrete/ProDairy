import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { driverFormApi, type CreateDriverFormRequest, type UpdateDriverFormRequest } from "@/lib/api/driver-form"
import type { DriverForm, TableFilters } from "@/lib/types"

export interface DriverFormState {
  driverForms: DriverForm[]
  selectedDriverForm: DriverForm | null
  filters: TableFilters
  loading: boolean
  error: string | null
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
}

const initialState: DriverFormState = {
  driverForms: [],
  selectedDriverForm: null,
  filters: {},
  loading: false,
  error: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false,
  },
}

// Async thunks
export const fetchDriverForms = createAsyncThunk(
  "driverForm/fetchDriverForms", 
  async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
    try {
      const response = await driverFormApi.getDriverForms(params)
      return response.data
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to fetch driver forms'
      return rejectWithValue(message)
    }
  }
)

export const fetchDriverForm = createAsyncThunk(
  "driverForm/fetchDriverForm",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await driverFormApi.getDriverForm(id)
      return response.data
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to fetch driver form'
      return rejectWithValue(message)
    }
  }
)

export const createDriverForm = createAsyncThunk(
  "driverForm/createDriverForm",
  async (formData: CreateDriverFormRequest, { rejectWithValue }) => {
    try {
      const response = await driverFormApi.createDriverForm(formData)
      return response.data
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to create driver form'
      return rejectWithValue(message)
    }
  }
)

export const updateDriverForm = createAsyncThunk(
  "driverForm/updateDriverForm",
  async (formData: UpdateDriverFormRequest, { rejectWithValue }) => {
    try {
      const response = await driverFormApi.updateDriverForm(formData)
      return response.data
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to update driver form'
      return rejectWithValue(message)
    }
  }
)

export const deleteDriverForm = createAsyncThunk(
  "driverForm/deleteDriverForm",
  async (id: string, { rejectWithValue }) => {
    try {
      await driverFormApi.deleteDriverForm(id)
      return id
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to delete driver form'
      return rejectWithValue(message)
    }
  }
)

const driverFormSlice = createSlice({
  name: "driverForm",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedDriverForm: (state, action: PayloadAction<DriverForm | null>) => {
      state.selectedDriverForm = action.payload
    },
    clearSelectedDriverForm: (state) => {
      state.selectedDriverForm = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch driver forms
      .addCase(fetchDriverForms.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchDriverForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.driverForms = action.payload
      })
      .addCase(fetchDriverForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single driver form
      .addCase(fetchDriverForm.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDriverForm.fulfilled, (state, action) => {
        state.loading = false
        state.selectedDriverForm = action.payload
      })
      .addCase(fetchDriverForm.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create driver form
      .addCase(createDriverForm.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createDriverForm.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.driverForms.push(action.payload)
      })
      .addCase(createDriverForm.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update driver form
      .addCase(updateDriverForm.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateDriverForm.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.driverForms.findIndex(form => form.id === action.payload.id)
        if (index !== -1) {
          state.driverForms[index] = action.payload
        }
        if (state.selectedDriverForm?.id === action.payload.id) {
          state.selectedDriverForm = action.payload
        }
      })
      .addCase(updateDriverForm.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete driver form
      .addCase(deleteDriverForm.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteDriverForm.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.driverForms = state.driverForms.filter(form => form.id !== action.payload)
        if (state.selectedDriverForm?.id === action.payload) {
          state.selectedDriverForm = null
        }
      })
      .addCase(deleteDriverForm.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, clearError, setSelectedDriverForm, clearSelectedDriverForm } = driverFormSlice.actions
export default driverFormSlice.reducer
