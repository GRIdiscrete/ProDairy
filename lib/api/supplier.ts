import type { ApiResponse, Supplier, RawMilkIntake, RawMaterial, TableFilters } from "@/lib/types"

const mockSuppliers: Supplier[] = [
  {
    id: "SUP001",
    name: "Fresh Valley Dairy Co.",
    code: "FVD001",
    category: "raw-milk",
    status: "active",
    contactInfo: {
      phone: "+1-555-0123",
      email: "contact@freshvalley.com",
      address: {
        street: "123 Dairy Lane",
        city: "Madison",
        state: "WI",
        zipCode: "53703",
        country: "USA",
      },
    },
    materials: ["raw-milk", "cream"],
    rating: 4.8,
    totalOrders: 156,
    performance: {
      onTimeDelivery: 96,
      qualityScore: 98,
    },
    contractDetails: {
      startDate: "2023-01-15",
      endDate: "2024-12-31",
      terms: "Net 30",
    },
  },
  {
    id: "SUP002",
    name: "Premium Packaging Solutions",
    code: "PPS002",
    category: "packaging",
    status: "active",
    contactInfo: {
      phone: "+1-555-0456",
      email: "sales@premiumpack.com",
      address: {
        street: "456 Industrial Blvd",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
      },
    },
    materials: ["bottles", "caps", "labels"],
    rating: 4.6,
    totalOrders: 89,
    performance: {
      onTimeDelivery: 94,
      qualityScore: 95,
    },
    contractDetails: {
      startDate: "2023-03-01",
      endDate: "2024-12-31",
      terms: "Net 15",
    },
  },
  {
    id: "SUP003",
    name: "BioClean Chemicals Ltd",
    code: "BCL003",
    category: "chemicals",
    status: "pending",
    contactInfo: {
      phone: "+1-555-0789",
      email: "info@bioclean.com",
      address: {
        street: "789 Chemical Way",
        city: "Houston",
        state: "TX",
        zipCode: "77001",
        country: "USA",
      },
    },
    materials: ["sanitizers", "cleaning-agents"],
    rating: 4.2,
    totalOrders: 23,
    performance: {
      onTimeDelivery: 88,
      qualityScore: 92,
    },
    contractDetails: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      terms: "Net 30",
    },
  },
]

const mockRawMaterials: RawMaterial[] = [
  {
    id: "RM001",
    name: "Whole Milk",
    code: "WM001",
    category: "raw-milk",
    currentStock: 15000,
    maxStock: 25000,
    reorderLevel: 5000,
    unit: "liters",
    unitPrice: 0.85,
    priceChange: 2.3,
    qualityScore: 98,
    primarySupplier: "Fresh Valley Dairy Co.",
    lastReceived: "2024-01-20T10:30:00Z",
    expiryDate: "2024-01-25T23:59:59Z",
  },
  {
    id: "RM002",
    name: "Glass Bottles (1L)",
    code: "GB001",
    category: "packaging",
    currentStock: 8500,
    maxStock: 15000,
    reorderLevel: 3000,
    unit: "pieces",
    unitPrice: 0.45,
    priceChange: -1.2,
    qualityScore: 96,
    primarySupplier: "Premium Packaging Solutions",
    lastReceived: "2024-01-18T14:15:00Z",
    expiryDate: "2026-01-18T23:59:59Z",
  },
  {
    id: "RM003",
    name: "Sanitizing Solution",
    code: "SS001",
    category: "chemicals",
    currentStock: 450,
    maxStock: 1000,
    reorderLevel: 200,
    unit: "liters",
    unitPrice: 12.5,
    priceChange: 0.8,
    qualityScore: 94,
    primarySupplier: "BioClean Chemicals Ltd",
    lastReceived: "2024-01-15T09:00:00Z",
    expiryDate: "2024-07-15T23:59:59Z",
  },
  {
    id: "RM004",
    name: "Cream (35% Fat)",
    code: "CR001",
    category: "raw-milk",
    currentStock: 2800,
    maxStock: 5000,
    reorderLevel: 1000,
    unit: "liters",
    unitPrice: 2.15,
    priceChange: 1.8,
    qualityScore: 97,
    primarySupplier: "Fresh Valley Dairy Co.",
    lastReceived: "2024-01-19T11:45:00Z",
    expiryDate: "2024-01-24T23:59:59Z",
  },
]

const mockIntakes: RawMilkIntake[] = [
  {
    id: "INT001",
    supplierId: "SUP001",
    supplierName: "Fresh Valley Dairy Co.",
    intakeDate: "2024-01-20T08:00:00Z",
    quantity: 5000,
    unit: "liters",
    qualityParameters: {
      fatContent: 3.8,
      proteinContent: 3.2,
      lactoseContent: 4.7,
      solidNonFat: 8.9,
      totalSolids: 12.7,
      acidity: 0.16,
      density: 1.032,
      temperature: 4.2,
    },
    testResults: {
      bacterialCount: 15000,
      somaticCellCount: 180000,
      antibioticTest: "negative",
      adulterationTest: "negative",
    },
    status: "approved",
    batchNumber: "B20240120001",
    receivedBy: "John Smith",
    approvedBy: "Dr. Sarah Johnson",
  },
]

export const supplierApi = {
  async getSuppliers(params: {
    filters?: TableFilters
  }): Promise<ApiResponse<{ suppliers: Supplier[]; intakes: RawMilkIntake[]; rawMaterials: RawMaterial[] }>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredSuppliers = mockSuppliers
    let filteredMaterials = mockRawMaterials

    if (params.filters?.search) {
      const searchTerm = params.filters.search.toLowerCase()
      filteredSuppliers = mockSuppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm) || supplier.code.toLowerCase().includes(searchTerm),
      )
      filteredMaterials = mockRawMaterials.filter(
        (material) =>
          material.name.toLowerCase().includes(searchTerm) || material.code.toLowerCase().includes(searchTerm),
      )
    }

    if (params.filters?.status && params.filters.status !== "all") {
      filteredSuppliers = filteredSuppliers.filter((supplier) => supplier.status === params.filters?.status)
    }

    if (params.filters?.category && params.filters.category !== "all") {
      filteredSuppliers = filteredSuppliers.filter((supplier) => supplier.category === params.filters?.category)
      filteredMaterials = filteredMaterials.filter((material) => material.category === params.filters?.category)
    }

    return {
      data: {
        suppliers: filteredSuppliers,
        intakes: mockIntakes,
        rawMaterials: filteredMaterials,
      },
      message: "Suppliers retrieved successfully",
      success: true,
      timestamp: new Date().toISOString(),
    }
  },
}
