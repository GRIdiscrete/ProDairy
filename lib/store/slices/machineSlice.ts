import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { Machine, MachineInspection, TableFilters } from "@/lib/types"
import { machineApi } from "@/lib/api/machine"

interface MachineState {
  machines: Machine[]
  inspections: MachineInspection[]
  filters: TableFilters
  loading: boolean
  error: string | null
}

const initialState: MachineState = {
  machines: [],
  inspections: [],
  filters: {},
  loading: false,
  error: null,
}

export const fetchMachines = createAsyncThunk("machine/fetchMachines", async (params: { filters?: TableFilters }) => {
  const response = await machineApi.getMachines(params)
  return response.data
})

const machineSlice = createSlice({
  name: "machine",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMachines.fulfilled, (state, action) => {
      state.loading = false
      state.machines = action.payload.machines
      state.inspections = action.payload.inspections
    })
  },
})

export const { setFilters, clearError } = machineSlice.actions
export default machineSlice.reducer
