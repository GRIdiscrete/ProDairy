// API Response structure (flat)
export interface UserRoleResponse {
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
  raw_product_collection: string[] | null
  raw_milk_intake: string[] | null
  raw_milk_lab_test: string[] | null
  before_and_after_autoclave_lab_test: string[] | null
  pasteurizing: string[] | null
  filmatic_operation: string[] | null
  steri_process_operation: string[] | null
  incubation: string[] | null
  incubation_lab_test: string[] | null
  dispatch: string[] | null
  production_plan: string[] | null
  views: string[]
  updated_at: string | null
}

// Internal UserRole interface (nested structure for form handling)
export interface UserRole {
  id: string
  created_at: string
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
    raw_product_collection: {
      operations: string[]
    }
    raw_milk_intake: {
      operations: string[]
    }
    raw_milk_lab_test: {
      operations: string[]
    }
    before_and_after_autoclave_lab_test: {
      operations: string[]
    }
    pasteurizing: {
      operations: string[]
    }
    filmatic_operation: {
      operations: string[]
    }
    steri_process_operation: {
      operations: string[]
    }
    incubation: {
      operations: string[]
    }
    incubation_lab_test: {
      operations: string[]
    }
    dispatch: {
      operations: string[]
    }
    production_plan: {
      operations: string[]
    }
  }
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
    raw_product_collection: {
      operations: string[]
    }
    raw_milk_intake: {
      operations: string[]
    }
    raw_milk_lab_test: {
      operations: string[]
    }
    before_and_after_autoclave_lab_test: {
      operations: string[]
    }
    pasteurizing: {
      operations: string[]
    }
    filmatic_operation: {
      operations: string[]
    }
    steri_process_operation: {
      operations: string[]
    }
    incubation: {
      operations: string[]
    }
    incubation_lab_test: {
      operations: string[]
    }
    dispatch: {
      operations: string[]
    }
    production_plan: {
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

export type RolesResponse = ApiResponse<UserRoleResponse[]>
export type RoleResponse = ApiResponse<UserRoleResponse>
export type DeleteRoleResponse = ApiResponse<null>

// Utility functions to convert between API response and internal format
export const convertApiResponseToUserRole = (apiRole: UserRoleResponse): UserRole => {
  return {
    id: apiRole.id,
    created_at: apiRole.created_at,
    role_name: apiRole.role_name,
    features: {
      user: { operations: apiRole.user_operations || [] },
      role: { operations: apiRole.role_operations || [] },
      machine_item: { operations: apiRole.machine_item_operations || [] },
      silo_item: { operations: apiRole.silo_item_operations || [] },
      supplier: { operations: apiRole.supplier_operations || [] },
      process: { operations: apiRole.process_operations || [] },
      devices: { operations: apiRole.devices_operations || [] },
      raw_product_collection: { operations: apiRole.raw_product_collection || [] },
      raw_milk_intake: { operations: apiRole.raw_milk_intake || [] },
      raw_milk_lab_test: { operations: apiRole.raw_milk_lab_test || [] },
      before_and_after_autoclave_lab_test: { operations: apiRole.before_and_after_autoclave_lab_test || [] },
      pasteurizing: { operations: apiRole.pasteurizing || [] },
      filmatic_operation: { operations: apiRole.filmatic_operation || [] },
      steri_process_operation: { operations: apiRole.steri_process_operation || [] },
      incubation: { operations: apiRole.incubation || [] },
      incubation_lab_test: { operations: apiRole.incubation_lab_test || [] },
      dispatch: { operations: apiRole.dispatch || [] },
      production_plan: { operations: apiRole.production_plan || [] },
    },
    views: apiRole.views || [],
    updated_at: apiRole.updated_at || apiRole.created_at,
  }
}

export const convertUserRoleToApiRequest = (userRole: UserRole): CreateRoleRequest => {
  return {
    role_name: userRole.role_name,
    features: userRole.features,
    views: userRole.views,
  }
}
