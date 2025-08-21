"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Package, Settings, Star, Gauge } from "lucide-react"

const qualityMetrics = [
  {
    title: "Product Availability",
    value: "90%",
    change: "+2.5%",
    icon: Package,
    color: "text-green-600",
  },
  {
    title: "M/C Performance",
    value: "96%",
    change: "+1.8%",
    icon: Settings,
    color: "text-blue-600",
  },
  {
    title: "Quality",
    value: "98.5%",
    change: "+1.2%",
    icon: Star,
    color: "text-yellow-600",
  },
  {
    title: "M/C Efficiency",
    value: "99%",
    change: "+1.5%",
    icon: Gauge,
    color: "text-red-600",
  },
]

export function QualityEfficiency() {
  return (
    <Card className="col-span-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quality & Efficiency</CardTitle>
        <Select defaultValue="may-2024">
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="may-2024">May, 2024</SelectItem>
            <SelectItem value="apr-2024">Apr, 2024</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-6">
          {qualityMetrics.map((metric) => (
            <div key={metric.title} className="text-center">
              <div
                className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 ${metric.color}`}
              >
                <metric.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground mb-1">{metric.title}</div>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                {metric.change}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
