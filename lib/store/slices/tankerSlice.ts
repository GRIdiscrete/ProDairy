import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { tankerApi, Tanker, TankerCreateRequest } from "@/lib/api/tanker"

interface OperationLoading { create: boolean; update: boolean; delete: boolean; fetch: boolean }

interface TankerState {
  items: Tanker[]
  loading: boolean
  operationLoading: OperationLoading
  error: string | null
  isInitialized: boolean
}

const initialState: TankerState = {
  items: [],
  loading: false,
  operationLoading: { create: false, update: false, delete: false, fetch: false },
  error: null,
  isInitialized: false,
}

export const fetchTankers = createAsyncThunk(
  "tankers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await tankerApi.getAll()
      return res.data
    } catch (e: any) {
      return rejectWithValue(e?.body?.message || e?.message || "Failed to fetch tankers")
    }
  }
)

export const createTankerAction = createAsyncThunk(
  "tankers/create",
  async (data: TankerCreateRequest, { rejectWithValue }) => {
    try {
      const res = await tankerApi.create(data)
      return res.data
    } catch (e: any) {
      return rejectWithValue(e?.body?.message || e?.message || "Failed to create tanker")
    }
  }
)

export const updateTankerAction = createAsyncThunk(
  "tankers/update",
  async (data: Partial<Tanker> & { id: string }, { rejectWithValue }) => {
    try {
      const res = await tankerApi.update(data.id, data)
      return res.data
    } catch (e: any) {
      return rejectWithValue(e?.body?.message || e?.message || "Failed to update tanker")
    }
  }
)

export const deleteTankerAction = createAsyncThunk(
  "tankers/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await tankerApi.delete(id)
      return id
    } catch (e: any) {
      return rejectWithValue(e?.body?.message || e?.message || "Failed to delete tanker")
    }
  }
)

const tankerSlice = createSlice({
  name: "tankers",
  initialState,
  reducers: {
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTankers.pending, (state) => { state.operationLoading.fetch = true; state.error = null })
      .addCase(fetchTankers.fulfilled, (state, action: PayloadAction<Tanker[]>) => {
        state.operationLoading.fetch = false
        state.items = action.payload
        state.isInitialized = true
      })
      .addCase(fetchTankers.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })

      .addCase(createTankerAction.pending, (state) => { state.operationLoading.create = true; state.error = null })
      .addCase(createTankerAction.fulfilled, (state, action: PayloadAction<Tanker>) => {
        state.operationLoading.create = false
        state.items.unshift(action.payload)
      })
      .addCase(createTankerAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })

      .addCase(updateTankerAction.pending, (state) => { state.operationLoading.update = true; state.error = null })
      .addCase(updateTankerAction.fulfilled, (state, action: PayloadAction<Tanker>) => {
        state.operationLoading.update = false
        const idx = state.items.findIndex(i => i.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
      .addCase(updateTankerAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })

      .addCase(deleteTankerAction.pending, (state) => { state.operationLoading.delete = true; state.error = null })
      .addCase(deleteTankerAction.fulfilled, (state, action: PayloadAction<string>) => {
        state.operationLoading.delete = false
        state.items = state.items.filter(i => i.id !== action.payload)
      })
      .addCase(deleteTankerAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = tankerSlice.actions
export default tankerSlice.reducer


