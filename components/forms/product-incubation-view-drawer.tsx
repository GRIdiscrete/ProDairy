"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductIncubation } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"
import { TestTube, FileText, Clock, TrendingUp, ArrowRight, Package } from "lucide-react"
import { RootState, useAppSelector, useAppDispatch } from "@/lib/store"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useEffect, useState } from "react"
import { fetchUsers } from "@/lib/store/slices/usersSlice"

interface ProductIncubationViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incubation: ProductIncubation | null
  onEdit?: () => void
}

export function ProductIncubationViewDrawer({ 
  open, 
  onOpenChange, 
  incubation,
  onEdit 
}: ProductIncubationViewDrawerProps) {
  if (!incubation) return null

  const dispatch = useAppDispatch()
  useEffect(() => {
    if (open) {
      dispatch(fetchUsers({}))
    }
  }, [open, dispatch])
  
  // batch is now a single object on incubation.batch
  const batch = incubation.batch || null
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const productionPlans = useAppSelector((s:any) => s.productionPlan?.productionPlans || [])
  const approverUser = batch?.approver_id ? users.find((u:any) => u.id === batch.approver_id) : null
  const scientistUser = batch?.scientist_id ? users.find((u:any) => u.id === batch.scientist_id) : null
  const productionPlan = incubation.production_plan_id ? productionPlans.find((p:any) => p.id === incubation.production_plan_id) : null

  // toggle for showing more production plan info
  const [planOpen, setPlanOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">
            Product Incubation Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            View detailed information about the product incubation and its process
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-light">Palletizer</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <TestTube className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Incubation</span>
                  <div className="bg-[#0068BD] text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <TestTube className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Test</span>
              </div>
            </div>
          </div>

          {/* Incubation Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <TestTube className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Incubation Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Tag / Form</span>
                  <div className="mt-1">
                    {incubation.tag ? <FormIdCopy displayId={incubation.tag} actualId={incubation.id} size="sm" /> : <p className="text-sm font-light">{incubation.id}</p>}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Batch Number</span>
                  <p className="text-sm font-light">{batch?.batch_number ?? 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Incubation Days</span>
                  <p className="text-sm font-light">{batch?.days ?? 'N/A'} days</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Created At</span>
                  <p className="text-sm font-light">
                    {incubation.created_at ? format(new Date(incubation.created_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manufacturing Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-base font-light">Manufacturing Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Manufacturing Date</span>
                  <p className="text-sm font-light">
                    {batch?.manufacture_date ? format(new Date(batch.manufacture_date), "PPP") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Best Before</span>
                  <p className="text-sm font-light">
                    {batch?.best_before_date ? format(new Date(batch.best_before_date), "PPP") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incubation Dates */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <CardTitle className="text-base font-light">Incubation Dates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Time In</span>
                  <p className="text-sm font-light">{batch?.time_in ? (batch.time_in.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/) ? batch.time_in.substring(0,5) : batch.time_in) : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Expected Time Out</span>
                  <p className="text-sm font-light">{batch?.expected_time_out ? (batch.expected_time_out.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/) ? batch.expected_time_out.substring(0,5) : batch.expected_time_out) : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Actual Time Out</span>
                  <p className="text-sm font-light">{batch?.actual_time_out ? (batch.actual_time_out.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/) ? batch.actual_time_out.substring(0,5) : batch.actual_time_out) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Approval Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-light text-gray-500">Scientist</span>
                  <div>
                    {scientistUser ? (
                      <UserAvatar user={scientistUser} size="md" showName={true} showEmail={true} showDropdown={true} />
                    ) : (
                      <span className="text-xs font-light">{batch?.scientist_id ? batch.scientist_id.slice(0,8) : 'N/A'}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-light text-gray-500">Approver</span>
                  <div>
                    {approverUser ? (
                      <UserAvatar user={approverUser} size="md" showName={true} showEmail={true} showDropdown={true} />
                    ) : (
                      <span className="text-xs font-light">{batch?.approver_id ? batch.approver_id.slice(0,8) : 'N/A'}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Plan Info - custom toggle to show more details */}
          {productionPlan && (
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-gray-600" />
                  </div>
                  <CardTitle className="text-base font-light">Production Plan</CardTitle>
                </div>
                <Button size="sm"  onClick={() => setPlanOpen(p => !p)}>
                  {planOpen ? "Hide Plan" : "View Plan"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Plan</span>
                  <p className="text-sm font-light">{productionPlan.tag || productionPlan.name || productionPlan.id}</p>
                </div>

                {planOpen && (
                  <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-md">
                    <div>
                      <span className="text-xs text-gray-500">Description</span>
                      <p className="text-sm">{productionPlan.description ?? "No description available"}</p>
                    </div>
                    {productionPlan.start_date && (
                      <div>
                        <span className="text-xs text-gray-500">Start</span>
                        <p className="text-sm">{format(new Date(productionPlan.start_date), "PPP")}</p>
                      </div>
                    )}
                    {productionPlan.end_date && (
                      <div>
                        <span className="text-xs text-gray-500">End</span>
                        <p className="text-sm">{format(new Date(productionPlan.end_date), "PPP")}</p>
                      </div>
                    )}
                    {/* render any additional plan metadata if present */}
                    {productionPlan.items && Array.isArray(productionPlan.items) && (
                      <div>
                        <span className="text-xs text-gray-500">Items</span>
                        <ul className="text-sm list-disc ml-5">
                          {productionPlan.items.slice(0,5).map((it:any, idx:number) => <li key={idx}>{it.name ?? it.id ?? JSON.stringify(it)}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t bg-white">
          <Button
            
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={onEdit}
              className="flex items-center gap-2  bg-[#006BC4] text-white rounded-full"
            >
              Edit Incubation
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
