import { apiRequest } from "@/lib/utils/api-request"

export interface FilmaticLinesGroup {
  id: string
  created_at: string
  updated_at: string | null
  group_a: string[]
  group_b: string[]
  group_c: string[]
  manager_id: string
}

export interface FilmaticLinesGroupUpdateRequest {
  id: string
  group_a: string[]
  group_b: string[]
  group_c: string[]
  manager_id: string
}

export interface FilmaticLinesGroupCreateRequest {
  manager_id: string
}

export interface FilmaticLinesGroupDetail {
  id: string
  created_at: string
  updated_at: string | null
  filmatic_line_groups_id: string
  group_name: string
  operator_ids: string[]
}

export interface Envelope<T> { statusCode: number; message: string; data: T }

export const filmaticLinesGroupsApi = {
  getGroups: async () => apiRequest<Envelope<FilmaticLinesGroup[]>>(`/filmatic-lines-group`, { method: "GET" }),
  updateGroup: async (id: string, body: FilmaticLinesGroupUpdateRequest) => apiRequest<Envelope<FilmaticLinesGroup>>(`/filmatic-lines-group/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }),
  createGroup: async (body: FilmaticLinesGroupCreateRequest) => apiRequest<Envelope<FilmaticLinesGroup>>(`/filmatic-lines-group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }),
  getDetails: async () => apiRequest<Envelope<FilmaticLinesGroupDetail[]>>(`/filmatic-lines-group-details`, { method: "GET" }),
  createDetails: async (body: Omit<FilmaticLinesGroupDetail, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => apiRequest<Envelope<FilmaticLinesGroupDetail>>(`/filmatic-lines-group-details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }),
}


