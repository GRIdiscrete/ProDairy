"use client"

import { DriversDashboardLayout } from "@/components/layout/drivers-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, FileText, Wrench, Clock, MapPin, Package } from "lucide-react"

export default function DriversDashboard() {
  return (
    <DriversDashboardLayout title="Drivers Dashboard" subtitle="Driver management and tools">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Deliveries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Forms</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">km today</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, location: "Harare Central", status: "completed", time: "2 hours ago", items: 15 },
                  { id: 2, location: "Bulawayo Depot", status: "in-progress", time: "1 hour ago", items: 8 },
                  { id: 3, location: "Gweru Station", status: "pending", time: "30 min ago", items: 12 },
                ].map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{delivery.location}</p>
                        <p className="text-sm text-muted-foreground">{delivery.items} items • {delivery.time}</p>
                      </div>
                    </div>
                    <Badge variant={delivery.status === "completed" ? "default" : delivery.status === "in-progress" ? "secondary" : "outline"}>
                      {delivery.status}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium">Driver Forms</h3>
                  <p className="text-sm text-muted-foreground">Submit delivery forms</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <Wrench className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium">Driver Tools</h3>
                  <p className="text-sm text-muted-foreground">Access utilities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DriversDashboardLayout>
  )
}
