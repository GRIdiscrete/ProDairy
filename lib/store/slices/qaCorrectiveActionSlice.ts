import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  getQACorrectiveActions, 
  createQACorrectiveAction, 
  updateQACorrectiveAction, 
  deleteQACorrectiveAction,
  QACorrectiveAction
} from '@/lib/api/data-capture-forms'

interface QACorrectiveActionState {
  actions: QACorrectiveAction[]
  currentAction: QACorrectiveAction | null
  loading: boolean
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
  error: string | null
  lastFetched: number | null
  isInitialized: boolean
}

const initialState: QACorrectiveActionState = {
  actions: [],
  currentAction: null,
  loading: false,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false,
  },
  error: null,
  lastFetched: null,
  isInitialized: false,
}

// Async thunks
export const fetchQACorrectiveActions = createAsyncThunk(
  'qaCorrectiveActions/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { qaCorrectiveActions: QACorrectiveActionState }
      const { lastFetched, isInitialized } = state.qaCorrectiveActions
      
      // Skip if recently fetched (within 5 seconds)
      if (isInitialized && lastFetched && Date.now() - lastFetched < 5000) {
        return state.qaCorrectiveActions.actions
      }
      
      const actions = await getQACorrectiveActions()
      return actions
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch QA corrective actions'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createQACorrectiveActionAction = createAsyncThunk(
  'qaCorrectiveActions/create',
  async (data: Omit<QACorrectiveAction, 'id' | 'created_at' | 'updated_at' | 'details'>, { rejectWithValue }) => {
    try {
      const action = await createQACorrectiveAction(data)
      return action
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create QA corrective action'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateQACorrectiveActionAction = createAsyncThunk(
  'qaCorrectiveActions/update',
  async (data: QACorrectiveAction, { rejectWithValue }) => {
    try {
      const action = await updateQACorrectiveAction(data)
      return action
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update QA corrective action'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteQACorrectiveActionAction = createAsyncThunk(
  'qaCorrectiveActions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteQACorrectiveAction(id)
      return id
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete QA corrective action'
      return rejectWithValue(errorMessage)
    }
  }
)

const qaCorrectiveActionSlice = createSlice({
  name: 'qaCorrectiveActions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentAction: (state, action: PayloadAction<QACorrectiveAction | null>) => {
      state.currentAction = action.payload
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch all actions
      .addCase(fetchQACorrectiveActions.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchQACorrectiveActions.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.actions = action.payload
        state.lastFetched = Date.now()
        state.isInitialized = true
      })
      .addCase(fetchQACorrectiveActions.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Create action
      .addCase(createQACorrectiveActionAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createQACorrectiveActionAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        if (action.payload) {
          state.actions.unshift(action.payload)
        }
        // Reset lastFetched to force refresh on next fetch
        state.lastFetched = null
      })
      .addCase(createQACorrectiveActionAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update action
      .addCase(updateQACorrectiveActionAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateQACorrectiveActionAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        if (action.payload) {
          const index = state.actions.findIndex(action => action.id === action.payload.id)
          if (index !== -1) {
            state.actions[index] = action.payload
          }
          if (state.currentAction?.id === action.payload.id) {
            state.currentAction = action.payload
          }
        }
        // Reset lastFetched to force refresh on next fetch
        state.lastFetched = null
      })
      .addCase(updateQACorrectiveActionAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete action
      .addCase(deleteQACorrectiveActionAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteQACorrectiveActionAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.actions = state.actions.filter(action => action.id !== action.payload)
        if (state.currentAction?.id === action.payload) {
          state.currentAction = null
        }
      })
      .addCase(deleteQACorrectiveActionAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentAction, resetState } = qaCorrectiveActionSlice.actions
export default qaCorrectiveActionSlice.reducer
