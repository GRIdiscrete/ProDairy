"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useAppSelector } from "@/lib/store"

const COLORS = {
  "Broken Machine": "#3b82f6", // blue
  "Missing Parts": "#f59e0b", // amber
  Service: "#ef4444", // red
}

export function DowntimeChart() {
  const downtimeChart = useAppSelector((state) => state.dashboard.downtimeChart)

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Downtimes By Cause</CardTitle>
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
        <div className="flex items-center justify-between h-[200px]">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={downtimeChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {downtimeChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.cause as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: COLORS[data.cause as keyof typeof COLORS] }}
                            />
                            <span className="font-medium">{data.cause}</span>
                            <span className="text-muted-foreground">: {data.count}</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 ml-4">
            {downtimeChart.map((item) => (
              <div key={item.cause} className="flex items-center space-x-2">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[item.cause as keyof typeof COLORS] }}
                />
                <span className="text-sm font-medium">{item.cause}</span>
                <span className="text-sm text-muted-foreground">- {item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
