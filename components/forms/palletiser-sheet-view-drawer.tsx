"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Edit, Package, Clock, User, Building, AlertTriangle } from "lucide-react"
import { PalletiserSheet } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"

interface PalletiserSheetViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheet: PalletiserSheet | null
  onEdit?: () => void
}

export function PalletiserSheetViewDrawer({ 
  open, 
  onOpenChange, 
  sheet,
  onEdit
}: PalletiserSheetViewDrawerProps) {
  if (!sheet) return null

  const getVarianceStatus = (variance: number) => {
    if (variance > 0) return { status: "Over", color: "destructive" as const }
    if (variance < 0) return { status: "Under", color: "secondary" as const }
    return { status: "Normal", color: "default" as const }
  }

  const varianceInfo = getVarianceStatus(sheet.variance || 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Palletiser Sheet Details
          </SheetTitle>
          <SheetDescription>
            Complete information about the palletiser sheet record
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Pallet #{sheet.pallet_number}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Created on {sheet.created_at ? format(new Date(sheet.created_at), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {sheet.size}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Grade {sheet.grade}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pallet Number</p>
                  <p className="text-lg font-semibold">{sheet.pallet_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Size</p>
                  <p className="text-lg font-semibold">{sheet.size}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grade</p>
                  <p className="text-lg font-semibold">{sheet.grade}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shift</p>
                  <p className="text-lg font-semibold">{sheet.shift}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Machine & Operator Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Machine & Operator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Machine</p>
                  <p className="text-lg font-semibold">{sheet.machine}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Operator</p>
                  <p className="text-lg font-semibold">{sheet.operator_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                  <p className="text-lg font-semibold">{sheet.supervisor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-lg font-semibold">{sheet.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time In</p>
                  <p className="text-lg font-semibold">{sheet.time_in}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time Out</p>
                  <p className="text-lg font-semibold">{sheet.time_out}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Variance & Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Variance</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{sheet.variance}</p>
                    <Badge variant={varianceInfo.color} className="text-xs">
                      {varianceInfo.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reason for Variance</p>
                  <p className="text-sm">{sheet.reason_for_variance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Supervisor Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                <p className="text-lg font-semibold">{sheet.supervisor}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Supervisor Signature</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {sheet.supervisor_signature}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm">
                  {sheet.created_at ? format(new Date(sheet.created_at), 'PPP p') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-sm">
                  {sheet.updated_at ? format(new Date(sheet.updated_at), 'PPP p') : 'Never'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {onEdit && (
              <Button onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Sheet
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
