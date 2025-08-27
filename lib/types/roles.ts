export interface UserRole {
  id: string
  created_at: string
  role_name: string
  user_operations: string[]
  role_operations: string[]
  machine_item_operations: string[]
  silo_item_operations: string[]
  supplier_operations: string[]
  process_operations: string[]
  devices_operations: string[]
  views: string[]
  updated_at: string
}

export interface CreateRoleRequest {
  role_name: string
  features: {
    user: {
      operations: string[]
    }
    role: {
      operations: string[]
    }
    machine_item: {
      operations: string[]
    }
    silo_item: {
      operations: string[]
    }
    supplier: {
      operations: string[]
    }
    process: {
      operations: string[]
    }
    devices: {
      operations: string[]
    }
  }
  views: string[]
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  id: string
  updated_at: string
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export type RolesResponse = ApiResponse<UserRole[]>
export type RoleResponse = ApiResponse<UserRole>
export type DeleteRoleResponse = ApiResponse<null>
