import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { qaRejectNoteApi, QaRejectNote } from "@/lib/api/qa-reject-note"

export const fetchQaRejectNotes = createAsyncThunk("qaRejectNotes/fetchAll", async (_, thunkAPI) => {
  try {
    const data = await qaRejectNoteApi.getAll()
    return data || []
  } catch (err:any) {
    return thunkAPI.rejectWithValue(err?.message || String(err))
  }
})

export const createQaRejectNoteAction = createAsyncThunk("qaRejectNotes/create", async (payload:any, thunkAPI) => {
  try {
    const data = await qaRejectNoteApi.create(payload)
    return data
  } catch (err:any) {
    return thunkAPI.rejectWithValue(err?.message || String(err))
  }
})

export const updateQaRejectNoteAction = createAsyncThunk("qaRejectNotes/update", async (payload:any, thunkAPI) => {
  try {
    const data = await qaRejectNoteApi.update(payload)
    return data
  } catch (err:any) {
    return thunkAPI.rejectWithValue(err?.message || String(err))
  }
})

export const deleteQaRejectNoteAction = createAsyncThunk("qaRejectNotes/delete", async (id:string, thunkAPI) => {
  try {
    await qaRejectNoteApi.delete(id)
    return id
  } catch (err:any) {
    return thunkAPI.rejectWithValue(err?.message || String(err))
  }
})

type State = {
  items: QaRejectNote[]
  loading: boolean
  operationLoading: any
  error?: string | null
  isInitialized?: boolean
}

const initialState: State = {
  items: [],
  loading: false,
  operationLoading: {},
  error: null,
  isInitialized: false
}

const slice = createSlice({
  name: "qaRejectNotes",
  initialState,
  reducers: {
    clearError(state) { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQaRejectNotes.pending, (s) => { s.loading = true })
      .addCase(fetchQaRejectNotes.fulfilled, (s,a) => { s.loading = false; s.items = a.payload || []; s.isInitialized = true })
      .addCase(fetchQaRejectNotes.rejected, (s,a) => { s.loading = false; s.error = String(a.payload || a.error?.message) })

      .addCase(createQaRejectNoteAction.pending, (s) => { s.operationLoading.create = true })
      .addCase(createQaRejectNoteAction.fulfilled, (s,a) => { s.operationLoading.create = false; if (a.payload) s.items.unshift(a.payload) })
      .addCase(createQaRejectNoteAction.rejected, (s,a) => { s.operationLoading.create = false; s.error = String(a.payload || a.error?.message) })

      .addCase(updateQaRejectNoteAction.pending, (s) => { s.operationLoading.update = true })
      .addCase(updateQaRejectNoteAction.fulfilled, (s,a) => {
        s.operationLoading.update = false
        if (!a.payload) return
        const idx = s.items.findIndex(i => i.id === a.payload.id)
        if (idx >= 0) s.items[idx] = a.payload
      })
      .addCase(updateQaRejectNoteAction.rejected, (s,a) => { s.operationLoading.update = false; s.error = String(a.payload || a.error?.message) })

      .addCase(deleteQaRejectNoteAction.pending, (s) => { s.operationLoading.delete = true })
      .addCase(deleteQaRejectNoteAction.fulfilled, (s,a) => { s.operationLoading.delete = false; s.items = s.items.filter(i => i.id !== a.payload) })
      .addCase(deleteQaRejectNoteAction.rejected, (s,a) => { s.operationLoading.delete = false; s.error = String(a.payload || a.error?.message) })
  }
})

export const { clearError } = slice.actions
export default slice.reducer
