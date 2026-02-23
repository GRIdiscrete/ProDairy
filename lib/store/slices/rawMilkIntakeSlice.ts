import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  CreateRawMilkIntakeFormRequest,
  RawMilkIntakeForm,
  TestedTruck,
  TruckCompartment,
  rawMilkIntakeApi,
} from '@/lib/api/raw-milk-intake'

interface RawMilkIntakeState {
  rawMilkIntakeForms: RawMilkIntakeForm[]
  /** Trucks ready for intake (from /tested-trucks) */
  testedTrucks: TestedTruck[]
  /** Compartments for the currently selected truck */
  truckCompartments: TruckCompartment[]
  /** Legacy: kept for any remaining references */
  trucks: TruckCompartment[]
  operationLoading: {
    fetch: boolean
    fetchTrucks: boolean
    fetchCompartments: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: any | null
  isInitialized: boolean
}

const initialState: RawMilkIntakeState = {
  rawMilkIntakeForms: [],
  testedTrucks: [],
  truckCompartments: [],
  trucks: [],
  operationLoading: {
    fetch: false,
    fetchTrucks: false,
    fetchCompartments: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
  isInitialized: false,
}

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchRawMilkIntakeForms = createAsyncThunk(
  'rawMilkIntake/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.getAll()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error || { message: 'Failed to fetch forms' })
    }
  }
)

/** Fetch trucks ready for intake from /tested-trucks */
export const fetchTestedTrucks = createAsyncThunk(
  'rawMilkIntake/fetchTestedTrucks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.getTestedTrucks()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error || { message: 'Failed to fetch tested trucks' })
    }
  }
)

/** Fetch compartments for a specific truck number */
export const fetchTruckCompartments = createAsyncThunk(
  'rawMilkIntake/fetchTruckCompartments',
  async (truckNumber: string, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.getCompartmentsByTruck(truckNumber)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error || { message: 'Failed to fetch truck compartments' })
    }
  }
)

/** Legacy alias — still works but now fetches from new endpoint */
export const fetchTrucks = createAsyncThunk(
  'rawMilkIntake/fetchTrucks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.getTestedTrucks()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error || { message: 'Failed to fetch trucks' })
    }
  }
)

export const fetchPendingVouchers = createAsyncThunk(
  'rawMilkIntake/fetchPendingVouchers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.getVouchersPendingTransfer()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error || { message: 'Failed to fetch pending vouchers' })
    }
  }
)

export const createRawMilkIntakeForm = createAsyncThunk(
  'rawMilkIntake/create',
  async (formData: CreateRawMilkIntakeFormRequest, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.create(formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error || { message: 'Failed to create form' })
    }
  }
)

export const updateRawMilkIntakeForm = createAsyncThunk(
  'rawMilkIntake/update',
  async (formData: CreateRawMilkIntakeFormRequest, { rejectWithValue }) => {
    try {
      if (!formData.id) throw new Error('Form ID is required for update')
      const response = await rawMilkIntakeApi.update(formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error || { message: 'Failed to update form' })
    }
  }
)

export const deleteRawMilkIntakeForm = createAsyncThunk(
  'rawMilkIntake/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rawMilkIntakeApi.delete(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error || { message: 'Failed to delete form' })
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const rawMilkIntakeSlice = createSlice({
  name: 'rawMilkIntake',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    clearTruckCompartments: (state) => { state.truckCompartments = [] },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchRawMilkIntakeForms.pending, (s) => { s.operationLoading.fetch = true })
      .addCase(fetchRawMilkIntakeForms.fulfilled, (s, a: PayloadAction<RawMilkIntakeForm[]>) => {
        s.operationLoading.fetch = false
        s.rawMilkIntakeForms = a.payload
        s.isInitialized = true
        s.error = null
      })
      .addCase(fetchRawMilkIntakeForms.rejected, (s, a) => {
        s.operationLoading.fetch = false
        s.error = a.payload
      })

      // Fetch tested trucks
      .addCase(fetchTestedTrucks.pending, (s) => { s.operationLoading.fetchTrucks = true })
      .addCase(fetchTestedTrucks.fulfilled, (s, a: PayloadAction<TestedTruck[]>) => {
        s.operationLoading.fetchTrucks = false
        s.testedTrucks = a.payload
        s.error = null
      })
      .addCase(fetchTestedTrucks.rejected, (s, a) => {
        s.operationLoading.fetchTrucks = false
        s.error = a.payload
      })

      // Fetch truck compartments
      .addCase(fetchTruckCompartments.pending, (s) => { s.operationLoading.fetchCompartments = true })
      .addCase(fetchTruckCompartments.fulfilled, (s, a: PayloadAction<TruckCompartment[]>) => {
        s.operationLoading.fetchCompartments = false
        s.truckCompartments = a.payload
        s.error = null
      })
      .addCase(fetchTruckCompartments.rejected, (s, a) => {
        s.operationLoading.fetchCompartments = false
        s.error = a.payload
      })

      // Legacy fetchTrucks
      .addCase(fetchTrucks.pending, (s) => { s.operationLoading.fetchTrucks = true })
      .addCase(fetchTrucks.fulfilled, (s, a) => {
        s.operationLoading.fetchTrucks = false
        s.error = null
      })
      .addCase(fetchTrucks.rejected, (s, a) => {
        s.operationLoading.fetchTrucks = false
        s.error = a.payload
      })

      // Create
      .addCase(createRawMilkIntakeForm.pending, (s) => { s.operationLoading.create = true })
      .addCase(createRawMilkIntakeForm.fulfilled, (s, _a: PayloadAction<RawMilkIntakeForm>) => {
        s.operationLoading.create = false
        // Do NOT push the create response — it lacks a `details` array.
        // The form drawer dispatches fetchRawMilkIntakeForms() after this, which
        // reloads the full list from the server.
        s.error = null
      })
      .addCase(createRawMilkIntakeForm.rejected, (s, a) => {
        s.operationLoading.create = false
        s.error = a.payload
      })

      // Update
      .addCase(updateRawMilkIntakeForm.pending, (s) => { s.operationLoading.update = true })
      .addCase(updateRawMilkIntakeForm.fulfilled, (s, a: PayloadAction<RawMilkIntakeForm>) => {
        s.operationLoading.update = false
        const idx = s.rawMilkIntakeForms.findIndex((f) => f.id === a.payload.id)
        if (idx !== -1) s.rawMilkIntakeForms[idx] = a.payload
        s.error = null
      })
      .addCase(updateRawMilkIntakeForm.rejected, (s, a) => {
        s.operationLoading.update = false
        s.error = a.payload
      })

      // Delete
      .addCase(deleteRawMilkIntakeForm.pending, (s) => { s.operationLoading.delete = true })
      .addCase(deleteRawMilkIntakeForm.fulfilled, (s, a) => {
        s.operationLoading.delete = false
        s.rawMilkIntakeForms = s.rawMilkIntakeForms.filter((f) => f.id !== a.meta.arg)
        s.error = null
      })
      .addCase(deleteRawMilkIntakeForm.rejected, (s, a) => {
        s.operationLoading.delete = false
        s.error = a.payload
      })
  },
})

export const { clearError, clearTruckCompartments } = rawMilkIntakeSlice.actions
export default rawMilkIntakeSlice.reducer
