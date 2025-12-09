"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, Filter, Download, Plus } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { setFilters, fetchProductionBatches } from "@/lib/store/slices/productionSlice"
import { ProductionPlanFormDrawer } from "@/components/forms/production-plan-form-drawer"

export function ProductionFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.production.filters)
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [planDrawerOpen, setPlanDrawerOpen] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    dispatch(setFilters(newFilters))
    dispatch(fetchProductionBatches({ filters: newFilters }))
  }

  const handleDateRangeChange = () => {
    if (dateFrom && dateTo) {
      const newFilters = {
        ...filters,
        dateRange: {
          from: format(dateFrom, "yyyy-MM-dd"),
          to: format(dateTo, "yyyy-MM-dd"),
        },
      }
      dispatch(setFilters(newFilters))
      dispatch(fetchProductionBatches({ filters: newFilters }))
    }
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search batches..."
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
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Product Type Filter */}
            <Select
              value={filters.productType || "all"}
              onValueChange={(value) => handleFilterChange("productType", value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Product Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="single_jersey">Single Jersey</SelectItem>
                <SelectItem value="rib">Rib</SelectItem>
                <SelectItem value="interlock">Interlock</SelectItem>
                <SelectItem value="pique">Pique</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button  className="w-[120px] justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button  className="w-[120px] justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "MMM dd") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
              <Button  onClick={handleDateRangeChange}>
                Apply
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-auto">
              <Button  size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
              <Button  size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" onClick={() => setPlanDrawerOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ProductionPlanFormDrawer component */}
      <ProductionPlanFormDrawer open={planDrawerOpen} onOpenChange={setPlanDrawerOpen} mode="create" />
    </>
  )
}
