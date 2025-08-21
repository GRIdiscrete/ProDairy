"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export function MaintenanceCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Mock maintenance events
  const maintenanceEvents = [
    { date: "2024-01-15", count: 2, priority: "high" },
    { date: "2024-01-20", count: 1, priority: "critical" },
    { date: "2024-01-25", count: 3, priority: "medium" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Maintenance Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Upcoming Tasks</h4>
          {maintenanceEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded border">
              <div className="text-xs">
                <div className="font-medium">{event.date}</div>
                <div className="text-muted-foreground">{event.count} tasks</div>
              </div>
              <Badge
                variant={
                  event.priority === "critical" ? "destructive" : event.priority === "high" ? "default" : "secondary"
                }
              >
                {event.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
