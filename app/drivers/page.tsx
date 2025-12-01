"use client"

import { DriversDashboardLayout } from "@/components/layout/drivers-dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Truck, FileText, Wrench, Clock, MapPin, Package, Activity, CheckCircle } from "lucide-react"

export default function DriversDashboard() {
  return (
    <DriversDashboardLayout title="Drivers Dashboard" subtitle="Driver management and tools">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Active Deliveries</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-blue-600">12</div>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Completed Today</h3>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-green-600">8</div>
            <p className="text-xs text-gray-500 mt-1">Deliveries</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Pending Forms</h3>
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-yellow-600">3</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Total Distance</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-blue-600">245</div>
            <p className="text-xs text-gray-500 mt-1">km today</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-light">Recent Deliveries</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { id: 1, location: "Harare Central", status: "completed", time: "2 hours ago", items: 15 },
                  { id: 2, location: "Bulawayo Depot", status: "in-progress", time: "1 hour ago", items: 8 },
                  { id: 3, location: "Gweru Station", status: "pending", time: "30 min ago", items: 12 },
                ].map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-light">{delivery.location}</p>
                        <p className="text-sm text-gray-500">{delivery.items} items • {delivery.time}</p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        delivery.status === "completed" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : delivery.status === "in-progress" 
                          ? "bg-blue-100 text-blue-800 border-blue-200" 
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }
                    >
                      {delivery.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-light">Quick Actions</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-light mb-1">Driver Forms</h3>
                  <p className="text-sm text-gray-500">Submit delivery forms</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-3">
                    <Wrench className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-light mb-1">Driver Tools</h3>
                  <p className="text-sm text-gray-500">Access utilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DriversDashboardLayout>
  )
}
