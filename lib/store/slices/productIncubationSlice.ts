import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  getProductIncubations, 
  createProductIncubation, 
  updateProductIncubation, 
  deleteProductIncubation,
  ProductIncubation 
} from '@/lib/api/data-capture-forms'

interface ProductIncubationState {
  incubations: ProductIncubation[]
  loading: boolean
  error: string | null
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
  isInitialized: boolean
}

const initialState: ProductIncubationState = {
  incubations: [],
  loading: false,
  error: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false
  },
  isInitialized: false
}

// Async thunks
export const fetchProductIncubations = createAsyncThunk(
  'productIncubations/fetchProductIncubations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProductIncubations()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch product incubations')
    }
  }
)

export const createProductIncubationAction = createAsyncThunk(
  'productIncubations/createProductIncubation',
  async (incubationData: Omit<ProductIncubation, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const data = await createProductIncubation(incubationData)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create product incubation')
    }
  }
)

export const updateProductIncubationAction = createAsyncThunk(
  'productIncubations/updateProductIncubation',
  async (incubationData: ProductIncubation, { rejectWithValue }) => {
    try {
      const data = await updateProductIncubation(incubationData)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update product incubation')
    }
  }
)

export const deleteProductIncubationAction = createAsyncThunk(
  'productIncubations/deleteProductIncubation',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteProductIncubation(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete product incubation')
    }
  }
)

const productIncubationSlice = createSlice({
  name: 'productIncubations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload
    }
  },
  extraReducers: (builder) => {
    // Fetch incubations
    builder
      .addCase(fetchProductIncubations.pending, (state) => {
        state.loading = true
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchProductIncubations.fulfilled, (state, action) => {
        state.loading = false
        state.operationLoading.fetch = false
        state.incubations = action.payload
        state.isInitialized = true
      })
      .addCase(fetchProductIncubations.rejected, (state, action) => {
        state.loading = false
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })

    // Create incubation
    builder
      .addCase(createProductIncubationAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createProductIncubationAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.incubations.unshift(action.payload)
      })
      .addCase(createProductIncubationAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })

    // Update incubation
    builder
      .addCase(updateProductIncubationAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateProductIncubationAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.incubations.findIndex(incubation => incubation.id === action.payload.id)
        if (index !== -1) {
          state.incubations[index] = action.payload
        }
      })
      .addCase(updateProductIncubationAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })

    // Delete incubation
    builder
      .addCase(deleteProductIncubationAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteProductIncubationAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.incubations = state.incubations.filter(incubation => incubation.id !== action.payload)
      })
      .addCase(deleteProductIncubationAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, setInitialized } = productIncubationSlice.actions
export default productIncubationSlice.reducer
