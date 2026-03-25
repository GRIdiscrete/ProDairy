"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChartProps {
  title: string
  description?: string
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function AreaTrendChart({
  title,
  description,
  data,
  index,
  categories,
  colors = ["#3b82f6", "#10b981"],
  valueFormatter = (value: number) => `${value.toLocaleString()}L`,
  className,
}: ChartProps) {
  return (
    <Card className={cn("overflow-hidden border-border bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {categories.map((category, i) => (
                  <linearGradient key={category} id={`gradient-${category}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[i]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.4} />
              <XAxis
                dataKey={index}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickFormatter={valueFormatter}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border bg-background p-3 shadow-xl backdrop-blur-md">
                        <p className="mb-2 text-[10px] font-medium uppercase text-muted-foreground">{label}</p>
                        <div className="space-y-1.5">
                          {payload.map((entry: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <div className="flex flex-1 items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                                <span className="text-xs font-bold">{valueFormatter(entry.value)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              {categories.map((category, i) => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={colors[i]}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${category})`}
                  animationDuration={1500}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function ComparisonBarChart({
  title,
  description,
  data,
  index,
  categories,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  valueFormatter = (value: number) => `${value.toLocaleString()}L`,
  className,
}: ChartProps) {
  return (
    <Card className={cn("overflow-hidden border-border bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.4} />
              <XAxis
                dataKey={index}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickFormatter={valueFormatter}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border bg-background p-3 shadow-xl backdrop-blur-md">
                        <p className="mb-2 text-[10px] font-medium uppercase text-muted-foreground">{label}</p>
                        <div className="space-y-1.5">
                          {payload.map((entry: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <div className="flex flex-1 items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                                <span className="text-xs font-bold">{valueFormatter(entry.value)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              {categories.map((category, i) => (
                <Bar
                  key={category}
                  dataKey={category}
                  fill={colors[i]}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  animationDuration={1500}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
