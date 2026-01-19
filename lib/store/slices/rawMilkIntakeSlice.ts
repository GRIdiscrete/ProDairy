import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { CreateRawMilkIntakeFormRequest, RawMilkIntakeForm, RawMilkIntakePendingVoucher, rawMilkIntakeApi } from '@/lib/api/raw-milk-intake'

interface RawMilkIntakeState {
  rawMilkIntakeForms: RawMilkIntakeForm[]
  pendingVouchers: RawMilkIntakePendingVoucher[]
  operationLoading: {
    fetch: boolean
    fetchPending: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: any | null
}

// Initial state
const initialState: RawMilkIntakeState = {
  rawMilkIntakeForms: [],
  pendingVouchers: [],
  operationLoading: {
    fetch: false,
    fetchPending: false,
    create: false,
    update: false,
    delete: false
  },
  error: null
}

// Fetch all forms
export const fetchRawMilkIntakeForms = createAsyncThunk(
  'rawMilkIntake/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.getAll()
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch forms:', error)
      return rejectWithValue(error || { message: 'Failed to fetch forms' })
    }
  }
)

// Fetch pending vouchers
export const fetchPendingVouchers = createAsyncThunk(
  'rawMilkIntake/fetchPendingVouchers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.getVouchersPendingTransfer()
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch pending vouchers:', error)
      return rejectWithValue(error || { message: 'Failed to fetch pending vouchers' })
    }
  }
)

// Create form
export const createRawMilkIntakeForm = createAsyncThunk(
  'rawMilkIntake/create',
  async (formData: CreateRawMilkIntakeFormRequest, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.create(formData)
      return response.data
    } catch (error: any) {
      console.error('Failed to create form:', error)
      return rejectWithValue(error || { message: 'Failed to create form' })
    }
  }
)

// update form
export const updateRawMilkIntakeForm = createAsyncThunk(
  'rawMilkIntake/update',
  async (formData: CreateRawMilkIntakeFormRequest, { rejectWithValue }) => {
    try {
      if (!formData.id) throw new Error('Form ID is required for update')
      const response = await rawMilkIntakeApi.update(formData.id, formData)
      return response.data
    } catch (error: any) {
      console.error('Failed to update form:', error)
      return rejectWithValue(error || { message: 'Failed to update form' })
    }
  }
)

// delete form
export const deleteRawMilkIntakeForm = createAsyncThunk(
  'rawMilkIntake/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.delete(id)
      return response.data
    } catch (error: any) {
      console.error('Failed to delete form:', error)
      return rejectWithValue(error || { message: 'Failed to delete form' })
    }
  }
)

// The slice
const rawMilkIntakeSlice = createSlice({
  name: 'rawMilkIntake',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cases
      .addCase(fetchRawMilkIntakeForms.pending, (state) => {
        state.operationLoading.fetch = true
      })
      .addCase(fetchRawMilkIntakeForms.fulfilled, (state, action: PayloadAction<RawMilkIntakeForm[]>) => {
        state.operationLoading.fetch = false
        state.rawMilkIntakeForms = action.payload
        state.error = null
      })
      .addCase(fetchRawMilkIntakeForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload
      })

      // Fetch pending vouchers cases
      .addCase(fetchPendingVouchers.pending, (state) => {
        state.operationLoading.fetchPending = true
      })
      .addCase(fetchPendingVouchers.fulfilled, (state, action: PayloadAction<RawMilkIntakePendingVoucher[]>) => {
        state.operationLoading.fetchPending = false
        state.pendingVouchers = action.payload
        state.error = null
      })
      .addCase(fetchPendingVouchers.rejected, (state, action) => {
        state.operationLoading.fetchPending = false
        state.error = action.payload
      })

      // Create cases
      .addCase(createRawMilkIntakeForm.pending, (state) => {
        state.operationLoading.create = true
      })
      .addCase(createRawMilkIntakeForm.fulfilled, (state, action: PayloadAction<RawMilkIntakeForm>) => {
        state.operationLoading.create = false
        state.rawMilkIntakeForms.push(action.payload)
        state.error = null
      })
      .addCase(createRawMilkIntakeForm.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload
      })

      // Update cases
      .addCase(updateRawMilkIntakeForm.pending, (state) => {
        state.operationLoading.update = true
      })
      .addCase(updateRawMilkIntakeForm.fulfilled, (state, action: PayloadAction<RawMilkIntakeForm>) => {
        state.operationLoading.update = false
        const index = state.rawMilkIntakeForms.findIndex((form) => form.id === action.payload.id)
        if (index !== -1) {
          state.rawMilkIntakeForms[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateRawMilkIntakeForm.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload
      })

      // Delete cases
      .addCase(deleteRawMilkIntakeForm.pending, (state) => {
        state.operationLoading.delete = true
      })
      .addCase(deleteRawMilkIntakeForm.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        // The action.meta.arg is the ID passed to the thunk
        state.rawMilkIntakeForms = state.rawMilkIntakeForms.filter(f => f.id !== action.meta.arg)
        state.error = null
      })
      .addCase(deleteRawMilkIntakeForm.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload
      })
  }
})

export const { clearError } = rawMilkIntakeSlice.actions

export default rawMilkIntakeSlice.reducer
