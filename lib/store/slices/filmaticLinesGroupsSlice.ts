import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { filmaticLinesGroupsApi, FilmaticLinesGroup, FilmaticLinesGroupCreateRequest, FilmaticLinesGroupDetail } from "@/lib/api/filmatic-lines-groups"

interface OperationLoading { create: boolean; update: boolean; delete: boolean; fetch: boolean }

interface State {
  groups: FilmaticLinesGroup[]
  details: FilmaticLinesGroupDetail[]
  currentGroup: FilmaticLinesGroup | null
  loading: boolean
  operationLoading: OperationLoading
  error: string | null
  isInitialized: boolean
}

const initialState: State = {
  groups: [],
  details: [],
  currentGroup: null,
  loading: false,
  operationLoading: { create: false, update: false, delete: false, fetch: false },
  error: null,
  isInitialized: false,
}

export const fetchFilmaticGroups = createAsyncThunk("flg/fetchGroups", async (_, { rejectWithValue }) => {
  try { const res = await filmaticLinesGroupsApi.getGroups(); return res.data } catch (e: any) { return rejectWithValue(e?.body?.message || e?.message) }
})

export const fetchFilmaticGroupDetails = createAsyncThunk("flg/fetchDetails", async (_, { rejectWithValue }) => {
  try { const res = await filmaticLinesGroupsApi.getDetails(); return res.data } catch (e: any) { return rejectWithValue(e?.body?.message || e?.message) }
})

export const createFilmaticGroup = createAsyncThunk("flg/createGroup", async (body: FilmaticLinesGroupCreateRequest, { rejectWithValue }) => {
  try { const res = await filmaticLinesGroupsApi.createGroup(body); return res.data } catch (e: any) { return rejectWithValue(e?.body?.message || e?.message) }
})

export const createFilmaticGroupDetails = createAsyncThunk("flg/createDetails", async (body: { filmatic_line_groups_id: string; group_name: string; operator_ids: string[] }, { rejectWithValue }) => {
  try { const res = await filmaticLinesGroupsApi.createDetails(body as any); return res.data } catch (e: any) { return rejectWithValue(e?.body?.message || e?.message) }
})

const slice = createSlice({
  name: "flg",
  initialState,
  reducers: { clearError(state){ state.error = null }, setCurrentGroup(state, action: PayloadAction<FilmaticLinesGroup | null>){ state.currentGroup = action.payload } },
  extraReducers: (b) => {
    b
      .addCase(fetchFilmaticGroups.pending, (s)=>{ s.operationLoading.fetch = true })
      .addCase(fetchFilmaticGroups.fulfilled, (s, a: PayloadAction<FilmaticLinesGroup[]>)=>{ s.operationLoading.fetch = false; s.groups = a.payload; s.isInitialized = true })
      .addCase(fetchFilmaticGroups.rejected, (s, a)=>{ s.operationLoading.fetch = false; s.error = a.payload as string })
      .addCase(fetchFilmaticGroupDetails.pending, (s)=>{ s.operationLoading.fetch = true })
      .addCase(fetchFilmaticGroupDetails.fulfilled, (s, a: PayloadAction<FilmaticLinesGroupDetail[]>)=>{ s.operationLoading.fetch = false; s.details = a.payload })
      .addCase(fetchFilmaticGroupDetails.rejected, (s, a)=>{ s.operationLoading.fetch = false; s.error = a.payload as string })
      .addCase(createFilmaticGroup.pending, (s)=>{ s.operationLoading.create = true; s.error = null })
      .addCase(createFilmaticGroup.fulfilled, (s, a: PayloadAction<FilmaticLinesGroup>)=>{ s.operationLoading.create = false; s.currentGroup = a.payload; s.groups.unshift(a.payload) })
      .addCase(createFilmaticGroup.rejected, (s, a)=>{ s.operationLoading.create = false; s.error = a.payload as string })
      .addCase(createFilmaticGroupDetails.pending, (s)=>{ s.operationLoading.update = true; s.error = null })
      .addCase(createFilmaticGroupDetails.fulfilled, (s, a: PayloadAction<FilmaticLinesGroupDetail>)=>{ s.operationLoading.update = false; s.details.unshift(a.payload) })
      .addCase(createFilmaticGroupDetails.rejected, (s, a)=>{ s.operationLoading.update = false; s.error = a.payload as string })
  }
})

export const { clearError, setCurrentGroup } = slice.actions
export default slice.reducer


