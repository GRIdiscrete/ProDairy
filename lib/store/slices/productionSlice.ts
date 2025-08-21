import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { ProductionBatch, TableFilters, SortConfig } from "@/lib/types"
import { productionApi } from "@/lib/api/production"

interface ProductionState {
  batches: ProductionBatch[]
  currentBatch: ProductionBatch | null
  filters: TableFilters
  sort: SortConfig
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  loading: boolean
  error: string | null
}

const initialState: ProductionState = {
  batches: [],
  currentBatch: null,
  filters: {},
  sort: { key: "createdAt", direction: "desc" },
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,
  error: null,
}

export const fetchProductionBatches = createAsyncThunk(
  "production/fetchBatches",
  async (params: { filters?: TableFilters; sort?: SortConfig; page?: number; limit?: number }) => {
    const response = await productionApi.getBatches(params)
    return response.data
  },
)

const productionSlice = createSlice({
  name: "production",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    setSort: (state, action) => {
      state.sort = action.payload
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionBatches.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductionBatches.fulfilled, (state, action) => {
        state.loading = false
        state.batches = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProductionBatches.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch production batches"
      })
  },
})

export const { setFilters, setSort, setPage, clearError } = productionSlice.actions
export default productionSlice.reducer
