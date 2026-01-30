"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FilmaticLinesForm1 } from "@/lib/api/filmatic-lines-form-1"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Beaker, FileText, CheckCircle, Package, ArrowRight, Clock, Sun, Moon, Factory } from "lucide-react"
import { RootState, useAppSelector } from "@/lib/store"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { CopyButton } from "@/components/ui/copy-button"

interface FilmaticLinesForm1ViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: FilmaticLinesForm1 | null
  onEdit?: () => void
}

export function FilmaticLinesForm1ViewDrawer({
  open,
  onOpenChange,
  form,
  onEdit
}: FilmaticLinesForm1ViewDrawerProps) {
  // select users and bmt forms from store
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const { forms: bmtForms } = useAppSelector((state: RootState) => state.bmtControlForms)

  if (!form) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <SheetTitle className="text-lg font-light">Filmatic Lines Form 1</SheetTitle>
                <SheetDescription className="text-sm font-light">
                  Complete information about the Filmatic Lines Form 1 and its production data
                </SheetDescription>
              </div>
              <Badge className={`${form.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} font-medium px-3 py-1 rounded-full`}>
                {form.approved ? 'Approved' : 'Pending'}
              </Badge>
            </div>
            {onEdit && (
              <Button
                onClick={onEdit}

                size="sm"
                className=" bg-[#006BC4] text-white rounded-full"
              >
                Edit
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Process Overview */}
          <div className="mb-2 p-6  from-blue-50 to-cyan-50 rounded-lg">
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
                  <Factory className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Filmatic Lines Form 1</span>
                  <div className=" bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Palletizer</span>
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
                  <span className="text-xs font-light text-gray-500">Form</span>
                  <div className="mt-1">
                    {/* show form tag with FormIdCopy */}
                    {form.tag && form.id ? (
                      <FormIdCopy displayId={form.tag || "N/A"} actualId={form.tag || ""} size="sm" />
                    ) : (
                      <p className="text-sm font-light">{form.id || 'N/A'}</p>
                    )}
                  </div>
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
                  <span className="text-xs font-light text-gray-500">Process ID</span>
                  <p className="text-sm font-light">
                    {form.process_id ? `Process #${String(form.process_id).slice(0, 8)}` : "Not linked"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Date</span>
                  <p className="text-sm font-light">
                    {form.date ? format(new Date(form.date), "PPP") : "N/A"}
                  </p>
                </div>
              </div>

              {/* Bottles Summary */}
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Day — Opening / Closing / Waste</span>
                  <p className="text-sm font-light mt-1">
                    {form.day_shift_opening_bottles ?? '—'} / {form.day_shift_closing_bottles ?? '—'} / {form.day_shift_waste_bottles ?? '—'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Night — Opening / Closing / Waste</span>
                  <p className="text-sm font-light mt-1">
                    {form.night_shift_opening_bottles ?? '—'} / {form.night_shift_closing_bottles ?? '—'} / {form.night_shift_waste_bottles ?? '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BMT Form Details (separate card) */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Holding Tank (BMT) Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const bmt = bmtForms.find((b: any) => b.id === form.holding_tank_bmt)
                if (bmt) {
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">BMT Form</span>
                        {bmt.tag ? <FormIdCopy displayId={bmt.tag} actualId={bmt.tag} size="sm" /> : <p className="text-sm font-light">{bmt.id}</p>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Volume</span>
                        <span className="text-sm font-light">{bmt.volume ?? 0} L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Product</span>
                        <span className="text-sm font-light">{bmt.product || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Created</span>
                        <span className="text-sm font-light">{bmt.created_at ? format(new Date(bmt.created_at), "PPP") : 'N/A'}</span>
                      </div>
                    </>
                  )
                }
                return <p className="text-sm text-gray-500">No BMT details available</p>
              })()}
            </CardContent>
          </Card>

          {/* Groups Information */}
          {form.groups && (
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-light">Groups Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-light text-gray-500">Manager</span>
                    <div className="mt-1">
                      {(() => {
                        const managerUser = (form.groups && form.groups.manager_id) ? users.find((u: any) => u.id === form.groups?.manager_id) : null
                        return managerUser ? (
                          <UserAvatar user={managerUser} size="md" showName={true} showEmail={true} showDropdown={true} />
                        ) : (
                          <p className="text-sm font-light">{form.groups?.manager_id?.slice(0, 8) || 'N/A'}</p>
                        )
                      })()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-light text-gray-500">Groups ID</span>
                    <p className="text-sm font-light">{form.groups.id?.slice(0, 8) || 'N/A'}</p>
                  </div>
                </div>

                <Separator />

                {/* Group A */}
                {form.groups.group_a && form.groups.group_a.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Group A</h4>
                    <div className="pl-4">
                      <p className="text-sm font-light"><span className="font-medium">Members:</span> {form.groups.group_a.length}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.groups.group_a.slice(0, 8).map((memberId: string, index: number) => {
                          const user = users.find((u: any) => u.id === memberId)
                          return user ? (
                            <div key={index} className="flex items-center">
                              <UserAvatar user={user} size="md" showName={true} showEmail={false} showDropdown={true} />
                            </div>
                          ) : (
                            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{memberId.slice(0, 8)}</span>
                          )
                        })}
                        {form.groups.group_a.length > 8 && (
                          <span className="text-xs text-gray-500">+{form.groups.group_a.length - 8} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Group B */}
                {form.groups.group_b && form.groups.group_b.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Group B</h4>
                      <div className="pl-4">
                        <p className="text-sm font-light"><span className="font-medium">Members:</span> {form.groups.group_b.length}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {form.groups.group_b.slice(0, 8).map((memberId: string, index: number) => {
                            const user = users.find((u: any) => u.id === memberId)
                            return user ? (
                              <div key={index} className="flex items-center">
                                <UserAvatar user={user} size="md" showName={true} showEmail={false} showDropdown={true} />
                              </div>
                            ) : (
                              <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{memberId.slice(0, 8)}</span>
                            )
                          })}
                          {form.groups.group_b.length > 8 && (
                            <span className="text-xs text-gray-500">+{form.groups.group_b.length - 8} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Group C */}
                {form.groups.group_c && form.groups.group_c.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Group C</h4>
                      <div className="pl-4">
                        <p className="text-sm font-light"><span className="font-medium">Members:</span> {form.groups.group_c.length}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {form.groups.group_c.slice(0, 8).map((memberId: string, index: number) => {
                            const user = users.find((u: any) => u.id === memberId)
                            return user ? (
                              <div key={index} className="flex items-center">
                                <UserAvatar user={user} size="md" showName={true} showEmail={false} showDropdown={true} />
                              </div>
                            ) : (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{memberId.slice(0, 8)}</span>
                            )
                          })}
                          {form.groups.group_c.length > 8 && (
                            <span className="text-xs text-gray-500">+{form.groups.group_c.length - 8} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Day Shift Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Sun className="h-4 w-4 text-yellow-600" />
                </div>
                <CardTitle className="text-base font-light">Day Shift Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {form.day_shift_id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Shift Entry</h4>
                    <Badge className={form.day_shift_id.supervisor_approve ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {form.day_shift_id.supervisor_approve ? 'Supervisor Approved' : 'Pending Approval'}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Operator:</span>
                      {(() => {
                        const operatorUser = users.find((u: any) => u.id === form.day_shift_id?.operator_id)
                        return operatorUser ? (
                          <UserAvatar user={operatorUser} size="sm" showName={true} showDropdown={true} />
                        ) : (
                          <span className="text-sm font-light">{form.day_shift_id?.operator_id?.slice(0, 8) || 'N/A'}</span>
                        )
                      })()}
                    </div>

                    {form.day_shift_id.shift_details ? (
                      <div className="mt-3 space-y-3">
                        <h5 className="text-sm font-medium text-gray-700">Production Details</h5>
                        <div className="p-4  from-yellow-50 to-orange-50 rounded-lg space-y-3 border border-yellow-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-600">Time</span>
                              <p className="text-sm font-light">{form.day_shift_id.shift_details.time || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-600">Target</span>
                              <p className="text-sm font-light">{form.day_shift_id.shift_details.target ?? 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-600">Pallets Produced</span>
                              <p className="text-sm font-light">{form.day_shift_id.shift_details.pallets ?? 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-600">Setbacks</span>
                              <p className="text-sm font-light">{form.day_shift_id.shift_details.setbacks || 'None'}</p>
                            </div>
                          </div>

                          {form.day_shift_id.shift_details.stoppage_time_id && (
                            <div className="mt-3 pt-3 border-t border-yellow-300">
                              <p className="text-xs font-medium text-gray-700 mb-2">Stoppage Times</p>
                              <div className="p-3 bg-white rounded-md space-y-2">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Product 1</span>
                                    <p>{form.day_shift_id.shift_details.stoppage_time_id.product_1 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Product 2</span>
                                    <p>{form.day_shift_id.shift_details.stoppage_time_id.product_2 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Filler 1</span>
                                    <p>{form.day_shift_id.shift_details.stoppage_time_id.filler_1 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Filler 2</span>
                                    <p>{form.day_shift_id.shift_details.stoppage_time_id.filler_2 ?? '—'} min</p>
                                  </div>
                                </div>
                                {(form.day_shift_id.shift_details.stoppage_time_id.product_1_hours ||
                                  form.day_shift_id.shift_details.stoppage_time_id.product_2_hours ||
                                  form.day_shift_id.shift_details.stoppage_time_id.filler_1_hours ||
                                  form.day_shift_id.shift_details.stoppage_time_id.filler_2_hours) && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-2 border-t border-gray-200">
                                      <div className="space-y-1">
                                        <span className="font-medium text-gray-600">Product 1 Hours</span>
                                        <p>{form.day_shift_id.shift_details.stoppage_time_id.product_1_hours ?? '—'}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-medium text-gray-600">Product 2 Hours</span>
                                        <p>{form.day_shift_id.shift_details.stoppage_time_id.product_2_hours ?? '—'}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-medium text-gray-600">Filler 1 Hours</span>
                                        <p>{form.day_shift_id.shift_details.stoppage_time_id.filler_1_hours ?? '—'}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-medium text-gray-600">Filler 2 Hours</span>
                                        <p>{form.day_shift_id.shift_details.stoppage_time_id.filler_2_hours ?? '—'}</p>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No production details recorded</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No day shift data available</p>
              )}
            </CardContent>
          </Card>

          {/* Night Shift Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Moon className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Night Shift Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {form.night_shift_id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Shift Entry</h4>
                    <Badge className={form.night_shift_id.supervisor_approve ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {form.night_shift_id.supervisor_approve ? 'Supervisor Approved' : 'Pending Approval'}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Operator:</span>
                      {(() => {
                        const operatorUser = users.find((u: any) => u.id === form.night_shift_id?.operator_id)
                        return operatorUser ? (
                          <UserAvatar user={operatorUser} size="sm" showName={true} showDropdown={true} />
                        ) : (
                          <span className="text-sm font-light">{form.night_shift_id?.operator_id?.slice(0, 8) || 'N/A'}</span>
                        )
                      })()}
                    </div>

                    {form.night_shift_id.shift_details ? (
                      <div className="mt-3 space-y-3">
                        <h5 className="text-sm font-medium text-gray-700">Production Details</h5>
                        <div key={form.night_shift_id.shift_details.id} className="p-4  from-blue-50 to-indigo-50 rounded-lg space-y-3 border border-blue-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-600">Time</span>
                              <p className="text-sm font-light">{form.night_shift_id.shift_details.time || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-600">Target</span>
                              <p className="text-sm font-light">{form.night_shift_id.shift_details.target ?? 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-600">Pallets Produced</span>
                              <p className="text-sm font-light">{form.night_shift_id.shift_details.pallets ?? 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-600">Setbacks</span>
                              <p className="text-sm font-light">{form.night_shift_id.shift_details.setbacks || 'None'}</p>
                            </div>
                          </div>

                          {form.night_shift_id.shift_details.stoppage_time_id && (
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <p className="text-xs font-medium text-gray-700 mb-2">Stoppage Times</p>
                              <div className="p-3 bg-white rounded-md space-y-2">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Product 1</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.product_1 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Product 2</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.product_2 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Filler 1</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.filler_1 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Filler 2</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.filler_2 ?? '—'} min</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-2 border-t border-gray-200">
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Capper 1</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.capper_1 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Capper 2</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.capper_2 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Sleever 1</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.sleever_1 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Sleever 2</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.sleever_2 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Shrink 1</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.shrink_1 ?? '—'} min</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-gray-600">Shrink 2</span>
                                    <p>{form.night_shift_id.shift_details.stoppage_time_id.shrink_2 ?? '—'} min</p>
                                  </div>
                                </div>
                                {(form.night_shift_id.shift_details.stoppage_time_id.product_1_hours ||
                                  form.night_shift_id.shift_details.stoppage_time_id.product_2_hours ||
                                  form.night_shift_id.shift_details.stoppage_time_id.filler_1_hours ||
                                  form.night_shift_id.shift_details.stoppage_time_id.filler_2_hours) && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-2 border-t border-gray-200">
                                      <div className="space-y-1">
                                        <span className="font-medium text-gray-600">Product 1 Hours</span>
                                        <p>{form.night_shift_id.shift_details.stoppage_time_id.product_1_hours ?? '—'}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-medium text-gray-600">Product 2 Hours</span>
                                        <p>{form.night_shift_id.shift_details.stoppage_time_id.product_2_hours ?? '—'}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-medium text-gray-600">Filler 1 Hours</span>
                                        <p>{form.night_shift_id.shift_details.stoppage_time_id.filler_1_hours ?? '—'}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-medium text-gray-600">Filler 2 Hours</span>
                                        <p>{form.night_shift_id.shift_details.stoppage_time_id.filler_2_hours ?? '—'}</p>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No production details recorded</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No night shift data available</p>
              )}
            </CardContent>
          </Card>

          {/* Approval Status */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-base font-light">Approval Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light">Overall Status</span>
                <Badge className={form.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {form.approved ? 'Approved' : 'Pending Approval'}
                </Badge>
              </div>
            </CardContent>
          </Card>

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
                <Clock className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Latest Filmatic Lines Form 1</span>
              </div>
            </CardContent>
          </Card>

          {/* Bottle Statistics */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                <CardTitle className="text-base font-light">Bottle Statistics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Day Shift Bottles */}
              {(form.day_shift_opening_bottles != null || form.day_shift_closing_bottles != null || form.day_shift_waste_bottles != null) && (
                <div className="p-4  from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <h5 className="font-medium mb-3 text-gray-800">Day Shift Bottles</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Opening Bottles</p>
                      <p className="text-lg font-medium">{form.day_shift_opening_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Closing Bottles</p>
                      <p className="text-lg font-medium">{form.day_shift_closing_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Waste Bottles</p>
                      <p className="text-lg font-medium">{form.day_shift_waste_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Received Bottles</p>
                      <p className="text-lg font-medium">{form.day_shift_received_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Damaged Bottles</p>
                      <p className="text-lg font-medium">{form.day_shift_damaged_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Foiled Bottles</p>
                      <p className="text-lg font-medium">{form.day_shift_foiled_bottles ?? '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Night Shift Bottles */}
              {(form.night_shift_opening_bottles != null || form.night_shift_closing_bottles != null || form.night_shift_waste_bottles != null) && (
                <div className="p-4  from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium mb-3 text-gray-800">Night Shift Bottles</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Opening Bottles</p>
                      <p className="text-lg font-medium">{form.night_shift_opening_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Closing Bottles</p>
                      <p className="text-lg font-medium">{form.night_shift_closing_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Waste Bottles</p>
                      <p className="text-lg font-medium">{form.night_shift_waste_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Received Bottles</p>
                      <p className="text-lg font-medium">{form.night_shift_received_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Damaged Bottles</p>
                      <p className="text-lg font-medium">{form.night_shift_damaged_bottles ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Foiled Bottles</p>
                      <p className="text-lg font-medium">{form.night_shift_foiled_bottles ?? '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transferrable Milk */}
              {form.transferrable_milk != null && (
                <div className="p-4  from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Transferrable Milk</span>
                    <span className="text-xl font-medium text-green-700">{form.transferrable_milk} L</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
