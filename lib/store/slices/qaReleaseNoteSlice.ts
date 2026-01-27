import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { qaReleaseNoteApi, QaReleaseNote } from "@/lib/api/qa-release-note"

export const fetchQaReleaseNotes = createAsyncThunk("qaReleaseNotes/fetchAll", async (_, thunkAPI) => {
  try {
    const res = await qaReleaseNoteApi.getAll()
    return res || []
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || String(err))
  }
})

export const createQaReleaseNoteAction = createAsyncThunk("qaReleaseNotes/create", async (payload: any, thunkAPI) => {
  try {
    const res = await qaReleaseNoteApi.create(payload)
    return res
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || String(err))
  }
})

export const updateQaReleaseNoteAction = createAsyncThunk("qaReleaseNotes/update", async (payload: any, thunkAPI) => {
  try {
    const res = await qaReleaseNoteApi.update(payload)
    return res
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || String(err))
  }
})

export const deleteQaReleaseNoteAction = createAsyncThunk("qaReleaseNotes/delete", async (id: string, thunkAPI) => {
  try {
    await qaReleaseNoteApi.delete(id)
    return id
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || String(err))
  }
})

type State = {
  items: QaReleaseNote[]
  loading: boolean
  operationLoading: { create?: boolean; update?: boolean; delete?: boolean }
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
  name: "qaReleaseNotes",
  initialState,
  reducers: {
    clearError(state) { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQaReleaseNotes.pending, (s) => { s.loading = true })
      .addCase(fetchQaReleaseNotes.fulfilled, (s, a) => { s.loading = false; s.items = a.payload || []; s.isInitialized = true })
      .addCase(fetchQaReleaseNotes.rejected, (s, a) => { s.loading = false; s.error = String(a.payload || a.error?.message) })

      .addCase(createQaReleaseNoteAction.pending, (s) => { s.operationLoading.create = true })
      .addCase(createQaReleaseNoteAction.fulfilled, (s, a) => { s.operationLoading.create = false; if (a.payload) s.items.unshift(a.payload) })
      .addCase(createQaReleaseNoteAction.rejected, (s, a) => { s.operationLoading.create = false; s.error = String(a.payload || a.error?.message) })

      .addCase(updateQaReleaseNoteAction.pending, (s) => { s.operationLoading.update = true })
      .addCase(updateQaReleaseNoteAction.fulfilled, (s, a) => {
        s.operationLoading.update = false
        if (!a.payload) return
        const idx = s.items.findIndex(i => i.id === a.payload.id)
        if (idx >= 0) s.items[idx] = a.payload
      })
      .addCase(updateQaReleaseNoteAction.rejected, (s, a) => { s.operationLoading.update = false; s.error = String(a.payload || a.error?.message) })

      .addCase(deleteQaReleaseNoteAction.pending, (s) => { s.operationLoading.delete = true })
      .addCase(deleteQaReleaseNoteAction.fulfilled, (s, a) => {
        s.operationLoading.delete = false
        s.items = s.items.filter(i => i.id !== a.payload)
      })
      .addCase(deleteQaReleaseNoteAction.rejected, (s, a) => { s.operationLoading.delete = false; s.error = String(a.payload || a.error?.message) })
  }
})

export const { clearError } = slice.actions
export default slice.reducer
