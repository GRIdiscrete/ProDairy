import { apiRequest } from "@/lib/utils/api-request"

export interface Tanker {
  id: string
  created_at: string
  updated_at: string | null
  driver_id: string
  reg_number: string
  capacity: number
  condition: string
  age: number
  mileage: number
  tanker_driver_id_fkey?: any
}

export interface TankerCreateRequest {
  driver_id: string
  reg_number: string
  capacity: number
  condition: string
  age: number
  mileage: number,
  compartments:number
}

export interface TankerResponse {
  statusCode: number
  message: string
  data: Tanker
}

export interface TankersResponse {
  statusCode: number
  message: string
  data: Tanker[]
}

export const tankerApi = {
  getAll: async () => {
    return apiRequest<TankersResponse>(`/tanker`, { method: "GET" })
  },
  getById: async (id: string) => {
    return apiRequest<TankerResponse>(`/tanker/${id}`, { method: "GET" })
  },
  create: async (body: TankerCreateRequest) => {
    return apiRequest<TankerResponse>(`/tanker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  },
  update: async (id: string, body: Partial<TankerCreateRequest>) => {
    return apiRequest<TankerResponse>(`/tanker`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    })
  },
  delete: async (id: string) => {
    return apiRequest(`/tanker/${id}`, { method: "DELETE" })
  },
}


