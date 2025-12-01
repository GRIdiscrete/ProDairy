"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PasteurizingForm } from "@/lib/api/pasteurizing"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Beaker, FileText, User, Package, ArrowRight, Clock, FlaskConical, Factory, TrendingUp, Droplets, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "../ui/form-id-copy"
import { RootState, useAppSelector } from "@/lib/store"

interface PasteurizingFormViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: PasteurizingForm | null
  onEdit?: () => void
}

export function PasteurizingFormViewDrawer({
  open,
  onOpenChange,
  form,
  onEdit
}: PasteurizingFormViewDrawerProps) {
  const { forms: bmtForms } = useAppSelector((state: RootState) => state.bmtControlForms)
  const { machines } = useAppSelector((state) => state.machine)
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const [machineOpen, setMachineOpen] = useState(false)

  const getBMTFormById = (bmtId: string) => {
    return bmtForms.find((form: any) => form.id === bmtId)
  }
  if (!form) return null

  const getMachineById = (machineId: string) => {
    return machines.find((machine: any) => machine.id === machineId)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <SheetTitle className="text-lg font-light">Pasteurizing Form</SheetTitle>
                <SheetDescription className="text-sm font-light">
                  Complete information about the pasteurizing form and its production data
                </SheetDescription>
              </div>
            </div>
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
              >
                Edit
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Process Overview */}
          <div className="mb-2 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-light">Standardizing</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Pasteurizing</span>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Factory className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Filmatic Lines</span>
              </div>
            </div>
          </div>

          {/* Form Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Form Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Form ID</span>
                  <FormIdCopy
                    displayId={form?.tag}
                    actualId={form.id}
                    size="sm"
                  />
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Created At</span>
                  <p className="text-sm font-light">
                    {form.created_at ? format(new Date(form.created_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Updated At</span>
                  <p className="text-sm font-light">
                    {form.updated_at ? format(new Date(form.updated_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Date</span>
                  <p className="text-sm font-light">
                    {form.date ? format(new Date(form.date), "PPP") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Operator</span>
                  {(() => {
                    const operatorUser = users.find((u: any) => u.id === form.operator)
                    return operatorUser ? (
                      <UserAvatar
                        user={operatorUser}
                        size="md"
                        showName={true}
                        showEmail={true}
                        showDropdown={true}
                      />
                    ) : (
                      <p className="text-sm font-light">{form.operator?.slice(0, 8) || 'N/A'}</p>
                    )
                  })()}
                </div>

                <div>
                  <span className="text-xs font-light text-gray-500">Machine</span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-light">
                      {(() => {
                        const machine = machines.find((m:any) => m.id === form.machine)
                        return machine ? machine.name : (form.machine?.slice(0,8) || 'N/A')
                      })()}
                    </p>
                    <button type="button" onClick={() => setMachineOpen(v => !v)} className="p-1 rounded-full hover:bg-gray-100">
                      {machineOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                  {machineOpen && (() => {
                    const m = machines.find((m:any) => m.id === form.machine)
                    if (!m) return null
                    return (
                      <div className="mt-2 p-3 border rounded bg-gray-50 text-sm">
                        <div><strong>Name:</strong> {m.name}</div>
                        <div><strong>Category:</strong> {m.category || "N/A"}</div>
                        <div><strong>Location:</strong> {m.location || "N/A"}</div>
                        <div><strong>Status:</strong> {m.status}</div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Cream Index</span>
                  <p className="text-sm font-light">{form.cream_index}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Fat Content</span>
                  <p className="text-sm font-light">{form.fat}%</p>
                </div>
              </div>


            </CardContent>
          </Card>

          {form.bmt && (() => {
            const bmtForm = getBMTFormById(form.bmt)
            return bmtForm ? (
              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-light">BMT Form Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">BMT Form ID</span>
                    <FormIdCopy
                      displayId={bmtForm?.tag}
                      actualId={form.bmt_id}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Volume</span>
                    <span className="text-sm font-light">{bmtForm.volume}L</span>
                  </div>
                  {/* <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Product</span>
                                <span className="text-sm font-light text-blue-600">{bmtForm.product}</span>
                              </div> */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">BMT Created</span>
                    <span className="text-sm font-light">
                      {new Date(bmtForm.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : null
          })()}


          {/* Time Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-base font-light">Time Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Preheating Start</span>
                  <p className="text-sm font-light">{form.preheating_start}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Water Circulation</span>
                  <p className="text-sm font-light">{form.water_circulation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Production Start</span>
                  <p className="text-sm font-light">{form.production_start}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Production End</span>
                  <p className="text-sm font-light">
                    {form.production_end ? format(new Date(form.production_end), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Machine Start</span>
                  <p className="text-sm font-light">
                    {form.machine_start ? format(new Date(form.machine_start), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Machine End</span>
                  <p className="text-sm font-light">
                    {form.machine_end ? format(new Date(form.machine_end), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Production Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {form.steri_milk_pasteurizing_form_production && form.steri_milk_pasteurizing_form_production.length > 0 ? (
                form.steri_milk_pasteurizing_form_production.map((production, index) => (
                  <div key={production.id || index} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Production Entry #{index + 1}</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        {production.time}
                      </Badge>
                    </div>
                    <div className="pl-4 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-light text-gray-500">Process ID</span>
                          <p className="text-sm font-light">{production.process_id?.slice(0, 8) || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-light text-gray-500">Output Target</span>
                          <p className="text-sm font-light">{production.output_target_value} {production.ouput_target_units}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Temperature Data:</h5>
                        <div className="bg-gray-50 p-3 rounded text-xs">
                          <div className="grid grid-cols-3 gap-2">
                            <span><strong>Hot Water:</strong> {production.temp_hot_water}°C</span>
                            <span><strong>Product Out:</strong> {production.temp_product_out}°C</span>
                            <span><strong>Pasteurisation:</strong> {production.temp_product_pasteurisation}°C</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Pressure Data:</h5>
                        <div className="bg-gray-50 p-3 rounded text-xs">
                          <div className="grid grid-cols-3 gap-2">
                            <span><strong>Stage 1:</strong> {production.homogenisation_pressure_stage_1}</span>
                            <span><strong>Stage 2:</strong> {production.homogenisation_pressure_stage_2}</span>
                            <span><strong>Total:</strong> {production.total_homogenisation_pressure}</span>
                          </div>
                        </div>
                      </div>

                      {production.created_at && (
                        <div className="mt-2">
                          <span className="text-xs font-light text-gray-500">Created:</span>
                          <p className="text-xs font-light">{format(new Date(production.created_at), "PPP 'at' p")}</p>
                        </div>
                      )}
                    </div>
                    {index < form.steri_milk_pasteurizing_form_production.length - 1 && <Separator />}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No production data available</p>
              )}
            </CardContent>
          </Card>

          {/* Related Data Information */}
          {(form.steri_milk_pasteurizing_form_machine_fkey || form.steri_milk_pasteurizing_form_bmt_fkey) && (
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-orange-600" />
                  </div>
                  <CardTitle className="text-base font-light">Related Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Machine Information */}
                {form.steri_milk_pasteurizing_form_machine_fkey && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Machine Details</h4>
                    <div className="pl-4 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-light text-gray-500">Name</span>
                          <p className="text-sm font-light">{form.steri_milk_pasteurizing_form_machine_fkey.name}</p>
                        </div>
                        <div>
                          <span className="text-xs font-light text-gray-500">Status</span>
                          <Badge className={form.steri_milk_pasteurizing_form_machine_fkey.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {form.steri_milk_pasteurizing_form_machine_fkey.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-light text-gray-500">Category</span>
                          <p className="text-sm font-light">{form.steri_milk_pasteurizing_form_machine_fkey.category}</p>
                        </div>
                        <div>
                          <span className="text-xs font-light text-gray-500">Location</span>
                          <p className="text-sm font-light">{form.steri_milk_pasteurizing_form_machine_fkey.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BMT Information */}
                {form.steri_milk_pasteurizing_form_bmt_fkey && (
                  <>
                    {form.steri_milk_pasteurizing_form_machine_fkey && <Separator />}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">BMT Form Details</h4>
                      <div className="pl-4 space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-light text-gray-500">Volume</span>
                            <p className="text-sm font-light">{form.steri_milk_pasteurizing_form_bmt_fkey.volume} L</p>
                          </div>
                          <div>
                            <span className="text-xs font-light text-gray-500">Product</span>
                            <p className="text-sm font-light">{form.steri_milk_pasteurizing_form_bmt_fkey.product || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-light text-gray-500">Source Silo</span>
                            <p className="text-sm font-light">{form.steri_milk_pasteurizing_form_bmt_fkey.source_silo_id?.slice(0, 8) || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-xs font-light text-gray-500">Destination Silo</span>
                            <p className="text-sm font-light">{form.steri_milk_pasteurizing_form_bmt_fkey.destination_silo_id?.slice(0, 8) || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Form Metadata */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p><span className="font-medium">Created:</span> {form.created_at ? format(new Date(form.created_at), "PPP 'at' p") : "N/A"}</p>
                </div>
                <div>
                  <p><span className="font-medium">Updated:</span> {form.updated_at ? format(new Date(form.updated_at), "PPP 'at' p") : "N/A"}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <FlaskConical className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">Latest Pasteurizing Form</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
