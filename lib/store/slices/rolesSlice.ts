import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { rolesApi } from '../../api/roles'
import { UserRole, CreateRoleRequest, UpdateRoleRequest } from '../../types/roles'

interface RolesState {
  roles: UserRole[]
  selectedRole: UserRole | null
  loading: boolean
  error: string | null
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
}

const initialState: RolesState = {
  roles: [],
  selectedRole: null,
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
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
    try {
      const response = await rolesApi.getRoles(params)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch roles'
      return rejectWithValue(message)
    }
  }
)

export const fetchRole = createAsyncThunk(
  'roles/fetchRole',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rolesApi.getRole(id)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch role'
      return rejectWithValue(message)
    }
  }
)

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: CreateRoleRequest, { rejectWithValue }) => {
    try {
      const response = await rolesApi.createRole(roleData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create role'
      return rejectWithValue(message)
    }
  }
)

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async (roleData: UpdateRoleRequest, { rejectWithValue }) => {
    try {
      const response = await rolesApi.updateRole(roleData)
      return response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update role'
      return rejectWithValue(message)
    }
  }
)

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (id: string, { rejectWithValue }) => {
    try {
      await rolesApi.deleteRole(id)
      return id
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete role'
      return rejectWithValue(message)
    }
  }
)

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedRole: (state, action: PayloadAction<UserRole | null>) => {
      state.selectedRole = action.payload
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.roles = action.payload
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single role
      .addCase(fetchRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRole.fulfilled, (state, action) => {
        state.loading = false
        state.selectedRole = action.payload
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create role
      .addCase(createRole.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.roles.push(action.payload)
      })
      .addCase(createRole.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update role
      .addCase(updateRole.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.roles.findIndex(role => role.id === action.payload.id)
        if (index !== -1) {
          state.roles[index] = action.payload
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete role
      .addCase(deleteRole.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.roles = state.roles.filter(role => role.id !== action.payload)
        if (state.selectedRole?.id === action.payload) {
          state.selectedRole = null
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedRole, clearSelectedRole } = rolesSlice.actions
export default rolesSlice.reducer
