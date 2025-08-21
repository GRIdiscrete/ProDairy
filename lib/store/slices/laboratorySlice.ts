import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { QualityTest, TableFilters, SortConfig } from "@/lib/types"
import { laboratoryApi } from "@/lib/api/laboratory"

interface LaboratoryState {
  tests: QualityTest[]
  pendingTests: QualityTest[]
  filters: TableFilters
  sort: SortConfig
  loading: boolean
  error: string | null
}

const initialState: LaboratoryState = {
  tests: [],
  pendingTests: [],
  filters: {},
  sort: { key: "testedAt", direction: "desc" },
  loading: false,
  error: null,
}

export const fetchQualityTests = createAsyncThunk(
  "laboratory/fetchTests",
  async (params: { filters?: TableFilters; sort?: SortConfig }) => {
    const response = await laboratoryApi.getTests(params)
    return response.data
  },
)

const laboratorySlice = createSlice({
  name: "laboratory",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    setSort: (state, action) => {
      state.sort = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchQualityTests.fulfilled, (state, action) => {
      state.loading = false
      state.tests = action.payload.tests
      state.pendingTests = action.payload.pendingTests
    })
  },
})

export const { setFilters, setSort, clearError } = laboratorySlice.actions
export default laboratorySlice.reducer
