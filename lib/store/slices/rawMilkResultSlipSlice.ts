import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { rawMilkResultSlipApi, RawMilkResultSlip, CreateRawMilkResultSlipRequest, UpdateRawMilkResultSlipRequest } from "@/lib/api/raw-milk-result-slip"

interface OperationLoading {
  fetch: boolean
  create: boolean
  update: boolean
  delete: boolean
}

interface State {
  slips: RawMilkResultSlip[]
  loading: boolean
  error: string | null
  operationLoading: OperationLoading
  isInitialized: boolean
}

const initialState: State = {
  slips: [],
  loading: false,
  error: null,
  operationLoading: { fetch: false, create: false, update: false, delete: false },
  isInitialized: false,
}

export const fetchRawMilkResultSlips = createAsyncThunk(
  "rawMilkResultSlips/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await rawMilkResultSlipApi.getAll()
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to load result slips")
    }
  }
)

export const createRawMilkResultSlip = createAsyncThunk(
  "rawMilkResultSlips/create",
  async (payload: CreateRawMilkResultSlipRequest, { rejectWithValue }) => {
    try {
      const res = await rawMilkResultSlipApi.create(payload)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to create result slip")
    }
  }
)

export const updateRawMilkResultSlip = createAsyncThunk(
  "rawMilkResultSlips/update",
  async (payload: UpdateRawMilkResultSlipRequest, { rejectWithValue }) => {
    try {
      const res = await rawMilkResultSlipApi.update(payload)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to update result slip")
    }
  }
)

export const deleteRawMilkResultSlip = createAsyncThunk(
  "rawMilkResultSlips/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await rawMilkResultSlipApi.delete(id)
      return id
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to delete result slip")
    }
  }
)

const slice = createSlice({
  name: "rawMilkResultSlips",
  initialState,
  reducers: {
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRawMilkResultSlips.pending, (state) => { state.operationLoading.fetch = true; state.error = null })
      .addCase(fetchRawMilkResultSlips.fulfilled, (state, action: PayloadAction<RawMilkResultSlip[]>) => {
        state.operationLoading.fetch = false
        state.slips = action.payload || []
        state.isInitialized = true
      })
      .addCase(fetchRawMilkResultSlips.rejected, (state, action: any) => { state.operationLoading.fetch = false; state.error = action.payload })

      .addCase(createRawMilkResultSlip.pending, (state) => { state.operationLoading.create = true; state.error = null })
      .addCase(createRawMilkResultSlip.fulfilled, (state, action: PayloadAction<RawMilkResultSlip>) => {
        state.operationLoading.create = false
        state.slips = [action.payload, ...state.slips]
      })
      .addCase(createRawMilkResultSlip.rejected, (state, action: any) => { state.operationLoading.create = false; state.error = action.payload })

      .addCase(updateRawMilkResultSlip.pending, (state) => { state.operationLoading.update = true; state.error = null })
      .addCase(updateRawMilkResultSlip.fulfilled, (state, action: PayloadAction<RawMilkResultSlip>) => {
        state.operationLoading.update = false
        state.slips = state.slips.map(s => s.id === action.payload.id ? action.payload : s)
      })
      .addCase(updateRawMilkResultSlip.rejected, (state, action: any) => { state.operationLoading.update = false; state.error = action.payload })

      .addCase(deleteRawMilkResultSlip.pending, (state) => { state.operationLoading.delete = true; state.error = null })
      .addCase(deleteRawMilkResultSlip.fulfilled, (state, action: PayloadAction<string>) => {
        state.operationLoading.delete = false
        state.slips = state.slips.filter(s => s.id !== action.payload)
      })
      .addCase(deleteRawMilkResultSlip.rejected, (state, action: any) => { state.operationLoading.delete = false; state.error = action.payload })
  }
})

export const { clearError } = slice.actions
export default slice.reducer
