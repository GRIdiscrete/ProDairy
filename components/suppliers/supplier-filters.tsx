"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"
import type { SupplierFilters as SupplierFiltersType } from "@/lib/types"

interface SupplierFiltersProps {
  filters: SupplierFiltersType
  onFiltersChange: (filters: SupplierFiltersType) => void
}

export function SupplierFilters({ filters, onFiltersChange }: SupplierFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search suppliers..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}>
          <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(value) => onFiltersChange({ ...filters, category: value })}>
          <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="raw-milk">Raw Milk</SelectItem>
            <SelectItem value="packaging">Packaging</SelectItem>
            <SelectItem value="chemicals">Chemicals</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>

        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}
