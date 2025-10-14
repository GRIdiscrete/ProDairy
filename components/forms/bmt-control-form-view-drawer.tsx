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

  if (!form) return null

  const sourceSilo = getSiloById(form.source_silo_id)
  const destinationSilo = getSiloById(form.destination_silo_id)
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

  // For destination silo, use new BMT object structure if available
  const destinationSiloObj = (form as any).destination_silo_details
    ? silos.find((silo: any) => silo.id === (form as any).destination_silo_details.id)
    : getSiloById(form.destination_silo_id)

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
              displayId={generateBMTFormId(form.created_at)}
              actualId={form.id || ''}
              size="md"
            />
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
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
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
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
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
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
                displayId={generateBMTFormId(form.created_at)}
                actualId={form.id}
                size="lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-light">
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
                                      {formatTimeForDisplay(form.movement_start)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Movement End</span>
                  <span className="text-sm font-light">
                                      {formatTimeForDisplay(form.movement_end)}
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

          {/* Silo Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Silo */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-light">Source Silo</h3>
              </div>
              <div className="space-y-3">
                {sourceSilo ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Name</span>
                      <span className="text-sm font-light text-blue-900">{sourceSilo.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Capacity</span>
                      <span className="text-sm font-light">{sourceSilo.capacity?.toLocaleString()}L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Location</span>
                      <span className="text-sm font-light">{sourceSilo.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Category</span>
                      <span className="text-sm font-light">{sourceSilo.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Current Volume</span>
                      <span className="text-sm font-light text-green-600">{sourceSilo.milk_volume?.toLocaleString()}L</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    {Array.isArray(form.source_silo_id) ? `Silo ID: ${form.source_silo_id[0]}` : `Silo ID: ${form.source_silo_id}`}
                  </div>
                )}
              </div>
            </div>

            {/* Destination Silo */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-lg font-light">Destination Silo</h3>
              </div>
              <div className="space-y-3">
                {destinationSiloObj ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Name</span>
                      <span className="text-sm font-light text-green-900">{destinationSiloObj.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Capacity</span>
                      <span className="text-sm font-light">{destinationSiloObj.capacity?.toLocaleString()}L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Location</span>
                      <span className="text-sm font-light">{destinationSiloObj.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Category</span>
                      <span className="text-sm font-light">{destinationSiloObj.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Current Volume</span>
                      <span className="text-sm font-light text-blue-600">{destinationSiloObj.milk_volume?.toLocaleString()}L</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    Silo ID: {(form as any).destination_silo_details?.id || form.destination_silo_id || 'N/A'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Animated Silo Transfer Visualization */}
          {sourceSilo && destinationSilo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Milk Transfer Visualization</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startAnimation}
                    disabled={isAnimating}
                    className="flex items-center space-x-1"
                  >
                    <Play className="w-4 h-4" />
                    <span>Demo Transfer</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAnimation}
                    className="flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </Button>
                </div>
              </div>
              
              <AnimatedSiloTransfer
                sourceSilo={{
                  id: sourceSilo.id,
                  name: sourceSilo.name,
                  capacity: sourceSilo.capacity,
                  currentVolume: sourceSilo.milk_volume - (isAnimating ? (animationProgress / 100) * (form.volume || 0) : (form.volume || 0)),
                  location: sourceSilo.location,
                  category: sourceSilo.category
                }}
                destinationSilo={{
                  id: destinationSilo.id,
                  name: destinationSilo.name,
                  capacity: destinationSilo.capacity,
                  currentVolume: destinationSilo.milk_volume + (isAnimating ? (animationProgress / 100) * (form.volume || 0) : (form.volume || 0)),
                  location: destinationSilo.location,
                  category: destinationSilo.category
                }}
                transferVolume={form.volume || 0}
                isTransferring={isAnimating}
                transferProgress={animationProgress}
              />
            </div>
          )}

          {/* Flow Meter Readings */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-light">Flow Meter Readings</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Start Reading</span>
                <span className="text-sm font-light text-blue-600">{form.flow_meter_start_reading}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">End Reading</span>
                <span className="text-sm font-light text-green-600">{form.flow_meter_end_reading}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Volume Difference</span>
                <span className={`text-sm font-light ${volumeDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {volumeDifference > 0 ? '+' : ''}{volumeDifference}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Start Time</span>
                <span className="text-sm font-light">
                  {formatTimeOnly(form.flow_meter_start)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">End Time</span>
                <span className="text-sm font-light">
                  {formatTimeOnly(form.flow_meter_end)}
                </span>
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
                  {formatTimeOnly(form.movement_start)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Movement End</span>
                <span className="text-sm font-light">
                  {formatTimeOnly(form.movement_end)}
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

          {/* Operator Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dispatch Operator */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-purple-600" />
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
                  <Badge variant="outline" className="font-mono">
                    {(() => {
                      const createdDate = form.created_at ? new Date(form.created_at) : null
                      const formId = form.id ? form.id.slice(-3) : '000'
                      return createdDate 
                        ? `bmt-${formId}-${(createdDate.getMonth() + 1).toString().padStart(2, '0')}-${createdDate.getDate().toString().padStart(2, '0')}-${createdDate.getFullYear()}`
                        : 'bmt-000-00-00-0000'
                    })()}
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
