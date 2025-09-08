"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SterilisedMilkProcess, SterilisedMilkProcessDetails } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"

interface SterilisedMilkProcessViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process: SterilisedMilkProcess | null
  processDetails: SterilisedMilkProcessDetails[]
  onEdit?: () => void
}

export function SterilisedMilkProcessViewDrawer({ 
  open, 
  onOpenChange, 
  process,
  processDetails,
  onEdit
}: SterilisedMilkProcessViewDrawerProps) {
  if (!process) return null

  const getPersonName = (person: any) => {
    if (!person) return "Unknown"
    return `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email || "Unknown"
  }

  const getPersonDetails = (person: any) => {
    if (!person) return { name: "Unknown", email: "", department: "" }
    return {
      name: getPersonName(person),
      email: person.email || "",
      department: person.department || "",
      role: person.users_role_id_fkey?.role_name || ""
    }
  }

  const approvedBy = getPersonDetails(process.sterilised_milk_process_approved_by_fkey)
  const operator = getPersonDetails(process.sterilised_milk_process_operator_id_fkey)
  const supervisor = getPersonDetails(process.sterilised_milk_process_supervisor_id_fkey)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6">
        <SheetHeader>
          <SheetTitle>Sterilised Milk Process Details</SheetTitle>
          <SheetDescription>
            Complete information about the sterilised milk process and its parameters
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Process Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Process Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Process ID</label>
                  <p className="text-sm">{process.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">
                    {process.created_at ? format(new Date(process.created_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="text-sm">
                  {process.updated_at ? format(new Date(process.updated_at), "PPP 'at' p") : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personnel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personnel Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Approved By */}
              <div className="space-y-2">
                <h4 className="font-medium">Approved By</h4>
                <div className="pl-4 space-y-1">
                  <p className="text-sm"><span className="font-medium">Name:</span> {approvedBy.name}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {approvedBy.email}</p>
                  <p className="text-sm"><span className="font-medium">Department:</span> {approvedBy.department}</p>
                  {approvedBy.role && (
                    <p className="text-sm"><span className="font-medium">Role:</span> {approvedBy.role}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Operator */}
              <div className="space-y-2">
                <h4 className="font-medium">Operator</h4>
                <div className="pl-4 space-y-1">
                  <p className="text-sm"><span className="font-medium">Name:</span> {operator.name}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {operator.email}</p>
                  <p className="text-sm"><span className="font-medium">Department:</span> {operator.department}</p>
                  {operator.role && (
                    <p className="text-sm"><span className="font-medium">Role:</span> {operator.role}</p>
                  )}
                </div>
                <div className="pl-4 mt-2">
                  <p className="text-sm"><span className="font-medium">Signature:</span> {process.operator_signature}</p>
                </div>
              </div>

              <Separator />

              {/* Supervisor */}
              <div className="space-y-2">
                <h4 className="font-medium">Supervisor</h4>
                <div className="pl-4 space-y-1">
                  <p className="text-sm"><span className="font-medium">Name:</span> {supervisor.name}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {supervisor.email}</p>
                  <p className="text-sm"><span className="font-medium">Department:</span> {supervisor.department}</p>
                  {supervisor.role && (
                    <p className="text-sm"><span className="font-medium">Role:</span> {supervisor.role}</p>
                  )}
                </div>
                <div className="pl-4 mt-2">
                  <p className="text-sm"><span className="font-medium">Signature:</span> {process.supervisor_signature}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Details */}
          {processDetails && processDetails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Process Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {processDetails.map((detail, index) => (
                  <div key={detail.id || index} className="space-y-4">
                    {index > 0 && <Separator />}
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{detail.parameter_name}</h4>
                        <Badge variant="secondary">Batch #{detail.batch_number}</Badge>
                      </div>

                      {/* Filling Readings */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Filling Readings</h5>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm"><span className="font-medium">Start:</span> {detail.filling_start_reading}°C</p>
                          </div>
                        </div>
                      </div>

                      {/* Autoclave Readings */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Autoclave Readings</h5>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm"><span className="font-medium">Start:</span> {detail.autoclave_start_reading}°C</p>
                          </div>
                        </div>
                      </div>

                      {/* Heating Readings */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Heating Readings</h5>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm"><span className="font-medium">Start:</span> {detail.heating_start_reading}°C</p>
                          </div>
                          <div>
                            <p className="text-sm"><span className="font-medium">Finish:</span> {detail.heating_finish_reading}°C</p>
                          </div>
                        </div>
                      </div>

                      {/* Sterilization Readings */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Sterilization Readings</h5>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm"><span className="font-medium">Start:</span> {detail.sterilization_start_reading}°C</p>
                          </div>
                          <div>
                            <p className="text-sm"><span className="font-medium">After 5-6 min:</span> {detail.sterilisation_after_five_six_minutes_reading}°C</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm"><span className="font-medium">Finish:</span> {detail.sterilisation_finish_reading}°C</p>
                          </div>
                        </div>
                      </div>

                      {/* Precooling Readings */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Precooling Readings</h5>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm"><span className="font-medium">Start:</span> {detail.precooling_start_reading}°C</p>
                          </div>
                          <div>
                            <p className="text-sm"><span className="font-medium">Finish:</span> {detail.precooling_finish_reading}°C</p>
                          </div>
                        </div>
                      </div>

                      {/* Cooling One Readings */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Cooling One Readings</h5>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm"><span className="font-medium">Start:</span> {detail.cooling_one_start_reading}°C</p>
                          </div>
                          <div>
                            <p className="text-sm"><span className="font-medium">Finish:</span> {detail.cooling_one_finish_reading}°C</p>
                          </div>
                        </div>
                      </div>

                      {/* Cooling Two Readings */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Cooling Two Readings</h5>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm"><span className="font-medium">Start:</span> {detail.cooling_two_start_reading}°C</p>
                          </div>
                          <div>
                            <p className="text-sm"><span className="font-medium">Finish:</span> {detail.cooling_two_finish_reading}°C</p>
                          </div>
                        </div>
                      </div>

                      {/* Detail Metadata */}
                      <div className="pt-2 border-t">
                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <div>
                            <p><span className="font-medium">Created:</span> {detail.created_at ? format(new Date(detail.created_at), "PPP 'at' p") : "N/A"}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Updated:</span> {detail.updated_at ? format(new Date(detail.updated_at), "PPP 'at' p") : "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* No Process Details */}
          {(!processDetails || processDetails.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No process details available for this process.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
