import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { usersApi, type CreateUserRequest, type UpdateUserRequest, type UserEntity } from "@/lib/api/users"
import type { TableFilters } from "@/lib/types"

export interface UsersState {
  items: UserEntity[]
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk("users/fetchAll", async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
  try {
    const res = await usersApi.getUsers(params)
    return res.data
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.body?.message || error?.message || "Failed to fetch users"
    return rejectWithValue(message)
  }
})

export const createUser = createAsyncThunk("users/create", async (payload: CreateUserRequest, { rejectWithValue }) => {
  try {
    const res = await usersApi.createUser(payload)
    return res.data
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.body?.message || error?.message || "Failed to create user"
    return rejectWithValue(message)
  }
})

export const updateUser = createAsyncThunk("users/update", async (payload: UpdateUserRequest, { rejectWithValue }) => {
  try {
    const res = await usersApi.updateUser(payload)
    return res.data
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.body?.message || error?.message || "Failed to update user"
    return rejectWithValue(message)
  }
})

export const deleteUser = createAsyncThunk("users/delete", async (id: string, { rejectWithValue }) => {
  try {
    await usersApi.deleteUser(id)
    return id
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.body?.message || error?.message || "Failed to delete user"
    return rejectWithValue(message)
  }
})

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<UserEntity[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message || "Failed to fetch users"
      })
      // createUser
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<UserEntity>) => {
        state.loading = false
        state.items.unshift(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as any)?.message || action.error.message || "Failed to create user"
      })
      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<UserEntity>) => {
        state.loading = false
        const idx = state.items.findIndex((u) => u.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as any)?.message || action.error.message || "Failed to update user"
      })
      // deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.items = state.items.filter((u) => u.id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message || "Failed to delete user"
      })
  },
})

export const { clearUsersError } = usersSlice.actions
export default usersSlice.reducer
