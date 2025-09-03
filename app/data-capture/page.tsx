"use client"

import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, User, FlaskConical, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function DataCaptureDashboard() {
  return (
    <DataCaptureDashboardLayout title="Data Capture Dashboard" subtitle="Data collection and management">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forms Today</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
              <FlaskConical className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">15</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">Accuracy rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Data Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, type: "Production Data", status: "completed", time: "2 hours ago", operator: "John Doe" },
                  { id: 2, type: "Quality Check", status: "pending", time: "1 hour ago", operator: "Jane Smith" },
                  { id: 3, type: "Machine Reading", status: "completed", time: "30 min ago", operator: "Mike Johnson" },
                  { id: 4, type: "Lab Sample", status: "in-progress", time: "15 min ago", operator: "Sarah Wilson" },
                ].map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{entry.type}</p>
                        <p className="text-sm text-muted-foreground">{entry.operator} • {entry.time}</p>
                      </div>
                    </div>
                    <Badge variant={entry.status === "completed" ? "default" : entry.status === "in-progress" ? "secondary" : "outline"}>
                      {entry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <ClipboardList className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium">Data Capturer UI</h3>
                  <p className="text-sm text-muted-foreground">Main data entry interface</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <User className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium">Operator Forms</h3>
                  <p className="text-sm text-muted-foreground">Production operator forms</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <FlaskConical className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium">Lab Forms</h3>
                  <p className="text-sm text-muted-foreground">Laboratory test forms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Quality Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span>Data Quality Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Temperature Reading Out of Range</p>
                    <p className="text-sm text-yellow-700">Machine #3 - 2 hours ago</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  Review Required
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Lab Test Results Available</p>
                    <p className="text-sm text-blue-700">Sample #LT-2024-001 - 1 hour ago</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  New Results
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DataCaptureDashboardLayout>
  )
}
