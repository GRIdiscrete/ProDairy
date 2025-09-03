"use client"

import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Save, Plus, Trash2 } from "lucide-react"

export default function DataCapturerUIPage() {
  return (
    <DataCaptureDashboardLayout title="Data Capturer UI" subtitle="Main data entry interface">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Capturer UI</h1>
            <p className="text-muted-foreground">Enter and manage production data</p>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Data
          </Button>
        </div>

        {/* Data Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5" />
              <span>Production Data Entry</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6AM - 2PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (2PM - 10PM)</SelectItem>
                    <SelectItem value="night">Night (10PM - 6AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Operator</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="jane">Jane Smith</SelectItem>
                    <SelectItem value="mike">Mike Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Production Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Production Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Produced</Label>
                  <Input id="quantity" type="number" placeholder="Enter quantity" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input id="temperature" type="number" placeholder="Enter temperature" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pressure">Pressure (Bar)</Label>
                  <Input id="pressure" type="number" placeholder="Enter pressure" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flow-rate">Flow Rate (L/min)</Label>
                  <Input id="flow-rate" type="number" placeholder="Enter flow rate" />
                </div>
              </div>
            </div>

            {/* Quality Parameters */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quality Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ph">pH Level</Label>
                  <Input id="ph" type="number" step="0.1" placeholder="Enter pH" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat-content">Fat Content (%)</Label>
                  <Input id="fat-content" type="number" step="0.1" placeholder="Enter fat content" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein Content (%)</Label>
                  <Input id="protein" type="number" step="0.1" placeholder="Enter protein content" />
                </div>
              </div>
            </div>

            {/* Machine Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Machine Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="machine-id">Machine ID</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M001">Machine M001</SelectItem>
                      <SelectItem value="M002">Machine M002</SelectItem>
                      <SelectItem value="M003">Machine M003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="idle">Idle</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter any additional notes or observations..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Form
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Data Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "DE-001",
                  date: "2024-01-15",
                  shift: "Morning",
                  operator: "John Doe",
                  quantity: 150,
                  status: "completed"
                },
                {
                  id: "DE-002",
                  date: "2024-01-15",
                  shift: "Afternoon", 
                  operator: "Jane Smith",
                  quantity: 180,
                  status: "pending"
                },
                {
                  id: "DE-003",
                  date: "2024-01-14",
                  shift: "Night",
                  operator: "Mike Johnson", 
                  quantity: 120,
                  status: "completed"
                }
              ].map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{entry.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.date} • {entry.shift} • {entry.operator}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {entry.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {entry.status}
                    </span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DataCaptureDashboardLayout>
  )
}
