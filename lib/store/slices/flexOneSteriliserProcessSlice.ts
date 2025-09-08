import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  getFlexOneSteriliserProcesses, 
  getFlexOneSteriliserProcess,
  createFlexOneSteriliserProcess, 
  updateFlexOneSteriliserProcess, 
  deleteFlexOneSteriliserProcess,
  getFlexOneSteriliserProcessProducts,
  createFlexOneSteriliserProcessProduct,
  updateFlexOneSteriliserProcessProduct,
  deleteFlexOneSteriliserProcessProduct,
  getFlexOneSteriliserProcessWaterStreams,
  createFlexOneSteriliserProcessWaterStream,
  updateFlexOneSteriliserProcessWaterStream,
  deleteFlexOneSteriliserProcessWaterStream,
  FlexOneSteriliserProcess,
  FlexOneSteriliserProcessProduct,
  FlexOneSteriliserProcessWaterStream
} from '@/lib/api/data-capture-forms'

interface FlexOneSteriliserProcessState {
  processes: FlexOneSteriliserProcess[]
  products: FlexOneSteriliserProcessProduct[]
  waterStreams: FlexOneSteriliserProcessWaterStream[]
  loading: boolean
  error: string | null
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
  isInitialized: boolean
  lastFetched: number | null
}

const initialState: FlexOneSteriliserProcessState = {
  processes: [],
  products: [],
  waterStreams: [],
  loading: false,
  error: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false
  },
  isInitialized: false,
  lastFetched: null
}

// Async thunks for processes
export const fetchFlexOneSteriliserProcesses = createAsyncThunk(
  'flexOneSteriliserProcesses/fetchProcesses',
  async () => {
    const response = await getFlexOneSteriliserProcesses()
    return response
  }
)

export const fetchFlexOneSteriliserProcess = createAsyncThunk(
  'flexOneSteriliserProcesses/fetchProcess',
  async (id: string) => {
    const response = await getFlexOneSteriliserProcess(id)
    return response
  }
)

export const createFlexOneSteriliserProcessAction = createAsyncThunk(
  'flexOneSteriliserProcesses/createProcess',
  async (data: Omit<FlexOneSteriliserProcess, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFlexOneSteriliserProcess(data)
    return response
  }
)

export const updateFlexOneSteriliserProcessAction = createAsyncThunk(
  'flexOneSteriliserProcesses/updateProcess',
  async (data: FlexOneSteriliserProcess) => {
    const response = await updateFlexOneSteriliserProcess(data)
    return response
  }
)

export const deleteFlexOneSteriliserProcessAction = createAsyncThunk(
  'flexOneSteriliserProcesses/deleteProcess',
  async (id: string) => {
    await deleteFlexOneSteriliserProcess(id)
    return id
  }
)

// Async thunks for products
export const fetchFlexOneSteriliserProcessProducts = createAsyncThunk(
  'flexOneSteriliserProcesses/fetchProducts',
  async () => {
    const response = await getFlexOneSteriliserProcessProducts()
    return response
  }
)

export const createFlexOneSteriliserProcessProductAction = createAsyncThunk(
  'flexOneSteriliserProcesses/createProduct',
  async (data: Omit<FlexOneSteriliserProcessProduct, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFlexOneSteriliserProcessProduct(data)
    return response
  }
)

export const updateFlexOneSteriliserProcessProductAction = createAsyncThunk(
  'flexOneSteriliserProcesses/updateProduct',
  async (data: FlexOneSteriliserProcessProduct) => {
    const response = await updateFlexOneSteriliserProcessProduct(data)
    return response
  }
)

export const deleteFlexOneSteriliserProcessProductAction = createAsyncThunk(
  'flexOneSteriliserProcesses/deleteProduct',
  async (id: string) => {
    await deleteFlexOneSteriliserProcessProduct(id)
    return id
  }
)

// Async thunks for water streams
export const fetchFlexOneSteriliserProcessWaterStreams = createAsyncThunk(
  'flexOneSteriliserProcesses/fetchWaterStreams',
  async () => {
    const response = await getFlexOneSteriliserProcessWaterStreams()
    return response
  }
)

export const createFlexOneSteriliserProcessWaterStreamAction = createAsyncThunk(
  'flexOneSteriliserProcesses/createWaterStream',
  async (data: Omit<FlexOneSteriliserProcessWaterStream, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFlexOneSteriliserProcessWaterStream(data)
    return response
  }
)

export const updateFlexOneSteriliserProcessWaterStreamAction = createAsyncThunk(
  'flexOneSteriliserProcesses/updateWaterStream',
  async (data: FlexOneSteriliserProcessWaterStream) => {
    const response = await updateFlexOneSteriliserProcessWaterStream(data)
    return response
  }
)

export const deleteFlexOneSteriliserProcessWaterStreamAction = createAsyncThunk(
  'flexOneSteriliserProcesses/deleteWaterStream',
  async (id: string) => {
    await deleteFlexOneSteriliserProcessWaterStream(id)
    return id
  }
)

const flexOneSteriliserProcessSlice = createSlice({
  name: 'flexOneSteriliserProcesses',
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
    // Fetch processes
    builder
      .addCase(fetchFlexOneSteriliserProcesses.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchFlexOneSteriliserProcesses.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.processes = action.payload
        state.isInitialized = true
        state.lastFetched = Date.now()
      })
      .addCase(fetchFlexOneSteriliserProcesses.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.error.message || 'Failed to fetch processes'
      })

    // Create process
    builder
      .addCase(createFlexOneSteriliserProcessAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createFlexOneSteriliserProcessAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.processes.push(action.payload)
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(createFlexOneSteriliserProcessAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.error.message || 'Failed to create process'
      })

    // Update process
    builder
      .addCase(updateFlexOneSteriliserProcessAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateFlexOneSteriliserProcessAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.processes.findIndex(process => process.id === action.payload.id)
        if (index !== -1) {
          state.processes[index] = action.payload
        }
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(updateFlexOneSteriliserProcessAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.error.message || 'Failed to update process'
      })

    // Delete process
    builder
      .addCase(deleteFlexOneSteriliserProcessAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteFlexOneSteriliserProcessAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.processes = state.processes.filter(process => process.id !== action.payload)
      })
      .addCase(deleteFlexOneSteriliserProcessAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.error.message || 'Failed to delete process'
      })

    // Fetch products
    builder
      .addCase(fetchFlexOneSteriliserProcessProducts.fulfilled, (state, action) => {
        state.products = action.payload
      })

    // Create product
    builder
      .addCase(createFlexOneSteriliserProcessProductAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createFlexOneSteriliserProcessProductAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.products.push(action.payload)
      })
      .addCase(createFlexOneSteriliserProcessProductAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.error.message || 'Failed to create product'
      })

    // Fetch water streams
    builder
      .addCase(fetchFlexOneSteriliserProcessWaterStreams.fulfilled, (state, action) => {
        state.waterStreams = action.payload
      })

    // Create water stream
    builder
      .addCase(createFlexOneSteriliserProcessWaterStreamAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createFlexOneSteriliserProcessWaterStreamAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.waterStreams.push(action.payload)
      })
      .addCase(createFlexOneSteriliserProcessWaterStreamAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.error.message || 'Failed to create water stream'
      })
  }
})

export const { clearError, setInitialized } = flexOneSteriliserProcessSlice.actions
export default flexOneSteriliserProcessSlice.reducer
