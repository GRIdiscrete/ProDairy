"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FilmaticLinesForm2 } from "@/lib/api/filmatic-lines-form-2"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Beaker, FileText, CheckCircle, Package, ArrowRight, Clock, Sun, Moon, Factory } from "lucide-react"
import { RootState, useAppSelector } from "@/lib/store"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { CopyButton } from "@/components/ui/copy-button"

interface FilmaticLinesForm2ViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: FilmaticLinesForm2 | null
  onEdit?: () => void
}

export function FilmaticLinesForm2ViewDrawer({ 
  open, 
  onOpenChange, 
  form,
  onEdit
}: FilmaticLinesForm2ViewDrawerProps) {
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
                <SheetTitle className="text-lg font-light">Filmatic Lines Form 2</SheetTitle>
                <SheetDescription className="text-sm font-light">
                  Complete information about the Filmatic Lines Form 2 and its production data
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
                  <span className="text-sm font-medium text-blue-600">Filmatic Lines Form 2</span>
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
                    {form.tag && form.id ? <FormIdCopy displayId={form.tag} actualId={form.id} size="sm" /> : <p className="text-sm font-light">{form.id || 'N/A'}</p>}
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
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <span className="text-xs font-light text-gray-500">Manager</span>
                    <div className="mt-1">
                      {(() => {
                        const managerUser = form.groups ? users.find((u:any) => u.id === form.groups?.manager_id) : null
                        return managerUser ? <UserAvatar user={managerUser} size="md" showName={true} showEmail={true} showDropdown={true} /> : <p className="text-sm font-light">{form.groups?.manager_id?.slice(0,8) || 'N/A'}</p>
                      })()}
                    </div>
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
                        {form.groups.group_a.slice(0, 8).map((memberId: string, idx: number) => {
                          const user = users.find((u:any) => u.id === memberId)
                          return user ? <div key={idx}><UserAvatar user={user} size="md" showName={true} showEmail={false} showDropdown={true} /></div> : <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{memberId.slice(0,8)}</span>
                        })}
                        {form.groups.group_a.length > 8 && <span className="text-xs text-gray-500">+{form.groups.group_a.length - 8} more</span>}
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
                        <div className="mt-2 flex flex-wrap gap-1">
                          {form.groups.group_b.slice(0, 3).map((member, index) => (
                            <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {member.slice(0, 8)}
                            </span>
                          ))}
                          {form.groups.group_b.length > 3 && (
                            <span className="text-xs text-gray-500">+{form.groups.group_b.length - 3} more</span>
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
                        <div className="mt-2 flex flex-wrap gap-1">
                          {form.groups.group_c.slice(0, 3).map((member, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {member.slice(0, 8)}
                            </span>
                          ))}
                          {form.groups.group_c.length > 3 && (
                            <span className="text-xs text-gray-500">+{form.groups.group_c.length - 3} more</span>
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
              {form.filmatic_line_form_2_day_shift && form.filmatic_line_form_2_day_shift.length > 0 ? (
                form.filmatic_line_form_2_day_shift.map((shift, shiftIndex) => (
                  <div key={shiftIndex} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Shift Entry #{shiftIndex + 1}</h4>
                      <Badge className={shift.supervisor_approve ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {shift.supervisor_approve ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="pl-4 space-y-2">
                      <p className="text-sm font-light"><span className="font-medium">Operator:</span> {(() => {
                        const op = users.find((u:any) => u.id === shift.operator_id)
                        return op ? <UserAvatar user={op} size="md" showName={true} showEmail={true} showDropdown={true} /> : (shift.operator_id ? shift.operator_id.slice(0,8) : 'N/A')
                      })()}</p>
                      <p className="text-sm font-light"><span className="font-medium">Details Count:</span> {shift.filmatic_line_form_2_day_shift_details?.length || 0}</p>
                      
                      {shift.filmatic_line_form_2_day_shift_details && shift.filmatic_line_form_2_day_shift_details.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Production Details:</h5>
                          <div className="space-y-2">
                            {shift.filmatic_line_form_2_day_shift_details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="bg-gray-50 p-3 rounded text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                  <span><strong>Time:</strong> {detail.time}</span>
                                  <span><strong>Target:</strong> {detail.target}</span>
                                  <span><strong>Pallets:</strong> {detail.pallets}</span>
                                  <span><strong>Setbacks:</strong> {detail.setbacks || 'None'}</span>
                                </div>
                                {detail.filmatic_line_form_2_day_shift_details_stoppage_time && detail.filmatic_line_form_2_day_shift_details_stoppage_time.length > 0 && (
                                  <div className="mt-2">
                                    <h5 className="text-xs font-medium text-gray-700 mb-2">Stoppage Time:</h5>
                                    {detail.filmatic_line_form_2_day_shift_details_stoppage_time.map((st: any, stIndex: number) => (
                                      <div key={stIndex} className="grid grid-cols-2 gap-1 text-xs">
                                        <div><span className="font-medium">Capper 1 Hours:</span> {st.capper_1_hours ?? '—'}</div>
                                        <div><span className="font-medium">Capper 2 Hours:</span> {st.capper_2_hours ?? '—'}</div>
                                        <div><span className="font-medium">Sleever 1 Hours:</span> {st.sleever_1_hours ?? '—'}</div>
                                        <div><span className="font-medium">Sleever 2 Hours:</span> {st.sleever_2_hours ?? '—'}</div>
                                        <div><span className="font-medium">Shrink 1 Hours:</span> {st.shrink_1_hours ?? '—'}</div>
                                        <div><span className="font-medium">Shrink 2 Hours:</span> {st.shrink_2_hours ?? '—'}</div>
                                        <div><span className="font-medium">Capper 1:</span> {st.capper_1 ?? '—'}</div>
                                        <div><span className="font-medium">Capper 2:</span> {st.capper_2 ?? '—'}</div>
                                        <div><span className="font-medium">Sleever 1:</span> {st.sleever_1 ?? '—'}</div>
                                        <div><span className="font-medium">Sleever 2:</span> {st.sleever_2 ?? '—'}</div>
                                        <div><span className="font-medium">Shrink 1:</span> {st.shrink_1 ?? '—'}</div>
                                        <div><span className="font-medium">Shrink 2:</span> {st.shrink_2 ?? '—'}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {shiftIndex < form.filmatic_line_form_2_day_shift.length - 1 && <Separator />}
                  </div>
                ))
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
              {form.filmatic_line_form_2_night_shift && form.filmatic_line_form_2_night_shift.length > 0 ? (
                form.filmatic_line_form_2_night_shift.map((shift, shiftIndex) => (
                  <div key={shiftIndex} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Shift Entry #{shiftIndex + 1}</h4>
                      <Badge className={shift.supervisor_approve ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {shift.supervisor_approve ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="pl-4 space-y-2">
                      <p className="text-sm font-light"><span className="font-medium">Operator:</span> {(() => {
                        const op = users.find((u:any) => u.id === shift.operator_id)
                        return op ? <UserAvatar user={op} size="md" showName={true} showEmail={true} showDropdown={true} /> : (shift.operator_id ? shift.operator_id.slice(0,8) : 'N/A')
                      })()}</p>
                      <p className="text-sm font-light"><span className="font-medium">Details Count:</span> {shift.filmatic_line_form_2_night_shift_details?.length || 0}</p>
                      
                      {shift.filmatic_line_form_2_night_shift_details && shift.filmatic_line_form_2_night_shift_details.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Production Details:</h5>
                          <div className="space-y-2">
                            {shift.filmatic_line_form_2_night_shift_details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="bg-gray-50 p-3 rounded text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                  <span><strong>Time:</strong> {detail.time}</span>
                                  <span><strong>Target:</strong> {detail.target}</span>
                                  <span><strong>Pallets:</strong> {detail.pallets}</span>
                                  <span><strong>Setbacks:</strong> {detail.setbacks || 'None'}</span>
                                </div>
                                {detail.filmatic_line_form_2_night_shift_details_stoppage_time && detail.filmatic_line_form_2_night_shift_details_stoppage_time.length > 0 && (
                                  <div className="mt-2">
                                    <h5 className="text-xs font-medium text-gray-700 mb-2">Stoppage Time:</h5>
                                    {detail.filmatic_line_form_2_night_shift_details_stoppage_time.map((st: any, stIndex: number) => (
                                      <div key={stIndex} className="grid grid-cols-2 gap-1 text-xs">
                                        <div><span className="font-medium">Capper 1 Hours:</span> {st.capper_1_hours ?? '—'}</div>
                                        <div><span className="font-medium">Capper 2 Hours:</span> {st.capper_2_hours ?? '—'}</div>
                                        <div><span className="font-medium">Sleever 1 Hours:</span> {st.sleever_1_hours ?? '—'}</div>
                                        <div><span className="font-medium">Sleever 2 Hours:</span> {st.sleever_2_hours ?? '—'}</div>
                                        <div><span className="font-medium">Shrink 1 Hours:</span> {st.shrink_1_hours ?? '—'}</div>
                                        <div><span className="font-medium">Shrink 2 Hours:</span> {st.shrink_2_hours ?? '—'}</div>
                                        <div><span className="font-medium">Capper 1:</span> {st.capper_1 ?? '—'}</div>
                                        <div><span className="font-medium">Capper 2:</span> {st.capper_2 ?? '—'}</div>
                                        <div><span className="font-medium">Sleever 1:</span> {st.sleever_1 ?? '—'}</div>
                                        <div><span className="font-medium">Sleever 2:</span> {st.sleever_2 ?? '—'}</div>
                                        <div><span className="font-medium">Shrink 1:</span> {st.shrink_1 ?? '—'}</div>
                                        <div><span className="font-medium">Shrink 2:</span> {st.shrink_2 ?? '—'}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {shiftIndex < form.filmatic_line_form_2_night_shift.length - 1 && <Separator />}
                  </div>
                ))
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
                <span className="text-xs text-green-600 font-medium">Latest Filmatic Lines Form 2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
