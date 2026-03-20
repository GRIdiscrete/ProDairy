"use client"

import React, { useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchCIPStatus } from "@/lib/store/slices/siloSlice"
import { Droplets, Thermometer, FlaskConical, History, ShieldCheck, Timer, ArrowRightLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

interface SiloDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  silo: any | null
  onTransfer?: (silo: any) => void
}

export function SiloDetailsDrawer({
  open,
  onOpenChange,
  silo
}: SiloDetailsDrawerProps) {
  const dispatch = useAppDispatch()
  const cipStatuses = useAppSelector((state) => state.silo.cipStatuses)
  const cipData = silo ? cipStatuses[silo.name] : null

  useEffect(() => {
    if (open && silo) {
      dispatch(fetchCIPStatus(silo.name))
    }
  }, [open, silo, dispatch])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col border-l-0 shadow-2xl">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-10">
            <SheetHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-light">{silo?.name || "Silo Details"}</SheetTitle>
            {silo?.status && (
              <Badge variant={silo.status === 'active' ? 'default' : 'secondary'} className="rounded-full px-3">
                {silo.status}
              </Badge>
            )}
          </div>
          <SheetDescription className="font-light">
            Comprehensive real-time metrics and CIP status
          </SheetDescription>
        </SheetHeader>

        {!silo ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            {/* Volume Metric */}
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-blue-500 font-medium text-opacity-70">Current Volume</p>
                <p className="text-3xl font-light text-blue-900">{silo.milk_volume?.toLocaleString()} <span className="text-sm">L</span></p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets className="text-blue-600 w-6 h-6" />
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-orange-500">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Temperature</span>
                </div>
                <p className="text-xl font-light">4.2 <span className="text-xs">°C</span></p>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-emerald-500">
                  <FlaskConical className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Fat Content</span>
                </div>
                <p className="text-xl font-light">3.8 <span className="text-xs">%</span></p>
              </div>
            </div>

            <Separator className="my-4 text-gray-100" />

            {/* CIP Status Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  CIP Clean Status
                </h4>
                {cipData ? (
                   <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-normal">
                    Latest Passed
                   </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-400 font-normal italic">
                    Fetching...
                  </Badge>
                )}
              </div>

              {cipData && (
                <div className="p-4 bg-emerald-50 bg-opacity-50 border border-emerald-100 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Timer className="w-3 h-3" /> Last Cleaned
                    </span>
                    <span className="text-xs font-medium text-emerald-800">{new Date(cipData.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Current Product</span>
                    <Badge variant="secondary" className="capitalize text-[10px] font-normal tracking-wide">
                      {cipData.product || "empty"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Recent History / Transfers Placeholder */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Recent Activity
              </h4>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-300 group-hover:bg-blue-500 transition-colors" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700">Volume Intake</span>
                        <span className="text-[10px] text-gray-400">{i * 2} hours ago</span>
                      </div>
                    </div>
                    <span className="text-xs font-light">+{2400 / i} L</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4 text-gray-100" />

            <div className="pt-4">
                <button 
                  onClick={() => onTransfer?.(silo)}
                  className="w-full py-4 bg-[#006BC4] text-white rounded-2xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                    <ArrowRightLeft className="w-5 h-5" />
                    Initiate Transfer
                </button>
            </div>
          </div>
        )}
            </div>
          </div>
      </SheetContent>
    </Sheet>
  )
}
