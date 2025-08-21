import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { Supplier, RawMilkIntake, TableFilters } from "@/lib/types"
import { supplierApi } from "@/lib/api/supplier"

interface SupplierState {
  suppliers: Supplier[]
  intakes: RawMilkIntake[]
  filters: TableFilters
  loading: boolean
  error: string | null
}

const initialState: SupplierState = {
  suppliers: [],
  intakes: [],
  filters: {},
  loading: false,
  error: null,
}

export const fetchSuppliers = createAsyncThunk(
  "supplier/fetchSuppliers",
  async (params: { filters?: TableFilters }) => {
    const response = await supplierApi.getSuppliers(params)
    return response.data
  },
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
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSuppliers.fulfilled, (state, action) => {
      state.loading = false
      state.suppliers = action.payload.suppliers
      state.intakes = action.payload.intakes
    })
  },
})

export const { setFilters, setSupplierFilters, clearError } = supplierSlice.actions
export default supplierSlice.reducer
