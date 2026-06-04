"use client"

import React, { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchCIPStatus, updateSilo } from "@/lib/store/slices/siloSlice"
import { Droplets, Thermometer, FlaskConical, ShieldCheck, Timer, ArrowRightLeft, Edit, Package, Check, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface SiloDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  silo: any | null
  onTransfer?: (silo: any) => void
  onEdit?: (silo: any) => void
}

export function SiloDetailsDrawer({
  open,
  onOpenChange,
  silo,
  onTransfer,
  onEdit,
}: SiloDetailsDrawerProps) {
  const dispatch = useAppDispatch()
  const cipStatuses = useAppSelector((state) => state.silo.cipStatuses)
  const cipData = silo ? cipStatuses[silo.name] : null
  const [editingProduct, setEditingProduct] = useState(false)
  const [productValue, setProductValue] = useState("")

  useEffect(() => {
    if (open && silo) {
      dispatch(fetchCIPStatus(silo.name))
      setProductValue(silo.product ?? "")
      setEditingProduct(false)
    }
  }, [open, silo, dispatch])

  const saveProduct = async () => {
    if (!silo) return
    try {
      await dispatch(updateSilo({ ...silo, product: productValue || null })).unwrap()
      toast.success("Product updated")
      setEditingProduct(false)
    } catch {
      toast.error("Failed to update product")
    }
  }

  const cancelEdit = () => {
    setProductValue(silo?.product ?? "")
    setEditingProduct(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col border-l-0 shadow-2xl">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-10">
            <SheetHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-light">{silo?.name || "Silo Details"}</SheetTitle>
            <div className="flex items-center gap-2">
              {silo?.status && (
                <Badge variant={silo.status === 'active' ? 'default' : 'secondary'} className="rounded-full px-3">
                  {silo.status}
                </Badge>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(silo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#006BC4] text-white rounded-full hover:bg-[#005ba6] transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>
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
                <p className="text-xl font-light">
                  {silo.temperature != null ? <>{silo.temperature} <span className="text-xs">°C</span></> : <span className="text-sm text-gray-400">N/A</span>}
                </p>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-emerald-500">
                  <FlaskConical className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Fat Content</span>
                </div>
                <p className="text-xl font-light">
                  {silo.fat_content != null ? <>{silo.fat_content} <span className="text-xs">%</span></> : <span className="text-sm text-gray-400">N/A</span>}
                </p>
              </div>
            </div>

            <Separator className="my-4 text-gray-100" />

            {/* Current Product */}
            <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-500">
                  <Package className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Current Product</span>
                </div>
                {!editingProduct && (
                  <button
                    onClick={() => setEditingProduct(true)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {editingProduct ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={productValue}
                    onChange={(e) => setProductValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveProduct(); if (e.key === "Escape") cancelEdit() }}
                    placeholder="e.g. Whole Milk"
                  />
                  <button onClick={saveProduct} className="p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={cancelEdit} className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xl font-light capitalize">
                  {productValue || <span className="text-sm text-gray-400">Not set</span>}
                </p>
              )}
            </div>

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
                <div className="p-4 bg-emerald-50 bg-opacity-50 border border-emerald-100 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Timer className="w-3 h-3" /> Last Cleaned
                    </span>
                    <span className="text-xs font-medium text-emerald-800">{new Date(cipData.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
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
