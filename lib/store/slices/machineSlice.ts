import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import type { Machine, TableFilters } from "@/lib/types"
import { machineApi } from "@/lib/api/machine"

interface MachineState {
  machines: Machine[]
  selectedMachine: Machine | null
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

const initialState: MachineState = {
  machines: [],
  selectedMachine: null,
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
export const fetchMachines = createAsyncThunk(
  "machine/fetchMachines", 
  async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
    try {
      const response = await machineApi.getMachines(params)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch machines'
      return rejectWithValue(message)
    }
  }
)

export const fetchMachine = createAsyncThunk(
  "machine/fetchMachine",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await machineApi.getMachine(id)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch machine'
      return rejectWithValue(message)
    }
  }
)

export const createMachine = createAsyncThunk(
  "machine/createMachine",
  async (machineData: Omit<Machine, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await machineApi.createMachine(machineData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create machine'
      return rejectWithValue(message)
    }
  }
)

export const updateMachine = createAsyncThunk(
  "machine/updateMachine",
  async (machineData: Machine, { rejectWithValue }) => {
    try {
      const response = await machineApi.updateMachine(machineData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update machine'
      return rejectWithValue(message)
    }
  }
)

export const deleteMachine = createAsyncThunk(
  "machine/deleteMachine",
  async (id: string, { rejectWithValue }) => {
    try {
      await machineApi.deleteMachine(id)
      return id
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete machine'
      return rejectWithValue(message)
    }
  }
)

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
    setSelectedMachine: (state, action: PayloadAction<Machine | null>) => {
      state.selectedMachine = action.payload
    },
    clearSelectedMachine: (state) => {
      state.selectedMachine = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch machines
      .addCase(fetchMachines.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.machines = action.payload
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single machine
      .addCase(fetchMachine.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMachine.fulfilled, (state, action) => {
        state.loading = false
        state.selectedMachine = action.payload
      })
      .addCase(fetchMachine.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create machine
      .addCase(createMachine.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createMachine.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.machines.push(action.payload)
      })
      .addCase(createMachine.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update machine
      .addCase(updateMachine.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateMachine.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.machines.findIndex(machine => machine.id === action.payload.id)
        if (index !== -1) {
          state.machines[index] = action.payload
        }
        if (state.selectedMachine?.id === action.payload.id) {
          state.selectedMachine = action.payload
        }
      })
      .addCase(updateMachine.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete machine
      .addCase(deleteMachine.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteMachine.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.machines = state.machines.filter(machine => machine.id !== action.payload)
        if (state.selectedMachine?.id === action.payload) {
          state.selectedMachine = null
        }
      })
      .addCase(deleteMachine.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, clearError, setSelectedMachine, clearSelectedMachine } = machineSlice.actions
export default machineSlice.reducer
