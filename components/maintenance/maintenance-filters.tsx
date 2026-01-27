"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Plus } from "lucide-react"

export function MaintenanceFilters() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search maintenance tasks..." className="pl-9" />
          </div>

          {/* Priority Filter */}
          <Select>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          {/* Machine Filter */}
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              <SelectItem value="m01">M/C 01</SelectItem>
              <SelectItem value="m02">M/C 02</SelectItem>
              <SelectItem value="m03">M/C 03</SelectItem>
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
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Task
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
