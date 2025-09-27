import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { rawMilkIntakeLabTestApi, RawMilkIntakeLabTest, CreateRawMilkIntakeLabTestRequest, UpdateRawMilkIntakeLabTestRequest } from "@/lib/api/raw-milk-intake-lab-test"

interface OperationLoading {
  fetch: boolean
  create: boolean
  update: boolean
  delete: boolean
}

interface State {
  tests: RawMilkIntakeLabTest[]
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

export const fetchRawMilkIntakeLabTests = createAsyncThunk(
  "rawMilkIntakeLabTests/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await rawMilkIntakeLabTestApi.getAll()
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to load lab tests")
    }
  }
)

export const createRawMilkIntakeLabTest = createAsyncThunk(
  "rawMilkIntakeLabTests/create",
  async (payload: CreateRawMilkIntakeLabTestRequest, { rejectWithValue }) => {
    try {
      const res = await rawMilkIntakeLabTestApi.create(payload)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to create lab test")
    }
  }
)

export const updateRawMilkIntakeLabTest = createAsyncThunk(
  "rawMilkIntakeLabTests/update",
  async (payload: UpdateRawMilkIntakeLabTestRequest, { rejectWithValue }) => {
    try {
      const res = await rawMilkIntakeLabTestApi.update(payload)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to update lab test")
    }
  }
)

export const deleteRawMilkIntakeLabTest = createAsyncThunk(
  "rawMilkIntakeLabTests/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await rawMilkIntakeLabTestApi.delete(id)
      return id
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to delete lab test")
    }
  }
)

const slice = createSlice({
  name: "rawMilkIntakeLabTests",
  initialState,
  reducers: {
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRawMilkIntakeLabTests.pending, (state) => { state.operationLoading.fetch = true; state.error = null })
      .addCase(fetchRawMilkIntakeLabTests.fulfilled, (state, action: PayloadAction<RawMilkIntakeLabTest[]>) => {
        state.operationLoading.fetch = false
        state.tests = action.payload || []
        state.isInitialized = true
      })
      .addCase(fetchRawMilkIntakeLabTests.rejected, (state, action: any) => { state.operationLoading.fetch = false; state.error = action.payload })

      .addCase(createRawMilkIntakeLabTest.pending, (state) => { state.operationLoading.create = true; state.error = null })
      .addCase(createRawMilkIntakeLabTest.fulfilled, (state, action: PayloadAction<RawMilkIntakeLabTest>) => {
        state.operationLoading.create = false
        state.tests = [action.payload, ...state.tests]
      })
      .addCase(createRawMilkIntakeLabTest.rejected, (state, action: any) => { state.operationLoading.create = false; state.error = action.payload })

      .addCase(updateRawMilkIntakeLabTest.pending, (state) => { state.operationLoading.update = true; state.error = null })
      .addCase(updateRawMilkIntakeLabTest.fulfilled, (state, action: PayloadAction<RawMilkIntakeLabTest>) => {
        state.operationLoading.update = false
        state.tests = state.tests.map(t => t.id === action.payload.id ? action.payload : t)
      })
      .addCase(updateRawMilkIntakeLabTest.rejected, (state, action: any) => { state.operationLoading.update = false; state.error = action.payload })

      .addCase(deleteRawMilkIntakeLabTest.pending, (state) => { state.operationLoading.delete = true; state.error = null })
      .addCase(deleteRawMilkIntakeLabTest.fulfilled, (state, action: PayloadAction<string>) => {
        state.operationLoading.delete = false
        state.tests = state.tests.filter(t => t.id !== action.payload)
      })
      .addCase(deleteRawMilkIntakeLabTest.rejected, (state, action: any) => { state.operationLoading.delete = false; state.error = action.payload })
  }
})

export const { clearError } = slice.actions
export default slice.reducer


