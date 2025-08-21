import type { ApiResponse, Machine, MachineInspection, TableFilters } from "@/lib/types"

export const machineApi = {
  async getMachines(params: {
    filters?: TableFilters
  }): Promise<ApiResponse<{ machines: Machine[]; inspections: MachineInspection[] }>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockMachines: Machine[] = [
      {
        id: "m01",
        name: "Pasteurizer Unit 1",
        code: "M/C 01",
        type: "pasteurizer",
        location: "Production Line A",
        floor: "Floor 01",
        warehouse: "Warehouse 01",
        status: "running",
        operator: "John Smith",
        temperature: 85,
        pressure: 2.5,
        speed: 1200,
        efficiency: 96,
        lastMaintenance: "2024-01-01T00:00:00Z",
        nextMaintenance: "2024-02-01T00:00:00Z",
        specifications: {
          capacity: 5000,
          powerConsumption: 150,
          operatingTemperature: { min: 80, max: 90 },
          operatingPressure: { min: 2.0, max: 3.0 },
        },
      },
      // Add more mock machines as needed
    ]

    const mockInspections: MachineInspection[] = [
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
      // Add more mock inspections as needed
    ]

    return {
      data: {
        machines: mockMachines,
        inspections: mockInspections,
      },
      message: "Machines retrieved successfully",
      success: true,
      timestamp: new Date().toISOString(),
    }
  },
}
