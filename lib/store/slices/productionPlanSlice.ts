import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { productionPlanApi, type CreateProductionPlanRequest, type UpdateProductionPlanRequest } from "@/lib/api/production-plan"
import type { ProductionPlan, TableFilters } from "@/lib/types"

export interface ProductionPlanState {
  productionPlans: ProductionPlan[]
  selectedProductionPlan: ProductionPlan | null
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

const initialState: ProductionPlanState = {
  productionPlans: [],
  selectedProductionPlan: null,
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
export const fetchProductionPlans = createAsyncThunk(
  "productionPlan/fetchProductionPlans", 
  async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
    try {
      const response = await productionPlanApi.getProductionPlans(params)
      
      // Normalize the data structure - some records use raw_products, others use production_plan_raw_products
      const normalizedData = response.data.map((plan: any) => ({
        ...plan,
        raw_products: plan.raw_products || plan.production_plan_raw_products?.map((item: any) => ({
          raw_material_id: item.raw_material_id,
          raw_material_name: item.raw_material_name || '', // May need to be fetched separately
          requested_amount: item.requested_amount,
          unit_of_measure: item.units || item.unit_of_measure
        })) || [],
        output: plan.output || {
          value: plan.output_value || 0,
          unit_of_measure: plan.output_units || 'litres'
        }
      }))
      
      return normalizedData
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to fetch production plans'
      return rejectWithValue(message)
    }
  }
)

export const fetchProductionPlan = createAsyncThunk(
  "productionPlan/fetchProductionPlan",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productionPlanApi.getProductionPlan(id)
      
      // Normalize the data structure for single plan
      const plan = response.data
      const normalizedPlan = {
        ...plan,
        raw_products: plan.raw_products || plan.production_plan_raw_products?.map((item: any) => ({
          raw_material_id: item.raw_material_id,
          raw_material_name: item.raw_material_name || '', // May need to be fetched separately
          requested_amount: item.requested_amount,
          unit_of_measure: item.units || item.unit_of_measure
        })) || [],
        output: plan.output || {
          value: plan.output_value || 0,
          unit_of_measure: plan.output_units || 'litres'
        }
      }
      
      return normalizedPlan
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to fetch production plan'
      return rejectWithValue(message)
    }
  }
)

export const createProductionPlan = createAsyncThunk(
  "productionPlan/createProductionPlan",
  async (planData: CreateProductionPlanRequest, { rejectWithValue }) => {
    try {
      const response = await productionPlanApi.createProductionPlan(planData)
      
      // Normalize the created plan data back to internal format
      const plan = response.data
      const normalizedPlan = {
        ...plan,
        raw_products: plan.raw_products || plan.production_plan_raw_products?.map((item: any) => ({
          raw_material_id: item.raw_material_id,
          raw_material_name: item.raw_material_name || '',
          requested_amount: item.requested_amount,
          unit_of_measure: item.units || item.unit_of_measure
        })) || [],
        output: plan.output || {
          value: plan.output_value || 0,
          unit_of_measure: plan.output_units || 'litres'
        }
      }
      
      return normalizedPlan
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to create production plan'
      return rejectWithValue(message)
    }
  }
)

export const updateProductionPlan = createAsyncThunk(
  "productionPlan/updateProductionPlan",
  async (planData: UpdateProductionPlanRequest, { rejectWithValue }) => {
    try {
      const response = await productionPlanApi.updateProductionPlan(planData)
      
      // Normalize the updated plan data back to internal format
      const plan = response.data
      const normalizedPlan = {
        ...plan,
        raw_products: plan.raw_products || plan.production_plan_raw_products?.map((item: any) => ({
          raw_material_id: item.raw_material_id,
          raw_material_name: item.raw_material_name || '',
          requested_amount: item.requested_amount,
          unit_of_measure: item.units || item.unit_of_measure
        })) || [],
        output: plan.output || {
          value: plan.output_value || 0,
          unit_of_measure: plan.output_units || 'litres'
        }
      }
      
      return normalizedPlan
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to update production plan'
      return rejectWithValue(message)
    }
  }
)

export const deleteProductionPlan = createAsyncThunk(
  "productionPlan/deleteProductionPlan",
  async (id: string, { rejectWithValue }) => {
    try {
      await productionPlanApi.deleteProductionPlan(id)
      return id
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to delete production plan'
      return rejectWithValue(message)
    }
  }
)

const productionPlanSlice = createSlice({
  name: "productionPlan",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedProductionPlan: (state, action: PayloadAction<ProductionPlan | null>) => {
      state.selectedProductionPlan = action.payload
    },
    clearSelectedProductionPlan: (state) => {
      state.selectedProductionPlan = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch production plans
      .addCase(fetchProductionPlans.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchProductionPlans.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.productionPlans = action.payload
      })
      .addCase(fetchProductionPlans.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single production plan
      .addCase(fetchProductionPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductionPlan.fulfilled, (state, action) => {
        state.loading = false
        state.selectedProductionPlan = action.payload
      })
      .addCase(fetchProductionPlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create production plan
      .addCase(createProductionPlan.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createProductionPlan.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.productionPlans.push(action.payload)
      })
      .addCase(createProductionPlan.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update production plan
      .addCase(updateProductionPlan.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateProductionPlan.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.productionPlans.findIndex(plan => plan.id === action.payload.id)
        if (index !== -1) {
          state.productionPlans[index] = action.payload
        }
        if (state.selectedProductionPlan?.id === action.payload.id) {
          state.selectedProductionPlan = action.payload
        }
      })
      .addCase(updateProductionPlan.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete production plan
      .addCase(deleteProductionPlan.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteProductionPlan.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.productionPlans = state.productionPlans.filter(plan => plan.id !== action.payload)
        if (state.selectedProductionPlan?.id === action.payload) {
          state.selectedProductionPlan = null
        }
      })
      .addCase(deleteProductionPlan.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, clearError, setSelectedProductionPlan, clearSelectedProductionPlan } = productionPlanSlice.actions
export default productionPlanSlice.reducer
