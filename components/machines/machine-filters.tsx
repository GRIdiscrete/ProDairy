"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Plus, Settings } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { setFilters, fetchMachines } from "@/lib/store/slices/machineSlice"

export function MachineFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.machine.filters)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    dispatch(setFilters(newFilters))
    dispatch(fetchMachines({ filters: newFilters }))
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search machines..."
              className="pl-9"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="fault">Fault</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          {/* Machine Type Filter */}
          <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Machine Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pasteurizer">Pasteurizer</SelectItem>
              <SelectItem value="homogenizer">Homogenizer</SelectItem>
              <SelectItem value="separator">Separator</SelectItem>
              <SelectItem value="filler">Filler</SelectItem>
              <SelectItem value="packaging">Packaging</SelectItem>
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select value={filters.location || "all"} onValueChange={(value) => handleFilterChange("location", value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="floor-01">Floor 01</SelectItem>
              <SelectItem value="floor-02">Floor 02</SelectItem>
              <SelectItem value="warehouse-01">Warehouse 01</SelectItem>
              <SelectItem value="warehouse-02">Warehouse 02</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-auto">
            <Button  size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced
            </Button>
            <Button  size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button  size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Bulk Actions
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Machine
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
