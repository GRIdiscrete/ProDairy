"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FilmaticLinesForm2 } from "@/lib/api/filmatic-lines-form-2"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Beaker, FileText, CheckCircle, User, Package, ArrowRight, Hash, Clock, Sun, Moon, Factory } from "lucide-react"

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
  if (!form) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
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
                <span className="text-sm font-light">Process Log</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Filmatic Lines Form 2</span>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
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
                  <span className="text-xs font-light text-gray-500">Form ID</span>
                  <p className="text-sm font-light">{form.id}</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Date</span>
                  <p className="text-sm font-light">
                    {form.date ? format(new Date(form.date), "PPP") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Holding Tank BMT</span>
                  <p className="text-sm font-light">{form.holding_tank_bmt ? String(form.holding_tank_bmt).slice(0, 8) + '...' : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottle Counts */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <CardTitle className="text-base font-light">Bottle Counts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Day Shift Bottles */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-yellow-600" />
                  Day Shift Bottles
                </h4>
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Opening:</span> {form.day_shift_opening_bottles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Closing:</span> {form.day_shift_closing_bottles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Waste:</span> {form.day_shift_waste_bottles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Net:</span> {form.day_shift_closing_bottles - form.day_shift_opening_bottles - form.day_shift_waste_bottles}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Night Shift Bottles */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-blue-600" />
                  Night Shift Bottles
                </h4>
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Opening:</span> {form.night_shift_opening_bottles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Closing:</span> {form.night_shift_closing_bottles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Waste:</span> {form.night_shift_waste_bottles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Net:</span> {form.night_shift_closing_bottles - form.night_shift_opening_bottles - form.night_shift_waste_bottles}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Summary</h4>
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Total Opening:</span> {form.day_shift_opening_bottles + form.night_shift_opening_bottles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Total Closing:</span> {form.day_shift_closing_bottles + form.night_shift_closing_bottles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Total Waste:</span> {form.day_shift_waste_bottles + form.night_shift_waste_bottles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-light"><span className="font-medium">Total Net:</span> {(form.day_shift_closing_bottles + form.night_shift_closing_bottles) - (form.day_shift_opening_bottles + form.night_shift_opening_bottles) - (form.day_shift_waste_bottles + form.night_shift_waste_bottles)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shift Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-base font-light">Shift Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Day Shift */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-yellow-600" />
                  Day Shift
                </h4>
                <div className="pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light">Status</span>
                    <Badge className={form.day_shift_id ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {form.day_shift_id ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  {form.day_shift_id && (
                    <div className="mt-2">
                      <p className="text-sm font-light"><span className="font-medium">Shift ID:</span> {String(form.day_shift_id).slice(0, 8)}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Night Shift */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-blue-600" />
                  Night Shift
                </h4>
                <div className="pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light">Status</span>
                    <Badge className={form.night_shift_id ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {form.night_shift_id ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  {form.night_shift_id && (
                    <div className="mt-2">
                      <p className="text-sm font-light"><span className="font-medium">Shift ID:</span> {String(form.night_shift_id).slice(0, 8)}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Approval Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  Approval Status
                </h4>
                <div className="pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light">Status</span>
                    <Badge className={form.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {form.approved ? 'Approved' : 'Pending Approval'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form 2 Specific Stoppage Times */}
          {(form.filmatic_line_form_2_day_shift_id_fkey || form.filmatic_line_form_2_night_shift_id_fkey) && (
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-red-600" />
                  </div>
                  <CardTitle className="text-base font-light">Stoppage Times (Form 2 Specific)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Day Shift Stoppage Times */}
                {form.filmatic_line_form_2_day_shift_id_fkey?.filmatic_line_form_2_day_shift_shift_details_fkey?.filmatic_line_form_2_day_shift_details_stoppage_time_id_fkey && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center space-x-2">
                      <Sun className="h-4 w-4 text-yellow-600" />
                      Day Shift Stoppage Times
                    </h4>
                    <div className="grid grid-cols-3 gap-4 pl-4">
                      <div>
                        <p className="text-sm font-light"><span className="font-medium">Capper 1:</span> {form.filmatic_line_form_2_day_shift_id_fkey.filmatic_line_form_2_day_shift_shift_details_fkey.filmatic_line_form_2_day_shift_details_stoppage_time_id_fkey.capper_1 || 0} min</p>
                      </div>
                      <div>
                        <p className="text-sm font-light"><span className="font-medium">Capper 2:</span> {form.filmatic_line_form_2_day_shift_id_fkey.filmatic_line_form_2_day_shift_shift_details_fkey.filmatic_line_form_2_day_shift_details_stoppage_time_id_fkey.capper_2 || 0} min</p>
                      </div>
                      <div>
                        <p className="text-sm font-light"><span className="font-medium">Sleever 1:</span> {form.filmatic_line_form_2_day_shift_id_fkey.filmatic_line_form_2_day_shift_shift_details_fkey.filmatic_line_form_2_day_shift_details_stoppage_time_id_fkey.sleever_1 || 0} min</p>
                      </div>
                      <div>
                        <p className="text-sm font-light"><span className="font-medium">Sleever 2:</span> {form.filmatic_line_form_2_day_shift_id_fkey.filmatic_line_form_2_day_shift_shift_details_fkey.filmatic_line_form_2_day_shift_details_stoppage_time_id_fkey.sleever_2 || 0} min</p>
                      </div>
                      <div>
                        <p className="text-sm font-light"><span className="font-medium">Shrink 1:</span> {form.filmatic_line_form_2_day_shift_id_fkey.filmatic_line_form_2_day_shift_shift_details_fkey.filmatic_line_form_2_day_shift_details_stoppage_time_id_fkey.shrink_1 || 0} min</p>
                      </div>
                      <div>
                        <p className="text-sm font-light"><span className="font-medium">Shrink 2:</span> {form.filmatic_line_form_2_day_shift_id_fkey.filmatic_line_form_2_day_shift_shift_details_fkey.filmatic_line_form_2_day_shift_details_stoppage_time_id_fkey.shrink_2 || 0} min</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Night Shift Stoppage Times */}
                {form.filmatic_line_form_2_night_shift_id_fkey?.filmatic_line_form_2_night_shift_shift_details_fkey?.filmatic_line_form_2_night_shift_details_stoppage_time_id_fkey && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center space-x-2">
                        <Moon className="h-4 w-4 text-blue-600" />
                        Night Shift Stoppage Times
                      </h4>
                      <div className="grid grid-cols-3 gap-4 pl-4">
                        <div>
                          <p className="text-sm font-light"><span className="font-medium">Capper 1:</span> {form.filmatic_line_form_2_night_shift_id_fkey.filmatic_line_form_2_night_shift_shift_details_fkey.filmatic_line_form_2_night_shift_details_stoppage_time_id_fkey.capper_1 || 0} min</p>
                        </div>
                        <div>
                          <p className="text-sm font-light"><span className="font-medium">Capper 2:</span> {form.filmatic_line_form_2_night_shift_id_fkey.filmatic_line_form_2_night_shift_shift_details_fkey.filmatic_line_form_2_night_shift_details_stoppage_time_id_fkey.capper_2 || 0} min</p>
                        </div>
                        <div>
                          <p className="text-sm font-light"><span className="font-medium">Sleever 1:</span> {form.filmatic_line_form_2_night_shift_id_fkey.filmatic_line_form_2_night_shift_shift_details_fkey.filmatic_line_form_2_night_shift_details_stoppage_time_id_fkey.sleever_1 || 0} min</p>
                        </div>
                        <div>
                          <p className="text-sm font-light"><span className="font-medium">Sleever 2:</span> {form.filmatic_line_form_2_night_shift_id_fkey.filmatic_line_form_2_night_shift_shift_details_fkey.filmatic_line_form_2_night_shift_details_stoppage_time_id_fkey.sleever_2 || 0} min</p>
                        </div>
                        <div>
                          <p className="text-sm font-light"><span className="font-medium">Shrink 1:</span> {form.filmatic_line_form_2_night_shift_id_fkey.filmatic_line_form_2_night_shift_shift_details_fkey.filmatic_line_form_2_night_shift_details_stoppage_time_id_fkey.shrink_1 || 0} min</p>
                        </div>
                        <div>
                          <p className="text-sm font-light"><span className="font-medium">Shrink 2:</span> {form.filmatic_line_form_2_night_shift_id_fkey.filmatic_line_form_2_night_shift_shift_details_fkey.filmatic_line_form_2_night_shift_details_stoppage_time_id_fkey.shrink_2 || 0} min</p>
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