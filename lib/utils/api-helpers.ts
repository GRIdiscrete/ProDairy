import { toast } from "sonner"

export const handleApiError = (error: unknown, defaultMessage = "An error occurred") => {
  const message = error instanceof Error ? error.message : defaultMessage
  toast.error(message)
  console.error("API Error:", error)
}

export const handleApiSuccess = (message: string) => {
  toast.success(message)
}

export const formatOperations = (operations: string[]) => {
  return operations.map(op => op.charAt(0).toUpperCase() + op.slice(1)).join(", ")
}

export const getOperationColor = (operation: string) => {
  switch (operation.toLowerCase()) {
    case "create": return "bg-green-100 text-green-800"
    case "read": return "bg-blue-100 text-blue-800"
    case "update": return "bg-yellow-100 text-yellow-800"
    case "delete": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}
