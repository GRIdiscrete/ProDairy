"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FormData } from "./forms-dashboard"

export interface FormStatusMetrics {
  totalForms: number
  activeForms: number
  pendingForms: number
  completedForms: number
  errorForms: number
  completionRate: number
  averageProcessingTime: number
  operatorEfficiency: Record<string, number>
  dailyTrends: {
    date: string
    completed: number
    created: number
    errors: number
  }[]
}

interface FormStatusTrackerProps {
  forms: FormData[]
  className?: string
}

export function FormStatusTracker({ forms, className }: FormStatusTrackerProps) {
  const [metrics, setMetrics] = useState<FormStatusMetrics>({
    totalForms: 0,
    activeForms: 0,
    pendingForms: 0,
    completedForms: 0,
    errorForms: 0,
    completionRate: 0,
    averageProcessingTime: 0,
    operatorEfficiency: {},
    dailyTrends: []
  })

  useEffect(() => {
    calculateMetrics()
  }, [forms])

  const calculateMetrics = () => {
    const totalForms = forms.length
    const activeForms = forms.filter(f => f.status === "active").length
    const pendingForms = forms.filter(f => f.status === "pending").length
    const completedForms = forms.filter(f => f.status === "completed").length
    const errorForms = forms.filter(f => f.status === "error").length
    const completionRate = totalForms > 0 ? (completedForms / totalForms) * 100 : 0

    // Calculate average processing time
    const completedFormsWithTime = forms.filter(f => f.status === "completed")
    const totalProcessingTime = completedFormsWithTime.reduce((sum, form) => {
      const start = new Date(form.createdAt).getTime()
      const end = new Date(form.updatedAt).getTime()
      return sum + (end - start)
    }, 0)
    const averageProcessingTime = completedFormsWithTime.length > 0 
      ? totalProcessingTime / completedFormsWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0

    // Calculate operator efficiency
    const operatorStats = forms.reduce((acc, form) => {
      if (!acc[form.operator]) {
        acc[form.operator] = { total: 0, completed: 0 }
      }
      acc[form.operator].total++
      if (form.status === "completed") {
        acc[form.operator].completed++
      }
      return acc
    }, {} as Record<string, { total: number; completed: number }>)

    const operatorEfficiency = Object.entries(operatorStats).reduce((acc, [operator, stats]) => {
      acc[operator] = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
      return acc
    }, {} as Record<string, number>)

    // Calculate daily trends (last 7 days)
    const dailyTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayForms = forms.filter(form => 
        form.createdAt.startsWith(dateStr)
      )
      
      dailyTrends.push({
        date: dateStr,
        completed: dayForms.filter(f => f.status === "completed").length,
        created: dayForms.length,
        errors: dayForms.filter(f => f.status === "error").length
      })
    }

    setMetrics({
      totalForms,
      activeForms,
      pendingForms,
      completedForms,
      errorForms,
      completionRate,
      averageProcessingTime,
      operatorEfficiency,
      dailyTrends
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "active":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalForms}</div>
            <p className="text-xs text-muted-foreground">All forms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.activeForms}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completedForms}</div>
            <p className="text-xs text-muted-foreground">Finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.errorForms}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-2xl font-bold text-green-600">
                  {metrics.completionRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.completionRate} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="ml-2 font-medium">{metrics.completedForms}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-medium">{metrics.totalForms}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Time</span>
                <span className="text-2xl font-bold text-blue-600">
                  {metrics.averageProcessingTime.toFixed(1)}h
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Time from creation to completion
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Fastest:</span>
                  <span className="ml-2 font-medium">1.2h</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Slowest:</span>
                  <span className="ml-2 font-medium">4.8h</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operator Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle>Operator Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.operatorEfficiency).map(([operator, efficiency]) => (
              <div key={operator} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{operator}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32">
                    <Progress value={efficiency} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {efficiency.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Trends (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.dailyTrends.map((trend, index) => {
              const previousDay = index > 0 ? metrics.dailyTrends[index - 1] : null
              const completedChange = previousDay ? trend.completed - previousDay.completed : 0
              const createdChange = previousDay ? trend.created - previousDay.created : 0
              const errorsChange = previousDay ? trend.errors - previousDay.errors : 0

              return (
                <div key={trend.date} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">
                      {new Date(trend.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{trend.completed}</span>
                      {getTrendIcon(trend.completed, previousDay?.completed || 0)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{trend.created}</span>
                      {getTrendIcon(trend.created, previousDay?.created || 0)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{trend.errors}</span>
                      {getTrendIcon(trend.errors, previousDay?.errors || 0)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { status: "completed", count: metrics.completedForms, color: "bg-green-500" },
              { status: "active", count: metrics.activeForms, color: "bg-blue-500" },
              { status: "pending", count: metrics.pendingForms, color: "bg-yellow-500" },
              { status: "error", count: metrics.errorForms, color: "bg-red-500" }
            ].map(({ status, count, color }) => {
              const percentage = metrics.totalForms > 0 ? (count / metrics.totalForms) * 100 : 0
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <span className="text-sm font-medium capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
