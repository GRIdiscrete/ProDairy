"use client"

import { useState, useEffect } from "react"
import { formatTimeForDisplay } from "@/lib/utils/time-formatter"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { CopyButton } from "@/components/ui/copy-button"
import { AnimatedSiloTransfer } from "@/components/ui/animated-silo-transfer"
import { Edit, Beaker, Droplets, Users, Clock, BarChart3, ArrowRight, Play, RotateCcw, FileText, Package, TrendingUp, User } from "lucide-react"
import { format } from "date-fns"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { siloApi } from "@/lib/api/silo"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"

// Helper function to safely extract and format time from datetime strings
const formatTimeOnly = (dateTimeString: string | null | undefined): string => {
  if (!dateTimeString) return 'N/A'

  try {
    // Handle different datetime formats
    let timeString = ''

    if (dateTimeString.includes('T')) {
      // ISO format: "2025-01-06T12:00:00.000000+00"
      timeString = dateTimeString.split('T')[1]?.substring(0, 5) || ''
    } else if (dateTimeString.includes(' ')) {
      // Space format: "2025-01-06 12:00:00.000000+00"
      timeString = dateTimeString.split(' ')[1]?.substring(0, 5) || ''
    } else if (dateTimeString.match(/^\d{2}:\d{2}$/)) {
      // Already time format: "12:00"
      timeString = dateTimeString
    } else {
      // Try to parse as date and extract time
      const date = new Date(dateTimeString)
      if (!isNaN(date.getTime())) {
        timeString = format(date, 'HH:mm')
      } else {
        return 'Invalid Time'
      }
    }

    return timeString || 'N/A'
  } catch (error) {
    console.error('Error formatting time:', error, dateTimeString)
    return 'Invalid Time'
  }
}
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import type { BMTControlForm } from "@/lib/api/bmt-control-form"

interface BMTControlFormViewDrawerProps {
  open: boolean
  onClose: () => void
  form: BMTControlForm | null
  onEdit?: () => void
}

export function BMTControlFormViewDrawer({ open, onClose, form, onEdit }: BMTControlFormViewDrawerProps) {
  const dispatch = useAppDispatch()
  const { items: users } = useAppSelector((state) => state.users)

  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [silos, setSilos] = useState<any[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)

  // Helper function to format time display - handles multiple formats
  const formatTimeForDisplay = (timeString: string | undefined): string => {
    if (!timeString) return 'N/A'

    try {
      // Handle different time formats
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        // Already in HH:MM format
        return timeString
      } else if (timeString.match(/^\d{2}:\d{2}:\d{2}/)) {
        // Handle HH:MM:SS or HH:MM:SS.microseconds format
        return timeString.substring(0, 5) // Extract HH:MM
      } else if (timeString.includes('T')) {
        // ISO timestamp format
        return timeString.split('T')[1]?.substring(0, 5) || 'N/A'
      } else if (timeString.includes(' ')) {
        // Space-separated datetime
        return timeString.split(' ')[1]?.substring(0, 5) || 'N/A'
      } else {
        // Try to parse as date
        const date = new Date(timeString)
        if (isNaN(date.getTime())) {
          return timeString // Return original if can't parse
        }
        return format(date, 'HH:mm')
      }
    } catch (error) {
      return timeString || 'N/A'
    }
  }

  // Load users and silos when drawer opens
  useEffect(() => {
    if (open) {
      // Load users if not already loaded
      if (users.length === 0) {
        dispatch(fetchUsers({}))
      }

      // Load silos
      loadSilos()
    }
  }, [open, dispatch, users.length])

  const loadSilos = async () => {
    try {
      setLoadingSilos(true)
      const response = await siloApi.getSilos()
      setSilos(response.data || [])
    } catch (error) {
      console.error('Error loading silos:', error)
    } finally {
      setLoadingSilos(false)
    }
  }

  // Helper functions
  const getSiloById = (siloId: string | string[]) => {
    if (!siloId) return null
    const id = Array.isArray(siloId) ? siloId[0] : siloId
    return silos.find((silo: any) => silo.id === id)
  }

  const getUserById = (userId: string) => {
    return users.find((user: any) => user.id === userId)
  }

  const generateBMTFormId = (createdAt: string) => {
    if (!createdAt) return 'bmt-000-00-00-0000'

    try {
      const date = new Date(createdAt)
      const dayNumber = Math.floor(Math.random() * 999) + 1
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear()

      return `bmt-${dayNumber.toString().padStart(3, '0')}-${month}-${day}-${year}`
    } catch (error) {
      return 'bmt-000-00-00-0000'
    }
  }

  // Helper: get transfer pairs from new or legacy API structure
  const getTransferPairs = (): Array<{ source: any; destination: any | null }> => {
    if (!form) return [];

    // New API: source_destination_details array
    if (Array.isArray(form.source_destination_details) && form.source_destination_details.length > 0) {
      return form.source_destination_details.map((pair) => ({
        source: pair.source_silo_details
          ? {
            name: pair.source_silo_details.silo_name,
            flow_meter_start: pair.source_silo_details.flow_meter_start,
            flow_meter_start_reading: pair.source_silo_details.flow_meter_start_reading,
            flow_meter_end: pair.source_silo_details.flow_meter_end,
            flow_meter_end_reading: pair.source_silo_details.flow_meter_end_reading,
            source_silo_quantity_requested: null,
            product: form.product,
          }
          : null,
        destination: pair.destination_silo_details
          ? {
            name: pair.destination_silo_details.silo_name,
            flow_meter_start: pair.destination_silo_details.flow_meter_start,
            flow_meter_start_reading: pair.destination_silo_details.flow_meter_start_reading,
            flow_meter_end: pair.destination_silo_details.flow_meter_end,
            flow_meter_end_reading: pair.destination_silo_details.flow_meter_end_reading,
            quantity_received: null,
            product: form.product,
          }
          : null,
      }));
    }

    // Legacy API fallback: bmt_control_form_source_silo + bmt_control_form_destination_silo
    if (Array.isArray((form as any).bmt_control_form_source_silo)) {
      const srcSilos = (form as any).bmt_control_form_source_silo as any[];
      const dstSilos: any[] = Array.isArray((form as any).bmt_control_form_destination_silo)
        ? (form as any).bmt_control_form_destination_silo
        : [];
      return srcSilos.map((src, idx) => ({
        source: src,
        destination: dstSilos[idx] || dstSilos[0] || null,
      }));
    }

    return [];
  };

  if (!form) return null;

  const transferPairs = getTransferPairs();

  const dispatchUser = getUserById((form as any).dispatch_operator_id || form.llm_operator_id)
  const receiverUser = getUserById((form as any).receiver_operator_id || form.dpp_operator_id)

  const volumeDifference = (form.flow_meter_end_reading || 0) - (form.flow_meter_start_reading || 0)

  const startAnimation = () => {
    setIsAnimating(true)
    setAnimationProgress(0)

    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnimating(false)
          return 100
        }
        return prev + 2
      })
    }, 50) // Faster animation for demo
  }

  const resetAnimation = () => {
    setIsAnimating(false)
    setAnimationProgress(0)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Beaker className="w-5 h-5" />
            BMT Control Form Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light flex items-center gap-2">
            <span>Complete information about the bulk milk transfer control form record</span>
            <FormIdCopy
              displayId={form.tag || "N/A"}
              actualId={form.tag || ""}
              size="lg"
            />
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-light">Source Silo</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600">BMT Transfer</span>
                  <div className=" bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Destination Silo</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-light">BMT Control Form</h2>
            </div>
            <div className="flex items-center space-x-2">
              <LoadingButton

                size="sm"
                onClick={onEdit}
                className="bg-[#A0CF06] text-[#211D1E] rounded-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </LoadingButton>
            </div>
          </div>

          {/* Form Information */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FormIdCopy
                displayId={form.tag || "N/A"}
                actualId={form.tag || ""}
                size="sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800 font-light">
                Status: {(form as any).status || 'Draft'}
              </Badge>
            </div>
          </div>

          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transfer Details */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-light">Transfer Details</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Product</span>
                  <span className="text-sm font-light text-blue-600">{form.product}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Volume</span>
                  <span className="text-sm font-light text-green-600">{form.volume || 'N/A'}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Tag</span>
                  <span className="text-sm font-light">{(form as any).tag || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Received Bottles</span>
                  <span className="text-sm font-light">{(form as any).received_bottles || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Movement Timeline */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-lg font-light">Movement Timeline</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Movement Start</span>
                  <span className="text-sm font-light">
                    {formatTimeForDisplay(form?.movement_start || undefined)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Movement End</span>
                  <span className="text-sm font-light">
                    {formatTimeForDisplay(form?.movement_end || undefined)}
                  </span>
                </div>
                {form.movement_start && form.movement_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Total Duration</span>
                    <span className="text-sm font-light text-indigo-600">
                      {(() => {
                        try {
                          const startDate = new Date(form.movement_start)
                          const endDate = new Date(form.movement_end)
                          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                            return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)) + ' minutes'
                          }
                          return 'N/A'
                        } catch (error) {
                          return 'N/A'
                        }
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transfer Pairs Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#006BC4] text-white flex items-center justify-center shadow-sm">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-light text-gray-900">Transfer Pairs & Readings</h3>
            </div>

            <div className="space-y-4">
              {transferPairs.length > 0 ? (
                transferPairs.map(({ source, destination }, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="bg-gray-50/50 p-3 border-b flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Pair #{idx + 1}</span>
                      <Badge variant="outline" className="bg-white font-normal text-xs">
                        {source?.product || form.product}
                      </Badge>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                      {/* Source Silo Column */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-blue-600">S</span>
                          </div>
                          <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Source</span>
                        </div>
                        <div className="space-y-2 pl-8">
                          <p className="text-sm font-medium text-gray-900">{source?.name ?? 'N/A'}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-gray-400 font-medium">START READING</p>
                              <p className="text-sm font-light text-blue-600">{source?.flow_meter_start_reading ?? '—'} L</p>
                              <p className="text-[10px] text-gray-400">{formatTimeOnly(source?.flow_meter_start)}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-gray-400 font-medium">END READING</p>
                              <p className="text-sm font-light text-blue-600">{source?.flow_meter_end_reading ?? '—'} L</p>
                              <p className="text-[10px] text-gray-400">{formatTimeOnly(source?.flow_meter_end)}</p>
                            </div>
                          </div>
                          {source?.source_silo_quantity_requested != null && (
                            <div className="pt-1">
                              <p className="text-[10px] text-gray-400 font-medium uppercase">Requested Volume</p>
                              <p className="text-sm font-medium text-gray-700">{source.source_silo_quantity_requested} L</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual Connector Arrow (Desktop only) */}
                      <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-50 border border-gray-200 items-center justify-center z-10 shadow-sm">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>

                      {/* Destination Silo Column */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-green-600">D</span>
                          </div>
                          <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Destination</span>
                        </div>
                        {destination ? (
                          <div className="space-y-2 pl-8">
                            <p className="text-sm font-medium text-gray-900">{destination.name}</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-0.5">
                                <p className="text-[10px] text-gray-400 font-medium">START READING</p>
                                <p className="text-sm font-light text-green-600">{destination.flow_meter_start_reading ?? '—'} L</p>
                                <p className="text-[10px] text-gray-400">{formatTimeOnly(destination.flow_meter_start)}</p>
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[10px] text-gray-400 font-medium">END READING</p>
                                <p className="text-sm font-light text-green-600">{destination.flow_meter_end_reading ?? '—'} L</p>
                                <p className="text-[10px] text-gray-400">{formatTimeOnly(destination.flow_meter_end)}</p>
                              </div>
                            </div>
                            {destination.quantity_received != null && (
                              <div className="pt-1">
                                <p className="text-[10px] text-gray-400 font-medium uppercase">Quantity Received</p>
                                <p className="text-sm font-medium text-gray-700">{destination.quantity_received} L</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="pl-8 flex items-center h-full">
                            <p className="text-sm italic text-gray-400 font-light">No paired destination data</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 font-light italic">No transfer pairs recorded for this form</p>
                </div>
              )}
            </div>
          </div>


          {/* Operator Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dispatch Operator */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-light">Dispatch Operator</h3>
              </div>
              <div className="space-y-4">
                {dispatchUser ? (
                  <UserAvatar
                    user={dispatchUser}
                    size="lg"
                    showName={true}
                    showEmail={true}
                    showDropdown={true}
                  />
                ) : (
                  <div className="text-sm text-gray-500">
                    {(form as any).dispatch_operator_id || form.llm_operator_id
                      ? `User not found (${((form as any).dispatch_operator_id || form.llm_operator_id).slice(0, 8)}...)`
                      : 'No operator assigned'}
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-sm font-light text-gray-600">Dispatch Signature</span>
                  {(form as any).dispatch_operator_signature ? (
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <img
                        src={base64ToPngDataUrl((form as any).dispatch_operator_signature)}
                        alt="Dispatch signature"
                        className="w-full h-20 object-contain"
                      />
                    </div>
                  ) : form.llm_signature ? (
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <img
                        src={base64ToPngDataUrl(form.llm_signature)}
                        alt="LLM signature"
                        className="w-full h-20 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center text-gray-500 text-sm">
                      No signature available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Receiver Operator */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-lg font-light">Receiver Operator</h3>
              </div>
              <div className="space-y-4">
                {receiverUser ? (
                  <UserAvatar
                    user={receiverUser}
                    size="lg"
                    showName={true}
                    showEmail={true}
                    showDropdown={true}
                  />
                ) : (
                  <div className="text-sm text-gray-500">
                    {(form as any).receiver_operator_id || form.dpp_operator_id
                      ? `User not found (${((form as any).receiver_operator_id || form.dpp_operator_id).slice(0, 8)}...)`
                      : 'No operator assigned'}
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-sm font-light text-gray-600">Receiver Signature</span>
                  {(form as any).receiver_operator_signature ? (
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <img
                        src={base64ToPngDataUrl((form as any).receiver_operator_signature)}
                        alt="Receiver signature"
                        className="w-full h-20 object-contain"
                      />
                    </div>
                  ) : form.dpp_signature ? (
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <img
                        src={base64ToPngDataUrl(form.dpp_signature)}
                        alt="DPP signature"
                        className="w-full h-20 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center text-gray-500 text-sm">
                      No signature available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Record Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-lg font-light">Record Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Form ID</span>
                <div className="flex items-center space-x-2">
                  <Badge className="font-mono">
                    {form?.tag}
                  </Badge>
                  <CopyButton text={form.id || ''} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Created</span>
                <span className="text-sm font-light">
                  {form.created_at ? format(new Date(form.created_at), 'PPP') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Last Updated</span>
                <span className="text-sm font-light">
                  {form.updated_at ? format(new Date(form.updated_at), 'PPP') : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
