import type { ApiResponse, DashboardMetrics, ProductionBatch, MachineInspection } from "@/lib/types"

// Mock API service for dashboard data
export const dashboardApi = {
  async getMetrics(): Promise<
    ApiResponse<{
      metrics: DashboardMetrics
      productionChart: Array<{ month: string; production: number; cost: number }>
      downtimeChart: Array<{ cause: string; count: number; percentage: number }>
    }>
  > {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      data: {
        metrics: {
          production: {
            targetProduction: 72000,
            actualProduction: 62000,
            efficiency: 86.1,
            wastage: 160,
            downtime: 2.5,
            qualityRate: 98.5,
            machineUtilization: 90,
            costPerUnit: 13.5,
          },
          machines: {
            total: 80,
            running: 72,
            idle: 5,
            maintenance: 2,
            fault: 1,
          },
          quality: {
            passRate: 96,
            testsPending: 12,
            batchesApproved: 145,
            batchesRejected: 6,
          },
          efficiency: {
            overall: 99,
            byDepartment: {
              Production: 96,
              "Quality Control": 99,
              Packaging: 98.5,
              Maintenance: 95,
            },
          },
        },
        productionChart: [
          { month: "Jan", production: 50000, cost: 675000 },
          { month: "Feb", production: 55000, cost: 742500 },
          { month: "Mar", production: 48000, cost: 648000 },
          { month: "Apr", production: 62000, cost: 837000 },
          { month: "May", production: 58000, cost: 783000 },
          { month: "Jun", production: 65000, cost: 877500 },
          { month: "Jul", production: 62000, cost: 837000 },
        ],
        downtimeChart: [
          { cause: "Broken Machine", count: 5, percentage: 62.5 },
          { cause: "Missing Parts", count: 2, percentage: 25 },
          { cause: "Service", count: 1, percentage: 12.5 },
        ],
      },
      message: "Dashboard metrics retrieved successfully",
      success: true,
      timestamp: new Date().toISOString(),
    }
  },

  async getRecentBatches(): Promise<ApiResponse<ProductionBatch[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      data: [
        {
          id: "1357",
          batchNumber: "B-2024-1357",
          productType: "Single Jersey",
          rawMaterialIds: ["rm1", "rm2"],
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
      ],
      message: "Recent batches retrieved successfully",
      success: true,
      timestamp: new Date().toISOString(),
    }
  },

  async getRecentInspections(): Promise<ApiResponse<MachineInspection[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      data: [
        {
          id: "1357",
          machineId: "m01",
          inspectorId: "inspector1",
          type: "daily",
          checkedBy: "Brooklyn Simmons",
          date: "2024-01-01",
          problems: ["Missing parts"],
          status: "issues_found",
          notes: "Requires maintenance attention",
        },
      ],
      message: "Recent inspections retrieved successfully",
      success: true,
      timestamp: new Date().toISOString(),
    }
  },
}
