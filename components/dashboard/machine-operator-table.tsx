"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Mock operator assignment data
const operatorData = [
  {
    id: "1357",
    operatorName: "Brooklyn Simmons",
    machine: "M/C 01",
    shift: "Day",
    fabric: "Single Jersey (140 GSM)",
  },
  {
    id: "1358",
    operatorName: "Dianne Russell",
    machine: "M/C 02",
    shift: "Day",
    fabric: "Rib (220 GSM)",
  },
  {
    id: "1359",
    operatorName: "Marvin McKinney",
    machine: "M/C 03",
    shift: "Day",
    fabric: "Interlock (180 GSM)",
  },
  {
    id: "1360",
    operatorName: "Cameron Williamson",
    machine: "M/C 04",
    shift: "Day",
    fabric: "Pique (240 GSM)",
  },
]

export function MachineOperatorTable() {
  return (
    <Card className="col-span-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Machine Assign by Operator</CardTitle>
          <div className="flex items-center space-x-4 mt-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search name..." className="w-48 pl-8" />
            </div>
            <Select defaultValue="warehouse-01">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warehouse-01">Warehouse 01</SelectItem>
                <SelectItem value="warehouse-02">Warehouse 02</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="floor-01">
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="floor-01">Floor 01</SelectItem>
                <SelectItem value="floor-02">Floor 02</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">View all</span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 text-sm font-medium text-muted-foreground">Id</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Operator Name</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Machine</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Shift</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Fabric</th>
              </tr>
            </thead>
            <tbody>
              {operatorData.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 text-sm">{item.id}</td>
                  <td className="py-3 text-sm font-medium">{item.operatorName}</td>
                  <td className="py-3 text-sm">{item.machine}</td>
                  <td className="py-3 text-sm">{item.shift}</td>
                  <td className="py-3 text-sm">{item.fabric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
