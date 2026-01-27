"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Thermometer, Droplets, Clock, User, Building } from "lucide-react"
import { FlexOneSteriliserProcess, FlexOneSteriliserProcessProduct, FlexOneSteriliserProcessWaterStream } from "@/lib/api/data-capture-forms"

interface FlexOneSteriliserProcessViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process: FlexOneSteriliserProcess | null
  products: FlexOneSteriliserProcessProduct[]
  waterStreams: FlexOneSteriliserProcessWaterStream[]
  onEdit: () => void
}

export function FlexOneSteriliserProcessViewDrawer({
  open,
  onOpenChange,
  process,
  products,
  waterStreams,
  onEdit
}: FlexOneSteriliserProcessViewDrawerProps) {
  if (!process) return null

  const getPersonName = (person: any) => {
    if (!person) return "Unknown"
    return `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email || "Unknown"
  }

  const getMachineName = (machine: any) => {
    if (!machine) return "Unknown"
    return machine.name || "Unknown"
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[60vw] sm:max-w-[60vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-blue-600" />
            Flex One Steriliser Process Details
          </SheetTitle>
          <SheetDescription>
            View complete process information, product measurements, and water stream data
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Process Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Process Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Being Processed</label>
                  <p className="text-sm font-semibold">{process.product_being_processed || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Machine</label>
                  <p className="text-sm font-semibold">{getMachineName(process.flex_one_steriliser_process_machine_id_fkey)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Process Operator</label>
                  <p className="text-sm font-semibold">{getPersonName(process.flex_one_steriliser_process_process_operator_fkey)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Approved By</label>
                  <p className="text-sm font-semibold">{getPersonName(process.flex_one_steriliser_process_approved_by_fkey)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Production Date</label>
                <p className="text-sm font-semibold">
                  {process.production_date ? new Date(process.production_date).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Production Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Preheating Start</label>
                  <p className="text-sm font-semibold">
                    {process.preheating_start ? new Date(process.preheating_start).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sterile Water Circulation</label>
                  <p className="text-sm font-semibold">
                    {process.sterile_water_circulation ? new Date(process.sterile_water_circulation).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Production Start</label>
                  <p className="text-sm font-semibold">
                    {process.production_start ? new Date(process.production_start).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Production End</label>
                  <p className="text-sm font-semibold">
                    {process.production_end ? new Date(process.production_end).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Product Measurements
                <Badge className="bg-green-100 text-green-800">{products.length} records</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <div key={product.id || index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Measurement #{index + 1}</h4>
                        <span className="text-sm text-gray-500">
                          {product.time ? new Date(product.time).toLocaleString() : "N/A"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Product BTD</label>
                          <p className="text-sm font-semibold">{product.temp_product_btd}°C</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">After Homogenizer</label>
                          <p className="text-sm font-semibold">{product.temp_after_homogenizer}°C</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Before Deaerator</label>
                          <p className="text-sm font-semibold">{product.temp_before_deaerator}°C</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Before Holding Cell</label>
                          <p className="text-sm font-semibold">{product.temp_before_holding_cell}°C</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">After Holding Cell</label>
                          <p className="text-sm font-semibold">{product.temp_after_holding_cell}°C</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Guard Holding Cell</label>
                          <p className="text-sm font-semibold">{product.temp_guard_holding_cell}°C</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">To Filling</label>
                          <p className="text-sm font-semibold">{product.temp_to_filling}°C</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">From Filling</label>
                          <p className="text-sm font-semibold">{product.temp_from_filling}°C</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Homogenisation Pressure</label>
                          <p className="text-sm font-semibold">{product.homogenisation_pressure} bar</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Holding Cell</label>
                          <p className="text-sm font-semibold">{product.holding_cell} min</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Flow Rate</label>
                          <p className="text-sm font-semibold">{product.flow_rate} L/h</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Balance Tank Level</label>
                          <p className="text-sm font-semibold">{product.product_level_balance_tank}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No product measurements recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Water Stream Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Water Stream Data
                <Badge className="bg-blue-100 text-blue-800">{waterStreams.length} records</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {waterStreams.length > 0 ? (
                <div className="space-y-4">
                  {waterStreams.map((stream, index) => (
                    <div key={stream.id || index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Water Stream #{index + 1}</h4>
                        <span className="text-sm text-gray-500">
                          {stream.created_at ? new Date(stream.created_at).toLocaleString() : "N/A"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">After Steam Injection</label>
                          <p className="text-sm font-semibold">{stream.temp_after_steam_injection}°C</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Deaerator Cooling Circuit</label>
                          <p className="text-sm font-semibold">{stream.temp_deaerator_cooling_circuit}°C</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Steam Injection Valve</label>
                          <p className="text-sm font-semibold">{stream.steam_injection_valve_position}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No water stream data recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button  onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={onEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Process
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
