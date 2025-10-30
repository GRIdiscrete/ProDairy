import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { CreateRawMilkIntakeFormRequest, rawMilkIntakeApi } from '@/lib/api/raw-milk-intake'

// Initial state
const initialState = {
  rawMilkIntakeForms: [],
  operationLoading: {
    fetch: false,
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
    } catch (error) {
      console.error('Failed to fetch forms:', error)
      return rejectWithValue({ message: 'Failed to fetch forms' })
    }
  }
)

// Create form
export const createRawMilkIntakeForm = createAsyncThunk(
  'rawMilkIntake/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.create(formData)
      return response.data
    } catch (error) {
      console.error('Failed to create form:', error)
      return rejectWithValue({ message: 'Failed to create form' })
    }
  }
)

//update form
export const updateRawMilkIntakeForm = createAsyncThunk(
  'rawMilkIntake/update',
  async (formData: CreateRawMilkIntakeFormRequest, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.update(formData.id, formData)
      return response.data
    } catch (error) {
      console.error('Failed to update form:', error)
      return rejectWithValue({ message: 'Failed to update form' })
    }
  }
)

//delete form
export const deleteRawMilkIntakeForm = createAsyncThunk(
  'rawMilkIntake/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.delete(id)
      return response.data
    } catch (error) {
      console.error('Failed to delete form:', error)
      return rejectWithValue({ message: 'Failed to delete form' })
    }
  }
)

// The slice
const rawMilkIntakeSlice = createSlice({
  name: 'rawMilkIntake',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch cases
      .addCase(fetchRawMilkIntakeForms.pending, (state) => {
        state.operationLoading.fetch = true
      })
      .addCase(fetchRawMilkIntakeForms.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.rawMilkIntakeForms = action.payload
        state.error = null
      })
      .addCase(fetchRawMilkIntakeForms.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload
      })

      // Create cases
      .addCase(createRawMilkIntakeForm.pending, (state) => {
        state.operationLoading.create = true
      })
      .addCase(createRawMilkIntakeForm.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.rawMilkIntakeForms.push(action.payload)
        state.error = null
      })
      .addCase(createRawMilkIntakeForm.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload
      })
      .addCase(updateRawMilkIntakeForm.pending, (state) => {
        state.operationLoading.update = true
      })
      .addCase(updateRawMilkIntakeForm.fulfilled, (state, action) => {
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
  }
})

export default rawMilkIntakeSlice.reducer
