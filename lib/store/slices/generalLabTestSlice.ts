import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { generalLabTestApi, GeneralLabTest } from '@/lib/api/general-lab-test'

export const fetchGeneralLabTests = createAsyncThunk(
  'generalLabTests/fetchAll',
  async () => {
    const res = await generalLabTestApi.getAll()
    return res.data
  }
)

export const createGeneralLabTestAction = createAsyncThunk(
  'generalLabTests/create',
  async (data: GeneralLabTest) => {
    const res = await generalLabTestApi.create(data)
    return res.data
  }
)

export const updateGeneralLabTestAction = createAsyncThunk(
  'generalLabTests/update',
  async ({ id, data }: { id: string, data: GeneralLabTest }) => {
    const res = await generalLabTestApi.update(id, data)
    return res.data
  }
)

export const deleteGeneralLabTestAction = createAsyncThunk(
  'generalLabTests/delete',
  async (id: string) => {
    await generalLabTestApi.delete(id)
    return id
  }
)

const initialState = {
  tests: [] as GeneralLabTest[],
  loading: false,
  error: null as string | null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
  },
  isInitialized: false,
}

const generalLabTestSlice = createSlice({
  name: 'generalLabTests',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGeneralLabTests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGeneralLabTests.fulfilled, (state, action) => {
        state.loading = false
        state.tests = action.payload
        state.isInitialized = true
      })
      .addCase(fetchGeneralLabTests.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch lab tests'
      })
      .addCase(createGeneralLabTestAction.pending, (state) => {
        state.operationLoading.create = true
      })
      .addCase(createGeneralLabTestAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.tests.unshift(action.payload)
      })
      .addCase(createGeneralLabTestAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.error.message || 'Failed to create lab test'
      })
      .addCase(updateGeneralLabTestAction.pending, (state) => {
        state.operationLoading.update = true
      })
      .addCase(updateGeneralLabTestAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const idx = state.tests.findIndex(t => t.id === action.payload.id)
        if (idx !== -1) state.tests[idx] = action.payload
      })
      .addCase(updateGeneralLabTestAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.error.message || 'Failed to update lab test'
      })
      .addCase(deleteGeneralLabTestAction.pending, (state) => {
        state.operationLoading.delete = true
      })
      .addCase(deleteGeneralLabTestAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.tests = state.tests.filter(t => t.id !== action.payload)
      })
      .addCase(deleteGeneralLabTestAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.error.message || 'Failed to delete lab test'
      })
  }
})

export const { clearError } = generalLabTestSlice.actions
export default generalLabTestSlice.reducer
