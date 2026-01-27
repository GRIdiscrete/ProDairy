"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Filter } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

export function ProductionReportFilters() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Report Type */}
          <Select defaultValue="production">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Production Report</SelectItem>
              <SelectItem value="stock">Stock Report</SelectItem>
              <SelectItem value="cost">Item Overall Cost</SelectItem>
              <SelectItem value="yield">Yield Report</SelectItem>
            </SelectContent>
          </Select>

          {/* Machine Filter */}
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Machines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              <SelectItem value="m01">M/C 01</SelectItem>
              <SelectItem value="m02">M/C 02</SelectItem>
              <SelectItem value="m03">M/C 03</SelectItem>
            </SelectContent>
          </Select>

          {/* Product Type Filter */}
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Product Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="single_jersey">Single Jersey</SelectItem>
              <SelectItem value="rib">Rib</SelectItem>
              <SelectItem value="interlock">Interlock</SelectItem>
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-auto">
            <Button  size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
            <Button  size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button size="sm">Generate Report</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
