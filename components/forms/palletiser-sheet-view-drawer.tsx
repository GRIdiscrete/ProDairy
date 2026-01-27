"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CopyButton } from "@/components/ui/copy-button"
import { Package, Calendar, User, Building, Clock, Hash, Edit, ArrowRight, CheckCircle } from "lucide-react"
import { PalletiserSheet } from "@/lib/api/data-capture-forms"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { useAppSelector } from "@/lib/store"
import { UserAvatar } from "@/components/ui/user-avatar"
import type { RootState } from "@/lib/store"

interface PalletiserSheetViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheet: PalletiserSheet | null
  onEdit: () => void
}

export function PalletiserSheetViewDrawer({
  open,
  onOpenChange,
  sheet,
  onEdit
}: PalletiserSheetViewDrawerProps) {
  const [details, setDetails] = useState<any[]>([])

  // helper to format ISO date -> "25 Oct 2025"
  const formatDate = (iso?: string | null) => {
    if (!iso) return "N/A"
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
  }

  // destructured selectors (match other pages)
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const { machines } = useAppSelector((state: RootState) => state.machine)
  const { roles } = useAppSelector((state: RootState) => state.roles)

  useEffect(() => {
    if (sheet && open) {
      const arr = Array.isArray((sheet as any).palletiser_sheet_details)
        ? (sheet as any).palletiser_sheet_details
        : []
      setDetails(arr)
    } else {
      setDetails([])
    }
  }, [sheet, open])

  if (!sheet) return null

  // resolve references from store by id
  const machine = machines?.find((m: any) => m.id === (sheet as any).machine_id) || null
  const approver = roles?.find((r: any) => r.id === (sheet as any).approved_by) || null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">Palletiser Sheet Details</SheetTitle>
          <SheetDescription className="text-sm font-light">View detailed information about the palletiser sheet and its process</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Sheet Overview */}
          <Card className="border-l-4 border-l-[#006BC4] shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-light">Palletiser Sheet</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-800 font-light">Batch #{sheet.batch_number}</Badge>
                      {/* show form tag (copy control) next to batch */}
                      {sheet?.tag && <FormIdCopy displayId={sheet.tag} actualId={sheet.id} size="sm" />}
                      {/* <Badge className="bg-green-100 text-green-800 font-light">{sheet.product_type ?? 'N/A'}</Badge> */}
                    </div>
                  </div>
                </div>

                <Button onClick={onEdit}  size="sm" className=" from-green-500 to-emerald-500 text-white border-0 rounded-full">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-light text-gray-600">Manufacturing Date</span>
                  </div>
                  <p className="text-sm font-light">{formatDate(sheet.manufacturing_date)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-light text-gray-600">Expiry Date</span>
                  </div>
                  <p className="text-sm font-light">{formatDate(sheet.expiry_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Machine */}
          {machine && (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Building className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-base font-light">Machine Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="text-sm font-light">{machine.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Category</div>
                    <div className="text-sm font-light">{machine.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="text-sm font-light">{machine.location}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Serial</div>
                    <div className="text-sm font-light">{machine.serial_number}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approver (role) */}
          {approver && (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-light">Approval</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Role</div>
                    <div className="text-sm font-light">{approver.role_name ?? approver.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Operations</div>
                    <div className="text-sm font-light">{approver.user_operations?.length ?? 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pallet details */}
          <Card className="shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                <CardTitle className="text-base font-light">Pallet Details</CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              {details.length > 0 ? (
                <div className="space-y-4">
                  {details.map((d: any, idx: number) => {
                    const counter = users.find((u: any) => u.id === d.counter_id) || null
                    return (
                      <div key={d.id ?? idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-orange-100 text-orange-800 font-light">Pallet {d.pallet_number}</Badge>
                            <Badge className="bg-gray-100 text-gray-600">#{idx + 1}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <CheckCircle className="h-4 w-4" /> Completed
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-gray-500">Start</div>
                            <div className="text-sm">{d.start_time ?? 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">End</div>
                            <div className="text-sm">{d.end_time ?? 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Cases</div>
                            <div className="text-sm">{d.cases_packed ?? 'N/A'}</div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">Serial</div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm">{d.serial_number ?? 'N/A'}</div>
                              <CopyButton text={d.serial_number ?? ''} />
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">Counter</div>
                            <div className="flex items-center gap-3 mt-1">
                              {counter ? (
                                <UserAvatar user={counter} size="md" showName showEmail showDropdown />
                              ) : (
                                <div className="text-xs text-gray-500">No counter assigned</div>
                              )}
                              {d.counter_signature ? (
                                <img src={`data:image/png;base64,${d.counter_signature}`} alt="signature" className="h-24 border rounded-md" />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-light text-gray-500">No pallet details available</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </SheetContent>
    </Sheet>
  )
}