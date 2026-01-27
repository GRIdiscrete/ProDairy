"use client"

import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, Save, Plus, FileText, Clock, CheckCircle } from "lucide-react"

export default function LabFormsPage() {
  return (
    <DataCaptureDashboardLayout title="Lab Forms" subtitle="Laboratory test forms and sample management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lab Forms</h1>
            <p className="text-muted-foreground">Laboratory test forms and sample management</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Test
          </Button>
        </div>

        {/* Lab Test Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FlaskConical className="h-5 w-5" />
              <span>Laboratory Test Form</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sample Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sample Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sample-id">Sample ID</Label>
                  <Input id="sample-id" placeholder="Enter sample ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sample-type">Sample Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sample type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw-milk">Raw Milk</SelectItem>
                      <SelectItem value="pasteurized-milk">Pasteurized Milk</SelectItem>
                      <SelectItem value="yogurt">Yogurt</SelectItem>
                      <SelectItem value="cheese">Cheese</SelectItem>
                      <SelectItem value="butter">Butter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collection-date">Collection Date</Label>
                  <Input id="collection-date" type="date" />
                </div>
              </div>
            </div>

            {/* Test Parameters */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ph-level">pH Level</Label>
                  <Input id="ph-level" type="number" step="0.1" placeholder="Enter pH" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat-content">Fat Content (%)</Label>
                  <Input id="fat-content" type="number" step="0.1" placeholder="Enter fat content" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein-content">Protein Content (%)</Label>
                  <Input id="protein-content" type="number" step="0.1" placeholder="Enter protein content" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lactose-content">Lactose Content (%)</Label>
                  <Input id="lactose-content" type="number" step="0.1" placeholder="Enter lactose content" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solids-content">Total Solids (%)</Label>
                  <Input id="solids-content" type="number" step="0.1" placeholder="Enter total solids" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moisture-content">Moisture Content (%)</Label>
                  <Input id="moisture-content" type="number" step="0.1" placeholder="Enter moisture content" />
                </div>
              </div>
            </div>

            {/* Microbiological Tests */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Microbiological Tests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total-plate-count">Total Plate Count (CFU/ml)</Label>
                  <Input id="total-plate-count" type="number" placeholder="Enter count" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coliform-count">Coliform Count (CFU/ml)</Label>
                  <Input id="coliform-count" type="number" placeholder="Enter count" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-coli">E. Coli (CFU/ml)</Label>
                  <Input id="e-coli" type="number" placeholder="Enter count" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yeast-mold">Yeast & Mold (CFU/ml)</Label>
                  <Input id="yeast-mold" type="number" placeholder="Enter count" />
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-status">Test Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-date">Test Date</Label>
                  <Input id="test-date" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-notes">Test Notes</Label>
                <Textarea 
                  id="test-notes" 
                  placeholder="Enter any notes about the test results..."
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button >
                Save Draft
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Submit Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Lab Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Lab Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "LT-001",
                  sampleType: "Raw Milk",
                  testDate: "2024-01-15",
                  status: "completed",
                  ph: 6.7,
                  fatContent: 3.2,
                  proteinContent: 3.1
                },
                {
                  id: "LT-002",
                  sampleType: "Pasteurized Milk",
                  testDate: "2024-01-14",
                  status: "in-progress",
                  ph: null,
                  fatContent: null,
                  proteinContent: null
                },
                {
                  id: "LT-003",
                  sampleType: "Yogurt",
                  testDate: "2024-01-13",
                  status: "completed",
                  ph: 4.2,
                  fatContent: 2.8,
                  proteinContent: 4.5
                }
              ].map((test) => (
                <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{test.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.sampleType} • {test.testDate}
                      </p>
                      {test.status === "completed" && (
                        <div className="flex space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground">pH: {test.ph}</span>
                          <span className="text-xs text-muted-foreground">Fat: {test.fatContent}%</span>
                          <span className="text-xs text-muted-foreground">Protein: {test.proteinContent}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      test.status === "completed" ? "default" : 
                      test.status === "in-progress" ? "secondary" : 
                      "destructive"
                    }>
                      {test.status}
                    </Badge>
                    <Button  size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lab Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Today</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">5</div>
              <p className="text-xs text-muted-foreground">Pending results</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">96%</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Turnaround</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">2.4</div>
              <p className="text-xs text-muted-foreground">hours</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DataCaptureDashboardLayout>
  )
}
