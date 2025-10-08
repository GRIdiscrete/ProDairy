import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { driverFormLabTestApi, DriverFormLabTest, CreateDriverFormLabTestRequest, UpdateDriverFormLabTestRequest } from "@/lib/api/driver-form-lab-test"

interface OperationLoading {
  fetch: boolean
  create: boolean
  update: boolean
  delete: boolean
}

interface State {
  tests: DriverFormLabTest[]
  loading: boolean
  error: string | null
  operationLoading: OperationLoading
  isInitialized: boolean
}

const initialState: State = {
  tests: [],
  loading: false,
  error: null,
  operationLoading: { fetch: false, create: false, update: false, delete: false },
  isInitialized: false,
}

export const fetchDriverFormLabTests = createAsyncThunk(
  "driverFormLabTests/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await driverFormLabTestApi.getAll()
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to load lab tests")
    }
  }
)

export const createDriverFormLabTest = createAsyncThunk(
  "driverFormLabTests/create",
  async (payload: CreateDriverFormLabTestRequest, { rejectWithValue }) => {
    try {
      const res = await driverFormLabTestApi.create(payload)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to create lab test")
    }
  }
)

export const updateDriverFormLabTest = createAsyncThunk(
  "driverFormLabTests/update",
  async (payload: UpdateDriverFormLabTestRequest, { rejectWithValue }) => {
    try {
      const res = await driverFormLabTestApi.update(payload)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to update lab test")
    }
  }
)

export const deleteDriverFormLabTest = createAsyncThunk(
  "driverFormLabTests/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await driverFormLabTestApi.delete(id)
      return id
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to delete lab test")
    }
  }
)

const slice = createSlice({
  name: "driverFormLabTests",
  initialState,
  reducers: {
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverFormLabTests.pending, (state) => { state.operationLoading.fetch = true; state.error = null })
      .addCase(fetchDriverFormLabTests.fulfilled, (state, action: PayloadAction<DriverFormLabTest[]>) => {
        state.operationLoading.fetch = false
        state.tests = action.payload || []
        state.isInitialized = true
      })
      .addCase(fetchDriverFormLabTests.rejected, (state, action: any) => { state.operationLoading.fetch = false; state.error = action.payload })

      .addCase(createDriverFormLabTest.pending, (state) => { state.operationLoading.create = true; state.error = null })
      .addCase(createDriverFormLabTest.fulfilled, (state, action: PayloadAction<DriverFormLabTest>) => {
        state.operationLoading.create = false
        state.tests = [action.payload, ...state.tests]
      })
      .addCase(createDriverFormLabTest.rejected, (state, action: any) => { state.operationLoading.create = false; state.error = action.payload })

      .addCase(updateDriverFormLabTest.pending, (state) => { state.operationLoading.update = true; state.error = null })
      .addCase(updateDriverFormLabTest.fulfilled, (state, action: PayloadAction<DriverFormLabTest>) => {
        state.operationLoading.update = false
        state.tests = state.tests.map(t => t.id === action.payload.id ? action.payload : t)
      })
      .addCase(updateDriverFormLabTest.rejected, (state, action: any) => { state.operationLoading.update = false; state.error = action.payload })

      .addCase(deleteDriverFormLabTest.pending, (state) => { state.operationLoading.delete = true; state.error = null })
      .addCase(deleteDriverFormLabTest.fulfilled, (state, action: PayloadAction<string>) => {
        state.operationLoading.delete = false
        state.tests = state.tests.filter(t => t.id !== action.payload)
      })
      .addCase(deleteDriverFormLabTest.rejected, (state, action: any) => { state.operationLoading.delete = false; state.error = action.payload })
  }
})

export const { clearError } = slice.actions
export default slice.reducer
