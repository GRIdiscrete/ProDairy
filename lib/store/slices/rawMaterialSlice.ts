import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import type { RawMaterial, TableFilters } from "@/lib/types"
import { rawMaterialApi } from "@/lib/api/raw-material"

interface RawMaterialState {
  rawMaterials: RawMaterial[]
  selectedRawMaterial: RawMaterial | null
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

const initialState: RawMaterialState = {
  rawMaterials: [],
  selectedRawMaterial: null,
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
export const fetchRawMaterials = createAsyncThunk(
  "rawMaterial/fetchRawMaterials", 
  async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
    try {
      const response = await rawMaterialApi.getRawMaterials(params)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch raw materials'
      return rejectWithValue(message)
    }
  }
)

export const fetchRawMaterial = createAsyncThunk(
  "rawMaterial/fetchRawMaterial",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rawMaterialApi.getRawMaterial(id)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch raw material'
      return rejectWithValue(message)
    }
  }
)

export const createRawMaterial = createAsyncThunk(
  "rawMaterial/createRawMaterial",
  async (rawMaterialData: Omit<RawMaterial, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await rawMaterialApi.createRawMaterial(rawMaterialData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create raw material'
      return rejectWithValue(message)
    }
  }
)

export const updateRawMaterial = createAsyncThunk(
  "rawMaterial/updateRawMaterial",
  async (rawMaterialData: RawMaterial, { rejectWithValue }) => {
    try {
      const response = await rawMaterialApi.updateRawMaterial(rawMaterialData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update raw material'
      return rejectWithValue(message)
    }
  }
)

export const deleteRawMaterial = createAsyncThunk(
  "rawMaterial/deleteRawMaterial",
  async (id: string, { rejectWithValue }) => {
    try {
      await rawMaterialApi.deleteRawMaterial(id)
      return id
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete raw material'
      return rejectWithValue(message)
    }
  }
)

const rawMaterialSlice = createSlice({
  name: "rawMaterial",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedRawMaterial: (state, action: PayloadAction<RawMaterial | null>) => {
      state.selectedRawMaterial = action.payload
    },
    clearSelectedRawMaterial: (state) => {
      state.selectedRawMaterial = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch raw materials
      .addCase(fetchRawMaterials.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchRawMaterials.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.rawMaterials = action.payload
      })
      .addCase(fetchRawMaterials.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single raw material
      .addCase(fetchRawMaterial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRawMaterial.fulfilled, (state, action) => {
        state.loading = false
        state.selectedRawMaterial = action.payload
      })
      .addCase(fetchRawMaterial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create raw material
      .addCase(createRawMaterial.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createRawMaterial.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.rawMaterials.push(action.payload)
      })
      .addCase(createRawMaterial.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update raw material
      .addCase(updateRawMaterial.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateRawMaterial.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.rawMaterials.findIndex(rawMaterial => rawMaterial.id === action.payload.id)
        if (index !== -1) {
          state.rawMaterials[index] = action.payload
        }
        if (state.selectedRawMaterial?.id === action.payload.id) {
          state.selectedRawMaterial = action.payload
        }
      })
      .addCase(updateRawMaterial.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete raw material
      .addCase(deleteRawMaterial.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteRawMaterial.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.rawMaterials = state.rawMaterials.filter(rawMaterial => rawMaterial.id !== action.payload)
        if (state.selectedRawMaterial?.id === action.payload) {
          state.selectedRawMaterial = null
        }
      })
      .addCase(deleteRawMaterial.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, clearError, setSelectedRawMaterial, clearSelectedRawMaterial } = rawMaterialSlice.actions
export default rawMaterialSlice.reducer
