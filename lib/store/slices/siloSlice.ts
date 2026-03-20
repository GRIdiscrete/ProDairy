import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import type { Silo, TableFilters } from "@/lib/types"
import { siloApi } from "@/lib/api/silo"

interface SiloState {
  silos: Silo[]
  selectedSilo: Silo | null
  filters: TableFilters
  loading: boolean
  error: string | null
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
  cipStatuses: Record<string, any>
  transfers: any[]
}

const initialState: SiloState = {
  silos: [],
  selectedSilo: null,
  filters: {},
  loading: false,
  error: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false,
  },
  cipStatuses: {},
  transfers: [],
}

// Async thunks
export const fetchSilos = createAsyncThunk(
  "silo/fetchSilos", 
  async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
    try {
      const response = await siloApi.getSilos(params)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch silos'
      return rejectWithValue(message)
    }
  }
)

export const fetchSilo = createAsyncThunk(
  "silo/fetchSilo",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await siloApi.getSilo(id)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch silo'
      return rejectWithValue(message)
    }
  }
)

export const createSilo = createAsyncThunk(
  "silo/createSilo",
  async (siloData: Omit<Silo, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await siloApi.createSilo(siloData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create silo'
      return rejectWithValue(message)
    }
  }
)

export const updateSilo = createAsyncThunk(
  "silo/updateSilo",
  async (siloData: Silo, { rejectWithValue }) => {
    try {
      const response = await siloApi.updateSilo(siloData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update silo'
      return rejectWithValue(message)
    }
  }
)

export const deleteSilo = createAsyncThunk(
  "silo/deleteSilo",
  async (id: string, { rejectWithValue }) => {
    try {
      await siloApi.deleteSilo(id)
      return id
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete silo'
      return rejectWithValue(message)
    }
  }
)

export const fetchSiloManagerSilos = createAsyncThunk(
  "silo/fetchSiloManagerSilos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await siloApi.getSiloManagerSilos()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch silo manager silos')
    }
  }
)

export const fetchCIPStatus = createAsyncThunk(
  "silo/fetchCIPStatus",
  async (siloName: string, { rejectWithValue }) => {
    try {
      const response = await siloApi.getCIPStatus(siloName)
      return { siloName, data: response.data }
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch CIP status')
    }
  }
)

export const fetchSiloTransfers = createAsyncThunk(
  "silo/fetchSiloTransfers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await siloApi.getSiloTransfers()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch silo transfers')
    }
  }
)

const siloSlice = createSlice({
  name: "silo",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedSilo: (state, action: PayloadAction<Silo | null>) => {
      state.selectedSilo = action.payload
    },
    clearSelectedSilo: (state) => {
      state.selectedSilo = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch silos
      .addCase(fetchSilos.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchSilos.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.silos = action.payload
      })
      .addCase(fetchSilos.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single silo
      .addCase(fetchSilo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSilo.fulfilled, (state, action) => {
        state.loading = false
        state.selectedSilo = action.payload
      })
      .addCase(fetchSilo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create silo
      .addCase(createSilo.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createSilo.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.silos.push(action.payload)
      })
      .addCase(createSilo.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update silo
      .addCase(updateSilo.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateSilo.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.silos.findIndex(silo => silo.id === action.payload.id)
        if (index !== -1) {
          state.silos[index] = action.payload
        }
        if (state.selectedSilo?.id === action.payload.id) {
          state.selectedSilo = action.payload
        }
      })
      .addCase(updateSilo.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete silo
      .addCase(deleteSilo.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteSilo.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.silos = state.silos.filter(silo => silo.id !== action.payload)
        if (state.selectedSilo?.id === action.payload) {
          state.selectedSilo = null
        }
      })
      .addCase(deleteSilo.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })

      // Silo Manager
      .addCase(fetchSiloManagerSilos.pending, (state) => {
        state.operationLoading.fetch = true
      })
      .addCase(fetchSiloManagerSilos.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.silos = action.payload
      })
      .addCase(fetchSiloManagerSilos.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })

      .addCase(fetchCIPStatus.fulfilled, (state, action) => {
        state.cipStatuses[action.payload.siloName] = action.payload.data
      })

      .addCase(fetchSiloTransfers.fulfilled, (state, action) => {
        state.transfers = action.payload
      })
  },
})

export const { setFilters, clearError, setSelectedSilo, clearSelectedSilo } = siloSlice.actions
export default siloSlice.reducer
