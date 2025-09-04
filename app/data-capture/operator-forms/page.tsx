"use client"

import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Save, Plus, CheckCircle } from "lucide-react"

export default function OperatorFormsPage() {
  return (
    <DataCaptureDashboardLayout title="Operator Forms" subtitle="Production operator data entry forms">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Operator Forms</h1>
            <p className="text-muted-foreground">Production operator data entry and reporting</p>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Submit Form
          </Button>
        </div>

        {/* Operator Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Operator Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operator-name">Operator Name</Label>
                <Input id="operator-name" placeholder="Enter operator name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-id">Employee ID</Label>
                <Input id="employee-id" placeholder="Enter employee ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="quality">Quality Control</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pre-Shift Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-Shift Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                "Equipment is clean and sanitized",
                "All safety equipment is in place",
                "Temperature controls are functioning",
                "Raw materials are available",
                "Production schedule is reviewed",
                "Quality standards are understood"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox id={`checklist-${index}`} />
                  <Label htmlFor={`checklist-${index}`} className="text-sm">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Production Data */}
        <Card>
          <CardHeader>
            <CardTitle>Production Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Shift Start Time</Label>
                <Input id="start-time" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Shift End Time</Label>
                <Input id="end-time" type="time" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="units-produced">Units Produced</Label>
                <Input id="units-produced" type="number" placeholder="Enter units" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waste-amount">Waste Amount (kg)</Label>
                <Input id="waste-amount" type="number" step="0.1" placeholder="Enter waste" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downtime">Downtime (minutes)</Label>
                <Input id="downtime" type="number" placeholder="Enter downtime" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Checks */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visual-check">Visual Check</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="texture-check">Texture Check</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smell-check">Smell Check</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature-check">Temperature Check</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues and Observations */}
        <Card>
          <CardHeader>
            <CardTitle>Issues and Observations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issues">Issues Encountered</Label>
              <Textarea 
                id="issues" 
                placeholder="Describe any issues or problems encountered during the shift..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observations">General Observations</Label>
              <Textarea 
                id="observations" 
                placeholder="Enter any general observations or notes..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea 
                id="recommendations" 
                placeholder="Enter any recommendations for improvement..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Post-Shift Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Post-Shift Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                "Equipment is properly shut down",
                "Work area is cleaned and sanitized",
                "All tools are returned to storage",
                "Production data is recorded",
                "Quality samples are collected",
                "Handover notes are prepared"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox id={`post-checklist-${index}`} />
                  <Label htmlFor={`post-checklist-${index}`} className="text-sm">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline">
            Save Draft
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit Form
          </Button>
        </div>
      </div>
    </DataCaptureDashboardLayout>
  )
}
