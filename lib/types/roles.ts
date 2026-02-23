// API Response structure — matches actual backend response exactly
export interface UserRoleResponse {
  id: string
  created_at: string
  updated_at: string | null
  role_name: string

  // System / Admin operations
  user_operations: string[]
  role_operations: string[]
  machine_item_operations: string[]
  silo_item_operations: string[]
  supplier_operations: string[]
  process_operations: string[]
  devices_operations: string[]
  production_plan_operations: string[]

  // Data Capture operations
  raw_product_collection_operations: string[]
  raw_milk_intake_operations: string[]
  raw_milk_lab_test_operations: string[]
  before_and_after_autoclave_lab_test_operations: string[]
  pasteurizing_operations: string[]
  filmatic_operation_operations: string[]
  steri_process_operation_operations: string[]
  incubation_operations: string[]
  incubation_lab_test_operations: string[]
  dispatch_operations: string[]
  bmt_operations: string[]

  // Process Log access columns (null when not configured)
  test_before_intake: string[] | null
  raw_milk_intake: string[] | null
  standarizing: string[] | null
  pasteurizing: string[] | null
  filmatic_1: string[] | null
  process_log: string[] | null
  filmatic_2: string[] | null
  palletizer: string[] | null
  incubation: string[] | null
  qa_check_post_incubation: string[] | null
  qa_corrrective_measures: string[] | null  // triple-r — matches the DB
  dispatch: string[] | null

  // View access
  views: string[]
}

// Internal UserRole = same flat shape (the form uses the flat keys directly)
export type UserRole = UserRoleResponse

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export type RolesResponse = ApiResponse<UserRoleResponse[]>
export type RoleResponse = ApiResponse<UserRoleResponse>
export type DeleteRoleResponse = ApiResponse<null>

// convertApiResponseToUserRole is now a no-op (response is already flat)
export const convertApiResponseToUserRole = (apiRole: UserRoleResponse): UserRole => apiRole

// Build create/update payload — all array fields, nulls sent as []
export const convertUserRoleToApiRequest = (role: UserRole) => ({
  role_name: role.role_name,
  user_operations: role.user_operations ?? [],
  role_operations: role.role_operations ?? [],
  machine_item_operations: role.machine_item_operations ?? [],
  silo_item_operations: role.silo_item_operations ?? [],
  supplier_operations: role.supplier_operations ?? [],
  process_operations: role.process_operations ?? [],
  devices_operations: role.devices_operations ?? [],
  production_plan_operations: role.production_plan_operations ?? [],
  raw_product_collection_operations: role.raw_product_collection_operations ?? [],
  raw_milk_intake_operations: role.raw_milk_intake_operations ?? [],
  raw_milk_lab_test_operations: role.raw_milk_lab_test_operations ?? [],
  before_and_after_autoclave_lab_test_operations: role.before_and_after_autoclave_lab_test_operations ?? [],
  pasteurizing_operations: role.pasteurizing_operations ?? [],
  filmatic_operation_operations: role.filmatic_operation_operations ?? [],
  steri_process_operation_operations: role.steri_process_operation_operations ?? [],
  incubation_operations: role.incubation_operations ?? [],
  incubation_lab_test_operations: role.incubation_lab_test_operations ?? [],
  dispatch_operations: role.dispatch_operations ?? [],
  bmt_operations: role.bmt_operations ?? [],
  test_before_intake: role.test_before_intake ?? [],
  raw_milk_intake: role.raw_milk_intake ?? [],
  standarizing: role.standarizing ?? [],
  pasteurizing: role.pasteurizing ?? [],
  filmatic_1: role.filmatic_1 ?? [],
  process_log: role.process_log ?? [],
  filmatic_2: role.filmatic_2 ?? [],
  palletizer: role.palletizer ?? [],
  incubation: role.incubation ?? [],
  qa_check_post_incubation: role.qa_check_post_incubation ?? [],
  qa_corrrective_measures: role.qa_corrrective_measures ?? [],
  dispatch: role.dispatch ?? [],
  views: role.views ?? [],
})

// Legacy alias kept for any remaining imports
export interface CreateRoleRequest extends ReturnType<typeof convertUserRoleToApiRequest> { }
export interface UpdateRoleRequest extends CreateRoleRequest { id: string }
