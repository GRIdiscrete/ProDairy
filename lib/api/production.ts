import type { ApiResponse, PaginatedResponse, ProductionBatch, TableFilters, SortConfig } from "@/lib/types"

export const productionApi = {
  async getBatches(params: {
    filters?: TableFilters
    sort?: SortConfig
    page?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<ProductionBatch>>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockBatches: ProductionBatch[] = [
      {
        id: "1357",
        batchNumber: "B-2024-1357",
        productType: "Single Jersey",
        rawMaterialIds: ["rm1"],
        machineIds: ["m01"],
        targetQuantity: 1000,
        actualQuantity: 960,
        startTime: "2024-01-01T08:00:00Z",
        endTime: "2024-01-01T16:00:00Z",
        status: "completed",
        qualityTests: [],
        operatorId: "op1",
        supervisorId: "sup1",
      },
      {
        id: "1358",
        batchNumber: "B-2024-1358",
        productType: "Rib",
        rawMaterialIds: ["rm2"],
        machineIds: ["m02"],
        targetQuantity: 800,
        actualQuantity: 0,
        startTime: "2024-01-02T08:00:00Z",
        status: "in_progress",
        qualityTests: [],
        operatorId: "op2",
        supervisorId: "sup1",
      },
      // Add more mock data as needed
    ]

    // Apply filters
    let filteredBatches = mockBatches
    if (params.filters?.status) {
      filteredBatches = filteredBatches.filter((batch) => batch.status === params.filters?.status)
    }
    if (params.filters?.search) {
      filteredBatches = filteredBatches.filter((batch) =>
        batch.batchNumber.toLowerCase().includes(params.filters?.search?.toLowerCase() || ""),
      )
    }

    return {
      data: {
        data: filteredBatches,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: filteredBatches.length,
          totalPages: Math.ceil(filteredBatches.length / (params.limit || 10)),
        },
      },
      message: "Production batches retrieved successfully",
      success: true,
      timestamp: new Date().toISOString(),
    }
  },
}
