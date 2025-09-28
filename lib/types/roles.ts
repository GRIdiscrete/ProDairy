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
  raw_product_collection: string[]
  raw_milk_intake: string[]
  raw_milk_lab_test: string[]
  before_and_after_autoclave_lab_test: string[]
  pasteurizing: string[]
  filmatic_operation: string[]
  steri_process_operation: string[]
  incubation: string[]
  incubation_lab_test: string[]
  dispatch: string[]
  production_plan: string[]
  views: string[]
  updated_at: string
}

export interface CreateRoleRequest {
  role_name: string
  // Original permissions
  user_operations: string[]
  role_operations: string[]
  machine_item_operations: string[]
  silo_item_operations: string[]
  supplier_operations: string[]
  process_operations: string[]
  devices_operations: string[]
  
  // New permissions
  raw_product_collection: string[]
  raw_milk_intake: string[]
  raw_milk_lab_test: string[]
  before_and_after_autoclave_lab_test: string[]
  pasteurizing: string[]
  filmatic_operation: string[]
  steri_process_operation: string[]
  incubation: string[]
  incubation_lab_test: string[]
  dispatch: string[]
  production_plan: string[]
  
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
