import type { ApiResponse, QualityTest, TableFilters, SortConfig } from "@/lib/types"

export const laboratoryApi = {
  async getTests(params: {
    filters?: TableFilters
    sort?: SortConfig
  }): Promise<ApiResponse<{ tests: QualityTest[]; pendingTests: QualityTest[] }>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockTests: QualityTest[] = [
      {
        id: "T-2024-001",
        batchId: "B-2024-1357",
        testType: "microbiological",
        parameters: [
          { name: "Total Plate Count", value: 1500, unit: "CFU/ml", specification: { max: 10000 }, status: "pass" },
          { name: "Coliform", value: 0, unit: "CFU/ml", specification: { max: 10 }, status: "pass" },
        ],
        result: "pass",
        testedBy: "Dr. Sarah Johnson",
        testedAt: "2024-01-01T10:30:00Z",
        approvedBy: "Dr. Michael Chen",
        approvedAt: "2024-01-01T14:00:00Z",
        notes: "All parameters within acceptable limits",
      },
      // Add more mock data as needed
    ]

    const pendingTests = mockTests.filter((test) => test.result === "pending")

    return {
      data: {
        tests: mockTests,
        pendingTests,
      },
      message: "Quality tests retrieved successfully",
      success: true,
      timestamp: new Date().toISOString(),
    }
  },
}
