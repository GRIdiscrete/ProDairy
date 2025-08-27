import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import type { Supplier, TableFilters } from "@/lib/types"
import { supplierApi } from "@/lib/api/supplier"

interface SupplierState {
  suppliers: Supplier[]
  selectedSupplier: Supplier | null
  filters: TableFilters
  loading: boolean
  error: string | null
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
}

const initialState: SupplierState = {
  suppliers: [],
  selectedSupplier: null,
  filters: {},
  loading: false,
  error: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false,
  },
}

// Async thunks
export const fetchSuppliers = createAsyncThunk(
  "supplier/fetchSuppliers", 
  async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
    try {
      const response = await supplierApi.getSuppliers(params)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch suppliers'
      return rejectWithValue(message)
    }
  }
)

export const fetchSupplier = createAsyncThunk(
  "supplier/fetchSupplier",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await supplierApi.getSupplier(id)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch supplier'
      return rejectWithValue(message)
    }
  }
)

export const createSupplier = createAsyncThunk(
  "supplier/createSupplier",
  async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await supplierApi.createSupplier(supplierData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create supplier'
      return rejectWithValue(message)
    }
  }
)

export const updateSupplier = createAsyncThunk(
  "supplier/updateSupplier",
  async (supplierData: Supplier, { rejectWithValue }) => {
    try {
      const response = await supplierApi.updateSupplier(supplierData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update supplier'
      return rejectWithValue(message)
    }
  }
)

export const deleteSupplier = createAsyncThunk(
  "supplier/deleteSupplier",
  async (id: string, { rejectWithValue }) => {
    try {
      await supplierApi.deleteSupplier(id)
      return id
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete supplier'
      return rejectWithValue(message)
    }
  }
)

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    setSupplierFilters: (state, action) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedSupplier: (state, action: PayloadAction<Supplier | null>) => {
      state.selectedSupplier = action.payload
    },
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.suppliers = action.payload
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single supplier
      .addCase(fetchSupplier.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSupplier.fulfilled, (state, action) => {
        state.loading = false
        state.selectedSupplier = action.payload
      })
      .addCase(fetchSupplier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create supplier
      .addCase(createSupplier.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.suppliers.push(action.payload)
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id)
        if (index !== -1) {
          state.suppliers[index] = action.payload
        }
        if (state.selectedSupplier?.id === action.payload.id) {
          state.selectedSupplier = action.payload
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload)
        if (state.selectedSupplier?.id === action.payload) {
          state.selectedSupplier = null
        }
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, setSupplierFilters, clearError, setSelectedSupplier, clearSelectedSupplier } = supplierSlice.actions
export default supplierSlice.reducer