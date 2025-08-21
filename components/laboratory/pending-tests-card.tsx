"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, AlertTriangle } from "lucide-react"

const pendingTests = [
  {
    id: "T-2024-001",
    batchNumber: "B-2024-1357",
    testType: "Microbiological",
    priority: "high",
    dueTime: "2 hours",
  },
  {
    id: "T-2024-002",
    batchNumber: "B-2024-1358",
    testType: "Chemical",
    priority: "medium",
    dueTime: "4 hours",
  },
  {
    id: "T-2024-003",
    batchNumber: "B-2024-1359",
    testType: "Physical",
    priority: "low",
    dueTime: "6 hours",
  },
]

export function PendingTestsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2 h-5 w-5 text-orange-600" />
          Pending Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingTests.map((test) => (
          <div key={test.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{test.id}</span>
                {test.priority === "high" && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
              <div className="text-xs text-muted-foreground">{test.batchNumber}</div>
              <Badge variant="outline" className="text-xs">
                {test.testType}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Due in</div>
              <div className="text-sm font-medium">{test.dueTime}</div>
            </div>
          </div>
        ))}
        <Button className="w-full" size="sm">
          View All Pending
        </Button>
      </CardContent>
    </Card>
  )
}
