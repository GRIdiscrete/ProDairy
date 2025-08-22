import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { User } from "@/lib/types"

export const fetchUsers = createAsyncThunk("user/fetchUsers", async () => {
  // Mock API call - replace with actual API
  const mockUsers: User[] = [
    {
      id: "1",
      name: "Kudzai Jaure",
      email: "kudzai@email.com",
      role: "Admin",
      role_id: "2313123",
      department: "Sales",
      password: "hashed_password",
      created_at: "2024-03-04T13:23:22Z",
      avatar: "/placeholder.svg?height=40&width=40",
      isActive: true,
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Brooklyn Simmons",
      email: "brooklyn@email.com",
      role: "Manager",
      role_id: "2313124",
      department: "Production",
      password: "hashed_password",
      created_at: "2024-03-04T13:23:22Z",
      avatar: "/placeholder.svg?height=40&width=40",
      isActive: true,
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "3",
      name: "Dianne Russell",
      email: "dianne@email.com",
      role: "Operator",
      role_id: "2313125",
      department: "Quality",
      password: "hashed_password",
      created_at: "2024-03-04T13:23:22Z",
      avatar: "/placeholder.svg?height=40&width=40",
      isActive: true,
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ]

  return mockUsers
})

interface UserFilters {
  search?: string
  role?: string
  department?: string
  status?: string
}

interface UserState {
  currentUser: User | null
  users: User[]
  loading: boolean
  error: string | null
  filters: UserFilters
}

const initialState: UserState = {
  currentUser: {
    id: "1",
    name: "Blessing Mwale",
    email: "blessingmwalein@gmail.com",
    role: "admin",
    department: "Management",
    avatar: "/placeholder.svg?height=40&width=40",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  users: [],
  loading: false,
  error: null,
  filters: {},
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch users"
      })
  },
})

export const { setCurrentUser, clearError, setFilters } = userSlice.actions
export default userSlice.reducer
