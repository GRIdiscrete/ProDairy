import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { DashboardMetrics, ProductionBatch, MachineInspection } from "@/lib/types"
import { dashboardApi } from "@/lib/api/dashboard"

interface DashboardState {
  metrics: DashboardMetrics | null
  recentBatches: ProductionBatch[]
  recentInspections: MachineInspection[]
  productionChart: Array<{ month: string; production: number; cost: number }>
  downtimeChart: Array<{ cause: string; count: number; percentage: number }>
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  metrics: null,
  recentBatches: [],
  recentInspections: [],
  productionChart: [],
  downtimeChart: [],
  loading: false,
  error: null,
}

export const fetchDashboardMetrics = createAsyncThunk("dashboard/fetchMetrics", async () => {
  const response = await dashboardApi.getMetrics()
  return response.data
})

export const fetchRecentBatches = createAsyncThunk("dashboard/fetchRecentBatches", async () => {
  const response = await dashboardApi.getRecentBatches()
  return response.data
})

export const fetchRecentInspections = createAsyncThunk("dashboard/fetchRecentInspections", async () => {
  const response = await dashboardApi.getRecentInspections()
  return response.data
})

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false
        state.metrics = action.payload.metrics
        state.productionChart = action.payload.productionChart
        state.downtimeChart = action.payload.downtimeChart
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch dashboard metrics"
      })
      .addCase(fetchRecentBatches.fulfilled, (state, action) => {
        state.recentBatches = action.payload
      })
      .addCase(fetchRecentInspections.fulfilled, (state, action) => {
        state.recentInspections = action.payload
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer
