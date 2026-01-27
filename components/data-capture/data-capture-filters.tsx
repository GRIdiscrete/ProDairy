"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, X, Search, Filter, Tag as TagIcon, User, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface DataCaptureFilterValues {
  tag?: string
  dateFrom?: Date
  dateTo?: Date
  userId?: string
  status?: string
  search?: string
}

interface DataCaptureFiltersProps {
  filters: DataCaptureFilterValues
  onFiltersChange: (filters: DataCaptureFilterValues) => void
  users?: Array<{ id: string; first_name: string; last_name: string; email: string }>
  statuses?: Array<{ value: string; label: string }>
  showStatusFilter?: boolean
  placeholder?: string
}

export function DataCaptureFilters({
  filters,
  onFiltersChange,
  users = [],
  statuses = [],
  showStatusFilter = false,
  placeholder = "Search by tag, ID, or any field..."
}: DataCaptureFiltersProps) {
  const [localFilters, setLocalFilters] = useState<DataCaptureFilterValues>(filters)

  const handleFilterChange = (key: keyof DataCaptureFilterValues, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilter = (key: keyof DataCaptureFilterValues) => {
    const newFilters = { ...localFilters }
    delete newFilters[key]
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearAll = () => {
    setLocalFilters({})
    onFiltersChange({})
  }

  const activeFilterCount = useMemo(() => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key as keyof DataCaptureFilterValues]
      return value !== undefined && value !== null && value !== ""
    }).length
  }, [localFilters])

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={localFilters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-10 pr-10"
        />
        {localFilters.search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => handleClearFilter("search")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span className="font-light">Filters:</span>
        </div>

        {/* Tag Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 border-dashed",
                localFilters.tag && "border-blue-500 bg-blue-50"
              )}
            >
              <TagIcon className="mr-2 h-3 w-3" />
              Tag
              {localFilters.tag && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  1
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-2">
              <div className="font-light text-sm">Filter by Tag</div>
              <Input
                placeholder="Enter tag or form ID..."
                value={localFilters.tag || ""}
                onChange={(e) => handleFilterChange("tag", e.target.value)}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 border-dashed",
                (localFilters.dateFrom || localFilters.dateTo) && "border-blue-500 bg-blue-50"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              Date
              {(localFilters.dateFrom || localFilters.dateTo) && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  {localFilters.dateFrom && localFilters.dateTo ? "2" : "1"}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="font-light text-sm">From Date</div>
                <Calendar
                  mode="single"
                  selected={localFilters.dateFrom}
                  onSelect={(date) => handleFilterChange("dateFrom", date)}
                  initialFocus
                />
              </div>
              <div className="space-y-2">
                <div className="font-light text-sm">To Date</div>
                <Calendar
                  mode="single"
                  selected={localFilters.dateTo}
                  onSelect={(date) => handleFilterChange("dateTo", date)}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* User/Operator Filter */}
        {users.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 border-dashed",
                  localFilters.userId && "border-blue-500 bg-blue-50"
                )}
              >
                <User className="mr-2 h-3 w-3" />
                User
                {localFilters.userId && (
                  <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-2">
                <div className="font-light text-sm">Filter by User/Operator</div>
                <Select
                  value={localFilters.userId || ""}
                  onValueChange={(value) => handleFilterChange("userId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Status Filter (optional) */}
        {showStatusFilter && statuses.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 border-dashed",
                  localFilters.status && "border-blue-500 bg-blue-50"
                )}
              >
                <Clock className="mr-2 h-3 w-3" />
                Status
                {localFilters.status && (
                  <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-2">
                <div className="font-light text-sm">Filter by Status</div>
                <Select
                  value={localFilters.status || ""}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear All Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 px-2 lg:px-3"
          >
            Clear All
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.tag && (
            <Badge variant="secondary" className="gap-1">
              <TagIcon className="h-3 w-3" />
              Tag: {localFilters.tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("tag")}
              />
            </Badge>
          )}
          {localFilters.dateFrom && (
            <Badge variant="secondary" className="gap-1">
              <CalendarIcon className="h-3 w-3" />
              From: {format(localFilters.dateFrom, "PP")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("dateFrom")}
              />
            </Badge>
          )}
          {localFilters.dateTo && (
            <Badge variant="secondary" className="gap-1">
              <CalendarIcon className="h-3 w-3" />
              To: {format(localFilters.dateTo, "PP")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("dateTo")}
              />
            </Badge>
          )}
          {localFilters.userId && (
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              User: {users.find(u => u.id === localFilters.userId)?.first_name || localFilters.userId}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("userId")}
              />
            </Badge>
          )}
          {localFilters.status && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              Status: {statuses.find(s => s.value === localFilters.status)?.label || localFilters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("status")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
