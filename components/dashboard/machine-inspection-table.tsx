"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"

// Mock inspection data
const inspectionData = [
  {
    id: "1357",
    checkedBy: "Brooklyn Simmons",
    type: "Daily",
    date: "01 Jan, 2024",
    problems: "Missing parts",
  },
  {
    id: "1358",
    checkedBy: "Brooklyn Simmons",
    type: "Daily",
    date: "01 Jan, 2024",
    problems: "Missing parts",
  },
  {
    id: "1359",
    checkedBy: "Brooklyn Simmons",
    type: "Daily",
    date: "01 Jan, 2024",
    problems: "Missing parts",
  },
  {
    id: "1360",
    checkedBy: "Brooklyn Simmons",
    type: "Daily",
    date: "01 Jan, 2024",
    problems: "Missing parts",
  },
]

export function MachineInspectionTable() {
  return (
    <Card className="col-span-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Machine Inspection</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="w-64 pl-8" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 text-sm font-medium text-muted-foreground">Id</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Checked By</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">No. Problem</th>
              </tr>
            </thead>
            <tbody>
              {inspectionData.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 text-sm">{item.id}</td>
                  <td className="py-3 text-sm">{item.checkedBy}</td>
                  <td className="py-3">
                    <StatusBadge status={item.type.toLowerCase()} />
                  </td>
                  <td className="py-3 text-sm">{item.date}</td>
                  <td className="py-3 text-sm">{item.problems}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
